"""RQ1: next-event models (Markov, classical ML, GRU)."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np
import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

from ml.pipeline.build_features import CODE_TO_EVENT, EVENT_ORDER
from ml.pipeline.metrics_utils import classification_metrics, top3_accuracy


class MarkovChain:
    def __init__(self):
        self.transitions: Dict[int, Dict[int, int]] = {}

    def fit(self, sequences: List[List[int]]):
        for seq in sequences:
            for i in range(len(seq) - 1):
                a, b = seq[i], seq[i + 1]
                if a not in self.transitions:
                    self.transitions[a] = {}
                self.transitions[a][b] = self.transitions[a].get(b, 0) + 1

    def predict_proba_row(self, last_code: int, n_classes: int = 3) -> np.ndarray:
        counts = self.transitions.get(last_code, {})
        total = sum(counts.values())
        probs = np.zeros(n_classes)
        if total == 0:
            probs[:] = 1.0 / n_classes
            return probs
        for nxt, c in counts.items():
            if nxt < n_classes:
                probs[nxt] = c / total
        if probs.sum() == 0:
            probs[:] = 1.0 / n_classes
        return probs

    def predict_batch(self, sequences: List[List[int]], n_classes: int = 3) -> Tuple[np.ndarray, np.ndarray]:
        probs = []
        preds = []
        for seq in sequences:
            last = seq[-1] if seq else 0
            p = self.predict_proba_row(last, n_classes)
            probs.append(p)
            preds.append(int(np.argmax(p)))
        return np.array(preds), np.array(probs)


def _sequence_summary_features(sequences: List[List[int]]) -> np.ndarray:
    rows = []
    for seq in sequences:
        if not seq:
            rows.append([0, 0, 0, 0, 0])
            continue
        arr = np.array(seq)
        rows.append(
            [
                len(seq),
                float(np.mean(arr)),
                float(np.std(arr)),
                float((arr == 0).mean()),
                float((arr == 1).mean()),
            ]
        )
    return np.array(rows)


class EventGRU(nn.Module):
    def __init__(self, n_classes: int = 3, embed_dim: int = 16, hidden: int = 32):
        super().__init__()
        self.embed = nn.Embedding(n_classes, embed_dim)
        self.gru = nn.GRU(embed_dim, hidden, batch_first=True)
        self.fc = nn.Linear(hidden, n_classes)

    def forward(self, x):
        emb = self.embed(x)
        out, _ = self.gru(emb)
        return self.fc(out[:, -1, :])

    def encode(self, x):
        emb = self.embed(x)
        _, h = self.gru(emb)
        return h.squeeze(0)


def _pad_sequences(sequences: List[List[int]], max_len: int = 50) -> np.ndarray:
    padded = np.zeros((len(sequences), max_len), dtype=np.int64)
    for i, seq in enumerate(sequences):
        tail = seq[-max_len:]
        padded[i, -len(tail) :] = tail
    return padded


def train_gru_next_event(
    train_seqs: List[List[int]],
    y_train: np.ndarray,
    test_seqs: List[List[int]],
    y_test: np.ndarray,
    max_len: int = 50,
    epochs: int = 5,
    max_train: int = 100_000,
) -> Tuple[Dict[str, Any], EventGRU]:
    if len(train_seqs) > max_train:
        idx = np.random.default_rng(42).choice(len(train_seqs), max_train, replace=False)
        train_seqs = [train_seqs[i] for i in idx]
        y_train = y_train[idx]

    device = torch.device("cpu")
    model = EventGRU().to(device)
    opt = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_fn = nn.CrossEntropyLoss()

    X_train = torch.tensor(_pad_sequences(train_seqs, max_len), device=device)
    y_t = torch.tensor(y_train, dtype=torch.long, device=device)

    model.train()
    batch = 512
    for _ in range(epochs):
        for start in range(0, len(X_train), batch):
            xb = X_train[start : start + batch]
            yb = y_t[start : start + batch]
            opt.zero_grad()
            logits = model(xb)
            loss = loss_fn(logits, yb)
            loss.backward()
            opt.step()

    model.eval()
    with torch.no_grad():
        X_test = torch.tensor(_pad_sequences(test_seqs, max_len), device=device)
        logits = model(X_test)
        prob = torch.softmax(logits, dim=1).cpu().numpy()
        pred = prob.argmax(axis=1)

    labels = np.arange(len(EVENT_ORDER))
    metrics = classification_metrics(y_test, pred, prob, average="macro", labels=labels)
    metrics["top3_accuracy"] = top3_accuracy(y_test, prob, labels)
    return metrics, model


def run_rq1_next_event(
    train_ids: np.ndarray,
    test_ids: np.ndarray,
    sequences: Dict[int, List[int]],
    y_next: np.ndarray,
    next_mask: np.ndarray,
    visitor_ids: np.ndarray,
) -> Dict[str, Any]:
    id_to_idx = {int(v): i for i, v in enumerate(visitor_ids)}
    train_idx = [id_to_idx[int(v)] for v in train_ids if next_mask[id_to_idx[int(v)]]]
    test_idx = [id_to_idx[int(v)] for v in test_ids if next_mask[id_to_idx[int(v)]]]

    train_vids = [int(visitor_ids[i]) for i in train_idx]
    test_vids = [int(visitor_ids[i]) for i in test_idx]
    train_seqs = [sequences[v] for v in train_vids]
    test_seqs = [sequences[v] for v in test_vids]
    y_train = y_next[train_idx]
    y_test = y_next[test_idx]

    results: Dict[str, Any] = {"n_train": len(y_train), "n_test": len(y_test)}
    labels = np.arange(len(EVENT_ORDER))

    markov = MarkovChain()
    markov.fit(train_seqs)
    mk_pred, mk_prob = markov.predict_batch(test_seqs)
    results["markov"] = classification_metrics(y_test, mk_pred, mk_prob, average="macro", labels=labels)
    results["markov"]["top3_accuracy"] = top3_accuracy(y_test, mk_prob, labels)

    X_train_sum = _sequence_summary_features(train_seqs)
    X_test_sum = _sequence_summary_features(test_seqs)

    for name, clf in [
        ("logistic_regression", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ("random_forest", RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, class_weight="balanced")),
        ("xgboost", XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, eval_metric="mlogloss")),
    ]:
        clf.fit(X_train_sum, y_train)
        pred = clf.predict(X_test_sum)
        prob = clf.predict_proba(X_test_sum)
        results[name] = classification_metrics(y_test, pred, prob, average="macro", labels=labels)
        results[name]["top3_accuracy"] = top3_accuracy(y_test, prob, labels)

    gru_metrics, gru_model = train_gru_next_event(train_seqs, y_train, test_seqs, y_test)
    results["gru"] = gru_metrics

    champion = max(
        ["markov", "logistic_regression", "random_forest", "xgboost", "gru"],
        key=lambda k: results[k]["f1"],
    )
    results["champion"] = champion
    results["markov_model"] = markov
    results["gru_model"] = gru_model
    return results

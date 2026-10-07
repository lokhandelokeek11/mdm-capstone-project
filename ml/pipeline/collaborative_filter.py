"""Item-item collaborative filtering from cart/purchase co-occurrence."""

from __future__ import annotations

from collections import defaultdict
from typing import Dict, List, Tuple

import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity


def build_item_similarity(
    item_histories: Dict[int, List[int]],
    max_items: int = 5000,
) -> Tuple[Dict[int, int], csr_matrix, np.ndarray]:
    item_counts: Dict[int, int] = defaultdict(int)
    for items in item_histories.values():
        for it in items:
            item_counts[it] += 1
    top_items = sorted(item_counts.keys(), key=lambda k: item_counts[k], reverse=True)[:max_items]
    item_to_idx = {it: i for i, it in enumerate(top_items)}

    rows, cols = [], []
    for items in item_histories.values():
        idxs = sorted({item_to_idx[it] for it in items if it in item_to_idx})
        for i in idxs:
            rows.append(i)
            cols.append(i)
        for i in idxs:
            for j in idxs:
                if i != j:
                    rows.append(i)
                    cols.append(j)

    if not rows:
        mat = csr_matrix((1, 1))
        return item_to_idx, mat, np.array([[1.0]])

    data = np.ones(len(rows))
    mat = csr_matrix((data, (rows, cols)), shape=(len(top_items), len(top_items)))
    sim = cosine_similarity(mat)
    return item_to_idx, mat, sim


def recommend_items(
    visitor_items: List[int],
    item_to_idx: Dict[int, int],
    sim: np.ndarray,
    top_k: int = 3,
) -> List[Tuple[int, float]]:
    scores: Dict[int, float] = defaultdict(float)
    idx_to_item = {v: k for k, v in item_to_idx.items()}
    for it in visitor_items:
        if it not in item_to_idx:
            continue
        i = item_to_idx[it]
        for j, s in enumerate(sim[i]):
            if j == i:
                continue
            item_id = idx_to_item.get(j)
            if item_id is not None:
                scores[item_id] += float(s)
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return ranked

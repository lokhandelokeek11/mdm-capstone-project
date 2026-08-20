import os
import sys
sys.path.append(r"C:\Users\lokha\AppData\Roaming\Python\Python313\site-packages")
import pandas as pd
import json

def main():
    events_path = os.path.join("data", "raw", "retailrocket", "events.csv")
    print(f"Loading top 50 visitor profiles from {events_path}...")
    
    # Read first 150k events
    df = pd.read_csv(events_path, nrows=150000)
    
    cust_stats = df.groupby('visitorid').agg(
        total_events=('event', 'count'),
        views=('event', lambda x: (x == 'view').sum()),
        carts=('event', lambda x: (x == 'addtocart').sum()),
        txs=('event', lambda x: (x == 'transaction').sum()),
        last_ts=('timestamp', 'max')
    ).reset_index()

    # Filter visitors with at least 2 events for rich display
    active_visitors = cust_stats[cust_stats['total_events'] >= 2].head(50)

    customers = []
    stages = ["INTENT", "PURCHASE", "CONSIDERATION", "AWARENESS", "INACTIVE", "RETENTION"]
    segments = ["Cart Abandoner", "Repeat Buyers", "Browsers", "High Intent", "Inactive", "High Value"]

    for idx, row in active_visitors.iterrows():
        vid = str(int(row['visitorid']))
        carts = int(row['carts'])
        txs = int(row['txs'])
        views = int(row['views'])
        
        if txs > 1:
            stage = "RETENTION"
            segment = "Repeat Buyers"
            status = "PURCHASED"
            propensity = min(98, 85 + txs * 3)
            engagement = min(99, 80 + views + carts * 5)
        elif txs == 1:
            stage = "PURCHASE"
            segment = "Buyers"
            status = "PURCHASED"
            propensity = min(95, 80 + carts * 4)
            engagement = min(95, 75 + views)
        elif carts > 0:
            stage = "INTENT"
            segment = "Cart Abandoner" if idx % 2 == 0 else "High Intent"
            status = "CART_ABANDONED" if idx % 2 == 0 else "NOT_PURCHASED"
            propensity = min(88, 65 + carts * 8 + views)
            engagement = min(90, 60 + views * 3)
        else:
            stage = "CONSIDERATION" if views > 3 else "AWARENESS"
            segment = "Browsers"
            status = "NOT_PURCHASED"
            propensity = min(55, 20 + views * 4)
            engagement = min(75, 30 + views * 3)

        customers.append({
            "id": f"c_{vid}",
            "externalId": vid,
            "journeyStage": stage,
            "engagementScore": engagement,
            "purchasePropensity": propensity,
            "segment": segment,
            "lastActivity": "2026-08-20T10:30:00Z",
            "purchaseStatus": status,
            "name": f"Visitor #{vid}"
        })

    out_file = os.path.join("data", "artifacts", "50_customers.json")
    with open(out_file, "w") as f:
        json.dump(customers, f, indent=2)

    print(f"Successfully generated {len(customers)} real customer profiles to {out_file}")

if __name__ == "__main__":
    main()

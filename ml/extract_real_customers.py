import os
import sys
sys.path.append(r"C:\Users\lokha\AppData\Roaming\Python\Python313\site-packages")
import pandas as pd
import json

def main():
    events_path = os.path.join("data", "raw", "retailrocket", "events.csv")
    print(f"Reading {events_path}...")
    df = pd.read_csv(events_path, nrows=50000)

    # Find top visitors by activity and diversity
    visitor_stats = df.groupby('visitorid').agg(
        total_events=('event', 'count'),
        views=('event', lambda x: (x == 'view').sum()),
        carts=('event', lambda x: (x == 'addtocart').sum()),
        txs=('event', lambda x: (x == 'transaction').sum()),
        first_ts=('timestamp', 'min'),
        last_ts=('timestamp', 'max')
    ).reset_index()

    # Get sample visitors for each category: Cart Abandoners, Buyers, Browsers, Inactive
    abandoners = visitor_stats[(visitor_stats['carts'] > 0) & (visitor_stats['txs'] == 0)].head(4)
    buyers = visitor_stats[visitor_stats['txs'] > 0].head(4)
    browsers = visitor_stats[(visitor_stats['carts'] == 0) & (visitor_stats['txs'] == 0) & (visitor_stats['views'] > 5)].head(4)

    sample_df = pd.concat([abandoners, buyers, browsers]).head(10)
    print("Sample Real RetailRocket Visitors:")
    print(sample_df)

if __name__ == "__main__":
    main()

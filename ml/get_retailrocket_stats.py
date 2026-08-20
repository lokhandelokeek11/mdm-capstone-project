import os
import sys
sys.path.append(r"C:\Users\lokha\AppData\Roaming\Python\Python313\site-packages")
import pandas as pd

def main():
    path = os.path.join("data", "raw", "retailrocket", "events.csv")
    print(f"Reading {path}...")
    df = pd.read_csv(path)
    
    total_events = len(df)
    unique_visitors = df['visitorid'].nunique()
    views = (df['event'] == 'view').sum()
    carts = (df['event'] == 'addtocart').sum()
    txs = (df['event'] == 'transaction').sum()
    
    buyer_ids = set(df[df['event'] == 'transaction']['visitorid'])
    cart_ids = set(df[df['event'] == 'addtocart']['visitorid'])
    
    high_intent = len(cart_ids - buyer_ids)
    repeat_buyers = (df[df['event'] == 'transaction'].groupby('visitorid').size() > 1).sum()
    
    cart_abandonment_rate = round(((carts - txs) / carts) * 100, 1)
    conversion_rate = round((txs / total_events) * 100, 2)
    visitor_conversion_rate = round((len(buyer_ids) / unique_visitors) * 100, 2)
    
    print("-" * 50)
    print(f"Total Unique Customers (Visitors): {unique_visitors:,}")
    print(f"Total Events: {total_events:,}")
    print(f"Views: {views:,}")
    print(f"Carts: {carts:,}")
    print(f"Transactions (Purchases): {txs:,}")
    print(f"High Intent Customers (Cart Abandoners): {high_intent:,}")
    print(f"Repeat Buyers: {repeat_buyers:,}")
    print(f"Cart Abandonment Rate: {cart_abandonment_rate}%")
    print(f"Overall Event Conversion Rate: {conversion_rate}%")
    print(f"Visitor Conversion Rate: {visitor_conversion_rate}%")
    print("-" * 50)

if __name__ == "__main__":
    main()

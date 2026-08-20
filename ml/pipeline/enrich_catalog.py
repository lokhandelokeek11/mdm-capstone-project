import os
import pandas as pd

def load_and_enrich_catalog():
    raw_dir = os.path.join("data", "raw", "retailrocket")
    
    # 1. Load Category Tree
    cat_tree_path = os.path.join(raw_dir, "category_tree.csv")
    if os.path.exists(cat_tree_path):
        df_categories = pd.read_csv(cat_tree_path)
        print(f"[OK] Loaded Category Tree: {len(df_categories):,} categories")

    # 2. Extract Product Categories & Availability from Item Properties
    item_prop1_path = os.path.join(raw_dir, "item_properties_part1.csv")
    if os.path.exists(item_prop1_path):
        # Sample first 500k item properties for category & stock mapping
        df_props = pd.read_csv(item_prop1_path, nrows=500000)
        
        category_props = df_props[df_props['property'] == 'categoryid'][['itemid', 'value']].rename(columns={'value': 'category_id'})
        availability_props = df_props[df_props['property'] == 'available'][['itemid', 'value']].rename(columns={'value': 'is_available'})

        print(f"[OK] Extracted Product Categories: {len(category_props):,} item mappings")
        print(f"[OK] Extracted Stock Availability: {len(availability_props):,} stock status records")

if __name__ == "__main__":
    load_and_enrich_catalog()

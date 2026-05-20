#!/usr/bin/env python3
"""
Convert 'college database - Sheet 2.csv' → data/eapcet_data.json
Run from project root: python3 scripts/convert_csv.py
"""
import csv, json, os, re

SRC = os.path.join(os.path.dirname(__file__), '..', '..', 'college database - Sheet 2.csv')
DST = os.path.join(os.path.dirname(__file__), '..', 'data', 'eapcet_data.json')

os.makedirs(os.path.dirname(DST), exist_ok=True)

rows = []
with open(SRC, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Normalise keys (the CSV headers may have different casing/spaces)
        def g(key):
            for k in row:
                if k.strip().lower() == key.lower():
                    return row[k].strip() if row[k] else ''
            return ''

        placement = g('Placement Rating')
        try:
            placement_val = float(placement) if placement and placement.upper() not in ('N/A', '-', '') else None
        except ValueError:
            placement_val = None

        # Clean fee: remove ₹ symbol etc.
        fee = g('Annual Fees').replace('₹', '').strip()
        if not fee:
            fee = '-'

        rows.append({
            'college_name':     g('College Name'),
            'type':             g('Type'),
            'year':             int(g('Year')) if g('Year').isdigit() else None,
            'branch':           g('Branch'),
            'opening_rank':     g('Opening Rank') or '-',
            'closing_rank':     g('Closing Rank') or '-',
            'annual_fees':      fee,
            'placement_rating': placement_val,
            'location':         g('Location'),
        })

# Filter out rows with no year
rows = [r for r in rows if r['year'] is not None]

with open(DST, 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

print(f'Converted {len(rows)} rows → {DST}')

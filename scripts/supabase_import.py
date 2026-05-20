#!/usr/bin/env python3
"""Bulk import all 6243 rows to Supabase via REST API."""
import json, urllib.request, urllib.error, time

BASE = "/Users/charankumar/Documents/Personal-Projects/EAMCET college predictor/eapcet-predictor"
SUPABASE_URL = "https://rsxtraxrabtiqyiiiehk.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeHRyYXhyYWJ0aXF5aWlpZWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTYwNzQsImV4cCI6MjA5NDYzMjA3NH0.BOE-YrZoFuHcVIuX3KBxTpmt2OH2b3bVp9Flm9yowpE"

with open(f"{BASE}/data/eapcet_data.json") as f:
    data = json.load(f)

print(f"Total rows to import: {len(data)}")

# First truncate existing data (in case of partial prior inserts)
MGMT_URL = f"https://api.supabase.com/v1/projects/rsxtraxrabtiqyiiiehk/database/query"

endpoint = f"{SUPABASE_URL}/rest/v1/eapcet_cutoffs"
BATCH = 200
total_inserted = 0
failed_batches = []

for i in range(0, len(data), BATCH):
    chunk = data[i:i+BATCH]
    payload = json.dumps(chunk).encode('utf-8')
    
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            'apikey': ANON_KEY,
            'Authorization': f'Bearer {ANON_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            total_inserted += len(chunk)
            print(f"  Batch {i//BATCH + 1:02d}: ✅ {len(chunk)} rows  (total: {total_inserted})")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='replace')
        print(f"  Batch {i//BATCH + 1:02d}: ❌ HTTP {e.code} — {err_body[:200]}")
        failed_batches.append(i//BATCH + 1)
    except Exception as e:
        print(f"  Batch {i//BATCH + 1:02d}: ❌ Error — {e}")
        failed_batches.append(i//BATCH + 1)
    
    time.sleep(0.1)  # Small delay to avoid rate limiting

print(f"\n✅ Import complete: {total_inserted} / {len(data)} rows inserted")
if failed_batches:
    print(f"❌ Failed batches: {failed_batches}")

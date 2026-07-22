from pathlib import Path
import json, sys

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "data" / "mobilization-origins.json").read_text(encoding="utf-8"))
required = {"flow_id","mode","archival_label","map_label","charter_count","longitude","latitude","origin_type","geometry_note","source_id","source_locator","snapshot_date","destination_label"}
errors=[]
if len(data) != 55: errors.append(f"Expected 55 records, found {len(data)}")
ids=[row.get("flow_id") for row in data]
if len(ids) != len(set(ids)): errors.append("flow_id values are not unique")
for i,row in enumerate(data,1):
    missing=sorted(required-set(row))
    if missing: errors.append(f"Record {i} missing: {', '.join(missing)}")
    if row.get("mode") not in {"bus","train","plane"}: errors.append(f"Record {i} has invalid mode")
expected_counts={"bus":34,"train":10,"plane":11}
expected_totals={"bus":984,"train":21,"plane":14}
counts={mode:sum(1 for r in data if r["mode"]==mode) for mode in expected_counts}
totals={mode:sum(int(r["charter_count"]) for r in data if r["mode"]==mode) for mode in expected_totals}
if counts != expected_counts: errors.append(f"Mode record counts differ: {counts}")
if totals != expected_totals: errors.append(f"Charter totals differ: {totals}")
for rel in ["index.html","config.js","assets/convergence.css","assets/convergence.js","README.md","STORYMAP_EMBED_CHECKLIST.md"]:
    if not (root/rel).is_file(): errors.append(f"Missing file: {rel}")
if errors:
    print("VALIDATION FAILED")
    for error in errors: print("-",error)
    sys.exit(1)
print("VALIDATION PASSED")
print(f"Records: {len(data)}")
print(f"Mode records: {counts}")
print(f"Charter totals: {totals}")

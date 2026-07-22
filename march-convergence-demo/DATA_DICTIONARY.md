# Mobilization origins data dictionary

| Field | Type | Meaning |
|---|---|---|
| `flow_id` | text | Stable unique identifier for one origin-and-mode entry. |
| `mode` | text | `bus`, `train`, or `plane`. |
| `archival_label` | text | Label represented in the planning record. |
| `map_label` | text | Reader-facing clarification of the mapped anchor. |
| `charter_count` | integer | Number of chartered vehicles recorded for the entry. |
| `longitude` | number | Longitude of the representative map anchor. |
| `latitude` | number | Latitude of the representative map anchor. |
| `origin_type` | text | `city`, `state_or_region`, or `grouped_cities`. |
| `geometry_note` | text | Caveat explaining what the anchor and symbolic arc claim. |
| `source_id` | text | Stable project source identifier. |
| `source_locator` | text | Human-readable document locator. |
| `snapshot_date` | date text | Date of the planning memorandum, not a departure timestamp. |
| `destination_label` | text | Shared destination represented by the animation. |

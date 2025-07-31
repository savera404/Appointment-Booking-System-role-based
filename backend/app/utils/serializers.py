# backend/app/utils/serializers.py
from datetime import datetime

def serialize_mongo_doc(doc: dict) -> dict:
    if not doc:
        return None
    # # Ensure both 'id' and '_id' are present as string
    # doc['id'] = str(doc['_id'])
    # doc['_id'] = str(doc['_id'])
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    # Ensure fields exist
    for field in ["timestamp", "created_at", "updated_at"]:
        if field not in doc:
            doc[field] = None  # Ensure the key exists to satisfy Pydantic
        elif isinstance(doc[field], datetime):
            doc[field] = doc[field].isoformat()

    return doc

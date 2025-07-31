import re
import logging
from typing import Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase


specialty_synonyms = {
    "cardiologist": ["cardiologist", "cardiology", "heart doctor", "heart specialist"],
    "neurologist": ["neurologist", "neurology", "brain doctor", "nerve specialist"],
    "dermatologist": ["dermatologist", "dermatology", "skin doctor", "skin specialist"],
    "orthopedist": ["orthopedist", "orthopedics", "bone doctor", "joint specialist"],
    "psychiatrist": ["psychiatrist", "psychiatry", "mental health", "mental doctor"],
    "gastroenterologist": ["gastroenterologist", "gastroenterology", "stomach doctor", "digestive specialist"],
    "general": ["general practitioner", "gp", "family doctor", "primary care", "general physician"],
    "general practitioner": ["general practitioner", "gp", "family doctor", "primary care", "general physician"],
    "general physician": ["general practitioner", "gp", "family doctor", "primary care", "general physician"],
    "dentist": ["dentist", "dentistry", "dental"],
    "dentistry": ["dentist", "dentistry", "dental"],
    "pediatrician": ["pediatrician", "paediatrics", "pediatrics", "child specialist"],
    "paediatrics": ["pediatrician", "paediatrics", "pediatrics", "child specialist"],
    "pulmonologist": ["pulmonologist", "pulmonology", "pulmunology", "lung specialist", "breathing specialist"],
    "pulmunology": ["pulmonologist", "pulmonology", "pulmunology", "lung specialist", "breathing specialist"],
    "ent": ["ent specialist", "ear nose throat", "otolaryngologist"],
    "ent specialist": ["ent specialist", "ear nose throat", "otolaryngologist"]
}


def parse_search_query(search_query: str) -> Dict[str, str]:
    match = re.search(r"([a-zA-Z ]+) in ([a-zA-Z ]+)", search_query, re.I)
    if match:
        return {
            "specialty": match.group(1).strip(),
            "location": match.group(2).strip()
        }
    return {"specialty": search_query.strip(), "location": ""}


def get_specialty_regex(specialty: str) -> re.Pattern:
    if not specialty:
        return re.compile(".*", re.I)
    key = specialty.lower()
    synonyms = specialty_synonyms.get(key, [key])
    pattern = "|".join(re.escape(term) for term in synonyms)
    return re.compile(pattern, re.I)


class DoctorSearchService:

    async def search_doctors(self, db: AsyncIOMotorDatabase, search_query: str) -> Dict[str, Any]:
        try:
            parsed = parse_search_query(search_query)
            specialty = parsed["specialty"]
            location = parsed["location"]

            compound_filters = []
            if specialty:
                compound_filters.append({
                    "text": {"query": specialty, "path": "specialization"}
                })
            if location:
                compound_filters.append({
                    "text": {"query": location, "path": "location"}
                })

            pipeline = [
                {
                    "$search": {
                        "index": "default",
                        "compound": {
                            "must": compound_filters
                        }
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "name": 1,
                        "specialization": 1,
                        "location": 1,
                        "contact": 1,
                        "experience": 1,
                        "rating": 1,
                        "availability": 1,
                        "description": 1
                    }
                },
                {"$limit": 5}
            ]

            doctors_cursor = db["doctors"].aggregate(pipeline)
            doctors = await doctors_cursor.to_list(length=5)

            return {
                "success": True,
                "doctors": [
                    {
                        "id": str(doc["_id"]),
                        "name": doc["name"],
                        "specialization": doc["specialization"],
                        "location": doc["location"],
                        "contact": doc["contact"],
                        "experience": doc["experience"],
                        "rating": doc.get("rating"),
                        "availability": doc["availability"],
                        "description": doc.get("description")
                    } for doc in doctors
                ]
            }
        except Exception as e:
            logging.error(f"Mongo Atlas Search Error: {e}")
            return {"success": False, "doctors": [], "error": str(e)}

    async def fallback_search(self, db: AsyncIOMotorDatabase, search_query: str) -> Dict[str, Any]:
        try:
            parsed = parse_search_query(search_query)
            specialty = parsed["specialty"]
            location = parsed["location"]

            print(f"Fallback search - Parsed specialty: '{specialty}', location: '{location}'")

            # Build MongoDB query with proper regex syntax
            query_conditions = []
            
            # Add specialization search
            if specialty:
                specialty_regex = get_specialty_regex(specialty)
                print(f"Specialty regex pattern: {specialty_regex.pattern}")
                
                query_conditions.append({
                    "$or": [
                        {"specialization": {"$regex": specialty_regex.pattern, "$options": "i"}},
                        {"description": {"$regex": specialty_regex.pattern, "$options": "i"}}
                    ]
                })
            
            # Add location search if specified
            if location:
                query_conditions.append({"location": {"$regex": location, "$options": "i"}})
            
            # Build final query
            if query_conditions:
                query = {"$and": query_conditions} if len(query_conditions) > 1 else query_conditions[0]
            else:
                # If no specialty or location, return all doctors
                query = {}

            print(f"Fallback search query: {query}")
            
            doctors_cursor = db["doctors"].find(query).limit(5)
            doctors = await doctors_cursor.to_list(length=5)
            
            print(f"Found {len(doctors)} doctors in fallback search")

            return {
                "success": True,
                "doctors": [
                    {
                        "id": str(doc["_id"]),
                        "name": doc["name"],
                        "specialization": doc["specialization"],
                        "location": doc["location"],
                        "contact": doc["contact"],
                        "experience": doc["experience"],
                        "rating": doc.get("rating"),
                        "availability": doc["availability"],
                        "description": doc.get("description")
                    } for doc in doctors
                ]
            }
        except Exception as e:
            logging.error(f"Mongo Fallback Search Error: {e}")
            return {"success": False, "doctors": [], "error": str(e)}

    async def get_available_time_slots(self, db: AsyncIOMotorDatabase, doctor_id: str) -> Dict[str, Any]:
        try:
            logging.debug(f"[get_available_time_slots] doctor_id received: {doctor_id}")
            logging.debug(f"[get_available_time_slots] Using collection: availabilities")

            # Get current date and time for filtering (using UTC to avoid timezone issues)
            from datetime import datetime, date, timezone
            current_utc = datetime.now(timezone.utc)
            current_date = current_utc.date().isoformat()
            current_time = current_utc.strftime("%H:%M")
            
            logging.debug(f"[get_available_time_slots] Current UTC date: {current_date}, Current UTC time: {current_time}")

            # Build query to filter out past dates and booked slots
            query = {
                "doctorId": doctor_id,
                "status": "Available",
                "$or": [
                    # Future dates
                    {"date": {"$gt": current_date}},
                    # Today's date but future time slots
                    {
                        "date": current_date,
                        "startTime": {"$gt": current_time}
                    }
                ]
            }

            slots_cursor = db["availabilities"].find(query).sort([("date", 1), ("startTime", 1)])
            slots = await slots_cursor.to_list(length=50)

            logging.debug(f"[get_available_time_slots] Found {len(slots)} available future slots for doctor_id={doctor_id}")

            return {
                "success": True,
                "timeSlots": [
                    {
                        "id": str(slot["_id"]),
                        "doctorId": slot["doctorId"],
                        "doctorName": slot["doctorName"],
                        "date": slot["date"],
                        "startTime": slot["startTime"],
                        "endTime": slot["endTime"],
                        "status": slot["status"]
                    } for slot in slots
                ]
            }
        except Exception as e:
            logging.error(f"[get_available_time_slots] Mongo Get Time Slots Error: {e}")
            return {"success": False, "timeSlots": [], "error": str(e)}
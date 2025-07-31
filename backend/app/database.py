import certifi
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


from app.config.settings import settings

# Use certifi to provide CA certificates
ca = certifi.where()

# Asynchronous DB client for normal operations (Motor)
client = AsyncIOMotorClient(
    settings.MONGO_URI,
    tls=True,
    tlsCAFile=ca
)
db = client[settings.MONGO_DB_NAME]

# Synchronous DB client for GridFS (binary files only)
sync_client = MongoClient(
    settings.MONGO_URI,
    tls=True,
    tlsCAFile=ca
)
sync_db = sync_client[settings.MONGO_DB_NAME]

def get_db() -> AsyncIOMotorDatabase:
    return db

def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance. Alias for get_db() for consistency."""
    return db


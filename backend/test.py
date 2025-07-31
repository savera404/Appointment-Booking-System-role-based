from pymongo import MongoClient
from app.config.settings import settings

uri = "mongodb+srv://fatimabintetanveer:9dBaWK7jkK72hQkU@cluster0.kaqsgsm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)

try:
    print(client.list_database_names())
except Exception as e:
    print("❌ Connection failed:", e)



print("✅ Mongo URI:", settings.MONGO_URI)
print("✅ Mongo DB Name:", settings.MONGO_DB_NAME)
print("✅ OpenAI Endpoint:", settings.AZURE_OPENAI_ENDPOINT)
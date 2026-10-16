import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()  

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI missing from env")

client = MongoClient(MONGO_URI)

db = client["hackathon_db"] 

phones = db["phones"] # Temp collection to test

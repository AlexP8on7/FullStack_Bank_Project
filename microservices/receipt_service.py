from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI(title="Receipt Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["bam_bank"]
receipts_collection = db["receipts"]

class Receipt(BaseModel):
    id: Optional[str] = None
    customer_id: int
    amount: float
    transaction_type: str
    timestamp: str

@app.get("/receipts")
def get_receipts():
    receipts = list(receipts_collection.find())
    for receipt in receipts:
        receipt["id"] = str(receipt["_id"])
        del receipt["_id"]
    return receipts

@app.post("/receipts")
def create_receipt(receipt: Receipt):
    receipt_dict = receipt.dict()
    if "id" in receipt_dict:
        del receipt_dict["id"]
    result = receipts_collection.insert_one(receipt_dict)
    return {"message": "Receipt created", "id": str(result.inserted_id)}

@app.get("/receipts/{customer_id}")
def get_receipts_by_customer(customer_id: str):
    # Convert ObjectId string to customer number for lookup
    try:
        from bson import ObjectId
        # Count documents up to this ObjectId to get customer number
        obj_id = ObjectId(customer_id)
        customer_num = receipts_collection.count_documents({"customer_id": {"$exists": True}}) + 1
        
        # Try to find receipts with this customer number
        receipts = list(receipts_collection.find({"customer_id": customer_num}))
        for receipt in receipts:
            receipt["id"] = str(receipt["_id"])
            del receipt["_id"]
        return receipts
    except:
        return []

@app.get("/receipt/getRec/{iban}")
def get_receipts_by_iban(iban: str):
    if iban.startswith("ACC"):
        try:
            customer_id = int(iban[3:])
            receipts = list(receipts_collection.find({"customer_id": customer_id}))
            for receipt in receipts:
                receipt["id"] = str(receipt["_id"])
                del receipt["_id"]
            return receipts
        except:
            return []
    return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import requests
import datetime
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI(title="Bank Service")

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
accounts_collection = db["accounts"]

class BankAccount(BaseModel):
    id: Optional[str] = None
    customer_id: int
    balance: float = 0.0
    account_number: str

class TransactionAmount(BaseModel):
    amount: float

@app.get("/accounts")
def get_accounts():
    accounts = list(accounts_collection.find())
    for account in accounts:
        account["id"] = str(account["_id"])
        del account["_id"]
    return accounts

@app.post("/accounts")
def create_account(account: BankAccount):
    account_dict = account.dict()
    del account_dict["id"]
    result = accounts_collection.insert_one(account_dict)
    account_dict["id"] = str(result.inserted_id)
    return {"message": "Account created", "account": account_dict}

@app.get("/accounts/{customer_id}")
def get_account_by_customer(customer_id: int):
    account = accounts_collection.find_one({"customer_id": customer_id})
    if account:
        account["id"] = str(account["_id"])
        del account["_id"]
        return account
    return {"error": "Account not found"}

@app.post("/accounts/{customer_id}/deposit")
def deposit_funds(customer_id: int, transaction: TransactionAmount):
    result = accounts_collection.update_one(
        {"customer_id": customer_id},
        {"$inc": {"balance": transaction.amount}}
    )
    if result.modified_count > 0:
        # Create receipt
        try:
            import datetime
            requests.post("http://localhost:8082/receipts", json={
                "customer_id": customer_id,
                "amount": transaction.amount,
                "transaction_type": "deposit",
                "timestamp": datetime.datetime.now().isoformat()
            })
        except:
            pass
        return {"message": "Deposit successful"}
    return {"error": "Account not found"}

@app.post("/accounts/{customer_id}/withdraw")
def withdraw_funds(customer_id: int, transaction: TransactionAmount):
    account = accounts_collection.find_one({"customer_id": customer_id})
    if account and account["balance"] >= transaction.amount:
        accounts_collection.update_one(
            {"customer_id": customer_id},
            {"$inc": {"balance": -transaction.amount}}
        )
        # Create receipt
        try:
            import datetime
            requests.post("http://localhost:8082/receipts", json={
                "customer_id": customer_id,
                "amount": transaction.amount,
                "transaction_type": "withdraw",
                "timestamp": datetime.datetime.now().isoformat()
            })
        except:
            pass
        return {"message": "Withdrawal successful"}
    return {"error": "Insufficient funds or account not found"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)
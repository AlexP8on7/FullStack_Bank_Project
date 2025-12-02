from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import requests
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI(title="Customer Service")

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
customers_collection = db["customers"]

class Customer(BaseModel):
    id: Optional[str] = None
    name: str
    username: str
    password: str
    age: int
    email: str
    phonenm: str
    address: str

class UpdateField(BaseModel):
    value: str

@app.get("/customers")
def get_customers():
    customers = list(customers_collection.find())
    for customer in customers:
        customer["id"] = str(customer["_id"])
        del customer["_id"]
    return customers

@app.post("/customer/createCustomer")
def create_customer(customer: Customer):
    # Check if username already exists
    existing = customers_collection.find_one({"username": customer.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    customer_dict = customer.dict()
    del customer_dict["id"]
    result = customers_collection.insert_one(customer_dict)
    customer_id = customers_collection.count_documents({})
    
    # Create bank account
    try:
        requests.post("http://localhost:8081/accounts", json={
            "customer_id": customer_id,
            "balance": 0.0,
            "account_number": f"ACC{customer_id:06d}"
        })
    except:
        pass  # Bank service might not be running
    
    return 1

@app.get("/customer/login/{username}/{password}")
def login_customer(username: str, password: str):
    customer = customers_collection.find_one({"username": username, "password": password})
    if customer:
        customer_id = str(customer["_id"])
        customer["id"] = customer_id
        del customer["_id"]
        
        print(f"Login successful for user {username} with ID: {customer_id}")
        
        # Get account info
        try:
            customer_count = customers_collection.count_documents({"_id": {"$lte": ObjectId(customer_id)}})
            account_response = requests.get(f"http://localhost:8081/accounts/{customer_count}")
            account_data = account_response.json() if account_response.status_code == 200 else {}
        except:
            customer_count = customers_collection.count_documents({"_id": {"$lte": ObjectId(customer_id)}})
            account_data = {"balance": 0.0, "account_number": f"ACC{customer_count:06d}"}
        
        # Add iban field to customer data
        customer["iban"] = account_data.get("account_number", f"ACC{customer_count:06d}")
        customer["balance"] = account_data.get("balance", 0.0)
        
        return [customer, account_data]
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.put("/customer/update/{customer_id}/{field}")
def update_customer_field(customer_id: str, field: str, update_data: UpdateField):
    try:
        result = customers_collection.update_one(
            {"_id": ObjectId(customer_id)},
            {"$set": {field: update_data.value}}
        )
        if result.modified_count > 0:
            return {"message": f"{field.capitalize()} updated"}
        return {"error": "Customer not found"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/customer/transaction/{customer_id}/{transaction_type}/{amount}")
def simple_transaction(customer_id: str, transaction_type: str, amount: float):
    try:
        # Convert string ID to int for bank service
        cust_id = customers_collection.count_documents({"_id": {"$lte": ObjectId(customer_id)}})
        
        if transaction_type == "deposit":
            response = requests.post(f"http://localhost:8081/accounts/{cust_id}/deposit", 
                                   json={"amount": amount})
        else:
            response = requests.post(f"http://localhost:8081/accounts/{cust_id}/withdraw", 
                                   json={"amount": amount})
        
        if response.status_code == 200:
            return {"message": f"{transaction_type.capitalize()} successful"}
        else:
            raise HTTPException(status_code=400, detail=f"{transaction_type.capitalize()} failed")
    except:
        raise HTTPException(status_code=500, detail="Service unavailable")

@app.put("/customer/transfer/{from_iban}/{to_iban}/{amount}")
def transfer_funds(from_iban: str, to_iban: str, amount: float):
    # Extract customer IDs from IBANs
    try:
        from_customer_id = int(from_iban[3:]) if from_iban.startswith("ACC") else None
        to_customer_id = int(to_iban[3:]) if to_iban.startswith("ACC") else None
        
        if not from_customer_id or not to_customer_id:
            raise HTTPException(status_code=400, detail="Invalid IBAN format")
        
        # Withdraw from sender
        withdraw_response = requests.post(f"http://localhost:8081/accounts/{from_customer_id}/withdraw", 
                                        json={"amount": amount})
        
        if withdraw_response.status_code == 200:
            # Deposit to receiver
            deposit_response = requests.post(f"http://localhost:8081/accounts/{to_customer_id}/deposit", 
                                           json={"amount": amount})
            
            if deposit_response.status_code == 200:
                # Create receipts for both parties
                try:
                    import datetime
                    timestamp = datetime.datetime.now().isoformat()
                    
                    # Receipt for sender (outgoing transfer)
                    requests.post("http://localhost:8082/receipts", json={
                        "customer_id": from_customer_id,
                        "amount": -amount,
                        "transaction_type": "transfer_out",
                        "timestamp": timestamp
                    })
                    
                    # Receipt for receiver (incoming transfer)
                    requests.post("http://localhost:8082/receipts", json={
                        "customer_id": to_customer_id,
                        "amount": amount,
                        "transaction_type": "transfer_in",
                        "timestamp": timestamp
                    })
                except:
                    pass
                
                return {"message": "Transfer successful"}
            else:
                # Rollback - deposit back to sender
                requests.post(f"http://localhost:8081/accounts/{from_customer_id}/deposit", 
                            json={"amount": amount})
                raise HTTPException(status_code=400, detail="Transfer failed - recipient account error")
        else:
            raise HTTPException(status_code=400, detail="Insufficient funds or sender account error")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Transfer service unavailable")

@app.delete("/customer/deleteAcc/{customer_id}")
def delete_account(customer_id: str):
    try:
        print(f"Attempting to delete customer with ID: {customer_id}")
        
        # Debug: Check what customers exist
        all_customers = list(customers_collection.find({}, {"_id": 1, "username": 1}))
        print(f"All customers in DB: {[(str(c['_id']), c.get('username', 'N/A')) for c in all_customers]}")
        
        # Validate ObjectId format
        if not ObjectId.is_valid(customer_id):
            print(f"Invalid ObjectId format: {customer_id}")
            raise HTTPException(status_code=400, detail="Invalid customer ID format")
        
        # Check if customer exists first
        existing_customer = customers_collection.find_one({"_id": ObjectId(customer_id)})
        print(f"Customer exists check: {existing_customer is not None}")
        
        # Delete the customer
        result = customers_collection.delete_one({"_id": ObjectId(customer_id)})
        print(f"Delete result: {result.deleted_count} documents deleted")
        
        if result.deleted_count > 0:
            print(f"Successfully deleted customer with ID: {customer_id}")
            return {"message": "Account deleted successfully"}
        else:
            print(f"No customer found with ID: {customer_id}")
            raise HTTPException(status_code=404, detail="Customer not found")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
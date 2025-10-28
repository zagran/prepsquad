from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
import uuid

app = FastAPI(title="PrepSquad API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for simplicity
users = {}
groups = {}

# Pydantic models for request validation
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

class CreateGroup(BaseModel):
    name: str
    description: Optional[str] = ""
    prep_type: str
    user_id: str

class JoinGroup(BaseModel):
    user_id: str

class GroupResponse(BaseModel):
    id: str
    name: str
    description: str
    prep_type: str
    creator_id: str
    members: List[str]
    created_at: str

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "PrepSquad API is running"}

# User registration endpoint
@app.post("/api/auth/register", status_code=201)
async def register(user_data: UserRegister):
    if user_data.email in users:
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = str(uuid.uuid4())
    users[user_data.email] = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": user_data.password,  # In production, hash this!
        "created_at": datetime.now().isoformat()
    }

    return {
        "message": "User registered successfully",
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name
        }
    }

# User login endpoint
@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = users.get(credentials.email)
    if not user or user['password'] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }

# Create a new group
@app.post("/api/groups", status_code=201)
async def create_group(group_data: CreateGroup):
    group_id = str(uuid.uuid4())
    groups[group_id] = {
        "id": group_id,
        "name": group_data.name,
        "description": group_data.description or "",
        "prep_type": group_data.prep_type,
        "creator_id": group_data.user_id,
        "members": [group_data.user_id],
        "created_at": datetime.now().isoformat()
    }

    return {
        "message": "Group created successfully",
        "group": groups[group_id]
    }

# Get all groups
@app.get("/api/groups")
async def get_groups(prep_type: Optional[str] = Query(None)):
    filtered_groups = list(groups.values())
    if prep_type:
        filtered_groups = [g for g in filtered_groups if g['prep_type'] == prep_type]

    return {"groups": filtered_groups}

# Join a group
@app.post("/api/groups/{group_id}/join")
async def join_group(group_id: str, join_data: JoinGroup):
    group = groups.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if join_data.user_id not in group['members']:
        group['members'].append(join_data.user_id)

    return {
        "message": "Joined group successfully",
        "group": group
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

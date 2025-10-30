from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
import bcrypt
import uuid

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()

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

# Helper functions for password hashing with bcrypt
def get_password_hash(password: str) -> str:
    # Convert password to bytes and hash it
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Convert both to bytes for comparison
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    # Find user by ID
    user = None
    for u in users.values():
        if u["id"] == user_id:
            user = u
            break

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

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

class GroupResponse(BaseModel):
    id: str
    name: str
    description: str
    prep_type: str
    creator_id: str
    members: List[str]
    created_at: str

class UserProfileUpdate(BaseModel):
    bio: Optional[str] = ""
    avatar_url: Optional[str] = ""
    skills: Optional[List[str]] = []
    prep_goals: Optional[List[str]] = []
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""

class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    bio: str
    avatar_url: str
    skills: List[str]
    prep_goals: List[str]
    linkedin_url: str
    github_url: str
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
    hashed_password = get_password_hash(user_data.password)

    users[user_data.email] = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password,
        "bio": "",
        "avatar_url": "",
        "skills": [],
        "prep_goals": [],
        "linkedin_url": "",
        "github_url": "",
        "created_at": datetime.now().isoformat()
    }

    # Create JWT token
    access_token = create_access_token(data={"sub": user_id})

    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
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
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT token
    access_token = create_access_token(data={"sub": user["id"]})

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"]
        }
    }

# Get current user (validate token)
@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user["name"]
        }
    }

# Create a new group
@app.post("/api/groups", status_code=201)
async def create_group(group_data: CreateGroup, current_user: dict = Depends(get_current_user)):
    group_id = str(uuid.uuid4())
    user_id = current_user["id"]

    groups[group_id] = {
        "id": group_id,
        "name": group_data.name,
        "description": group_data.description or "",
        "prep_type": group_data.prep_type,
        "creator_id": user_id,
        "members": [user_id],
        "created_at": datetime.now().isoformat()
    }

    return {
        "message": "Group created successfully",
        "group": groups[group_id]
    }

# Get all groups
@app.get("/api/groups")
async def get_groups(prep_type: Optional[str] = Query(None), current_user: dict = Depends(get_current_user)):
    filtered_groups = list(groups.values())
    if prep_type:
        filtered_groups = [g for g in filtered_groups if g['prep_type'] == prep_type]

    return {"groups": filtered_groups}

# Join a group
@app.post("/api/groups/{group_id}/join")
async def join_group(group_id: str, current_user: dict = Depends(get_current_user)):
    group = groups.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user_id = current_user["id"]
    if user_id not in group['members']:
        group['members'].append(user_id)

    return {
        "message": "Joined group successfully",
        "group": group
    }

# Get user profile by user ID
@app.get("/api/users/{user_id}/profile")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    # Find user by ID
    target_user = None
    for user in users.values():
        if user["id"] == user_id:
            target_user = user
            break

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return profile without password
    return {
        "profile": {
            "id": target_user["id"],
            "email": target_user["email"],
            "name": target_user["name"],
            "bio": target_user.get("bio", ""),
            "avatar_url": target_user.get("avatar_url", ""),
            "skills": target_user.get("skills", []),
            "prep_goals": target_user.get("prep_goals", []),
            "linkedin_url": target_user.get("linkedin_url", ""),
            "github_url": target_user.get("github_url", ""),
            "created_at": target_user["created_at"]
        }
    }

# Update current user's profile
@app.put("/api/users/profile")
async def update_profile(profile_data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]

    # Update profile fields
    if profile_data.bio is not None:
        users[user_email]["bio"] = profile_data.bio
    if profile_data.avatar_url is not None:
        users[user_email]["avatar_url"] = profile_data.avatar_url
    if profile_data.skills is not None:
        users[user_email]["skills"] = profile_data.skills
    if profile_data.prep_goals is not None:
        users[user_email]["prep_goals"] = profile_data.prep_goals
    if profile_data.linkedin_url is not None:
        users[user_email]["linkedin_url"] = profile_data.linkedin_url
    if profile_data.github_url is not None:
        users[user_email]["github_url"] = profile_data.github_url

    # Return updated profile
    updated_user = users[user_email]
    return {
        "message": "Profile updated successfully",
        "profile": {
            "id": updated_user["id"],
            "email": updated_user["email"],
            "name": updated_user["name"],
            "bio": updated_user["bio"],
            "avatar_url": updated_user["avatar_url"],
            "skills": updated_user["skills"],
            "prep_goals": updated_user["prep_goals"],
            "linkedin_url": updated_user["linkedin_url"],
            "github_url": updated_user["github_url"],
            "created_at": updated_user["created_at"]
        }
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# PrepSquad

A simple web application for creating and joining study groups for interview preparation (FAANG) and certification exams (AWS, GCP, Azure).

## Features

### User Management
- User registration and authentication with JWT
- User profiles with bio, skills, and preparation goals
- Social links (LinkedIn, GitHub)
- Avatar support

### Group Management
- Create study groups with comprehensive details:
  - Group name, description, and preparation type
  - Group goal and timeline
  - Requirements for candidates
  - Primary timezone
  - Weekly call schedule and timing
  - Maximum member limit
- Browse and filter available groups by preparation type
- View detailed group information (goal, timeline, timezone, calls, etc.)
- Request to join groups (pending approval workflow)
- Group registration status (open, closed, full)

### Group Admin Features
- Approve or reject pending member requests
- View pending and final members
- Manage group capacity
- Track group registration status

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Python + FastAPI
- **Storage**: In-memory (for simplicity)

## Project Structure

```
prepsquad/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateGroup.jsx
│   │   │   └── GroupList.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
└── backend/           # FastAPI backend
    ├── app.py
    └── requirements.txt
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.8+
- pip

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   python app.py
   # Or alternatively:
   uvicorn app:app --reload --port 5000
   ```

   The backend will be available at `http://localhost:5000`

   FastAPI automatic documentation is available at:
   - Swagger UI: `http://localhost:5000/docs`
   - ReDoc: `http://localhost:5000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Docker Setup (Recommended for Local Development)

The easiest way to run the application is using Docker Compose:

### Prerequisites
- Docker Desktop installed
- Docker Compose (included with Docker Desktop)

### Quick Start

1. **Start both services with one command:**
   ```bash
   docker compose up
   ```

   Or run in detached mode:
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. **Stop the services:**
   ```bash
   docker compose down
   ```

### Docker Commands

```bash
# Build images
docker compose build

# View logs
docker compose logs -f

# Restart a specific service
docker compose restart backend
docker compose restart frontend

# Execute commands in containers
docker compose exec backend python -c "print('Hello')"
docker compose exec frontend npm run build

# Remove volumes (reset data)
docker compose down -v
```

### Benefits of Docker Setup

- No need to install Node.js or Python locally
- Consistent development environment
- Hot reload enabled for both frontend and backend
- Easy to share and onboard new developers
- Isolated dependencies

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Register a new account or login
3. Create a study group or browse existing groups
4. Join groups that match your preparation goals
5. Filter groups by preparation type (FAANG, AWS, GCP, etc.)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Groups
- `GET /api/groups` - Get all groups (optional query param: `prep_type`)
- `POST /api/groups` - Create a new group with detailed information
- `POST /api/groups/:id/join` - Request to join a group (adds to pending members)
- `POST /api/groups/:group_id/approve/:user_id` - Approve a pending member (creator only)
- `POST /api/groups/:group_id/reject/:user_id` - Reject a pending member (creator only)

### User Profiles
- `GET /api/users/:user_id/profile` - View any user's profile
- `PUT /api/users/profile` - Update your own profile

### Health Check
- `GET /api/health` - Check API status

## Future Enhancements

- Add database persistence (PostgreSQL/MongoDB)
- Add real-time chat for groups
- Schedule study sessions with calendar integration
- Email notifications for join requests and approvals
- View other members' profiles within groups
- Profile completion percentage indicator
- User activity feed
- Group discussion boards
- Progress tracking and milestones
- Video call integration
- Resource sharing within groups
- Remove members from groups
- Close/reopen group registration
- Search functionality for groups

## Notes

This is a simple MVP implementation using FastAPI for the backend, which provides:
- Automatic API documentation (Swagger UI and ReDoc)
- Built-in data validation with Pydantic
- Type hints and better IDE support
- High performance with async/await support

In production, consider:
- Use proper password hashing (bcrypt or argon2)
- Implement JWT tokens for authentication
- Add proper database (PostgreSQL, MongoDB)
- Pydantic already handles input validation
- Implement rate limiting
- Add error logging
- Deploy with proper HTTPS

## AWS Deployment

This application is designed to be deployed on AWS:

- **Frontend**: S3 + CloudFront (static hosting)
- **Backend**: API Gateway + Lambda (serverless)

For detailed deployment instructions, see [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)

### Quick Deploy to AWS

**Backend (Lambda):**
```bash
cd backend
pip install -r requirements.txt -t package/
cp *.py package/
cd package && zip -r ../lambda.zip . && cd ..
# Upload lambda.zip to AWS Lambda
```

**Frontend (S3):**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name/
```

### Architecture Benefits

- **Scalability**: Auto-scales with traffic
- **Cost-Effective**: Pay only for what you use
- **High Availability**: Global CDN with CloudFront
- **Performance**: Edge locations worldwide
- **Security**: HTTPS, WAF, DDoS protection

## License

MIT

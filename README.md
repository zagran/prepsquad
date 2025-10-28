# PrepSquad

A simple web application for creating and joining study groups for interview preparation (FAANG) and certification exams (AWS, GCP, Azure).

## Features

- User registration and authentication
- Create study groups with different preparation types
- Browse and filter available groups
- Join existing study groups
- Track group membership

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

### Groups
- `GET /api/groups` - Get all groups (optional query param: `prep_type`)
- `POST /api/groups` - Create a new group
- `POST /api/groups/:id/join` - Join a group

### Health Check
- `GET /api/health` - Check API status

## Future Enhancements

- Add database persistence (PostgreSQL/MongoDB)
- Implement JWT authentication
- Add real-time chat for groups
- Schedule study sessions
- Add user profiles
- Implement group admin features
- Add email notifications
- Password hashing and security improvements

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

## License

MIT

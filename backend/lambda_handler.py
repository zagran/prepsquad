"""
AWS Lambda handler for the FastAPI application.
This file is used when deploying to AWS Lambda with API Gateway.
"""

from mangum import Mangum
from app import app

# Create the Lambda handler
handler = Mangum(app, lifespan="off")

# For testing locally, you can still run: python app.py
# For Lambda deployment, this handler will be invoked

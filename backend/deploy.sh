#!/bin/bash

# PrepSquad Backend Deployment Script for AWS Lambda

set -e

echo "🚀 PrepSquad Backend Deployment"
echo "================================"

# Check if AWS SAM is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI not found. Please install it first:"
    echo "   https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Ask for deployment confirmation
read -p "Deploy to AWS? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Build
echo "📦 Building Lambda package..."
sam build

# Deploy
echo "🚀 Deploying to AWS..."
if [ -f "samconfig.toml" ]; then
    # Use existing config
    sam deploy
else
    # First deployment - guided mode
    sam deploy --guided
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your API is now live. Check the Outputs section above for the API URL."
echo "Don't forget to update your frontend with the new API URL!"

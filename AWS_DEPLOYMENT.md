# AWS Deployment Guide

This guide explains how to deploy PrepSquad to AWS using S3+CloudFront for the frontend and API Gateway+Lambda for the backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                             │
│                                                          │
│  ┌──────────────┐         ┌────────────────┐           │
│  │              │         │                 │           │
│  │  CloudFront  │────────▶│  S3 Bucket      │           │
│  │  (CDN)       │         │  (Static Site)  │           │
│  │              │         │                 │           │
│  └──────────────┘         └────────────────┘           │
│         │                                                │
│         │ API Requests (/api/*)                         │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐         ┌────────────────┐           │
│  │              │         │                 │           │
│  │ API Gateway  │────────▶│  AWS Lambda     │           │
│  │ (REST API)   │         │  (FastAPI)      │           │
│  │              │         │                 │           │
│  └──────────────┘         └────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- AWS Account
- AWS CLI configured (`aws configure`)
- Node.js 20+
- Python 3.12+
- Docker (optional, for Lambda packaging)

## Backend Deployment (API Gateway + Lambda)

### Option 1: Using AWS SAM (Recommended)

1. **Install AWS SAM CLI**
   ```bash
   brew install aws-sam-cli  # macOS
   # or follow: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

2. **Create SAM template** (`backend/template.yaml`):
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Transform: AWS::Serverless-2016-10-31
   Description: PrepSquad Backend API

   Globals:
     Function:
       Timeout: 30
       Runtime: python3.12
       Environment:
         Variables:
           ENV: production

   Resources:
     PrepSquadAPI:
       Type: AWS::Serverless::Function
       Properties:
         FunctionName: prepsquad-api
         CodeUri: .
         Handler: lambda_handler.handler
         MemorySize: 512
         Events:
           ApiEvent:
             Type: HttpApi
             Properties:
               Path: /{proxy+}
               Method: ANY
               PayloadFormatVersion: "2.0"

   Outputs:
     ApiUrl:
       Description: "API Gateway endpoint URL"
       Value: !Sub "https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com/"
   ```

3. **Deploy with SAM**
   ```bash
   cd backend
   sam build
   sam deploy --guided
   ```

### Option 2: Manual Deployment

1. **Create deployment package**
   ```bash
   cd backend
   pip install -r requirements.txt -t package/
   cp *.py package/
   cd package
   zip -r ../deployment.zip .
   cd ..
   ```

2. **Create Lambda function**
   ```bash
   aws lambda create-function \
     --function-name prepsquad-api \
     --runtime python3.12 \
     --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
     --handler lambda_handler.handler \
     --zip-file fileb://deployment.zip \
     --timeout 30 \
     --memory-size 512
   ```

3. **Create API Gateway**
   - Go to AWS Console → API Gateway
   - Create HTTP API
   - Add integration to Lambda function
   - Configure CORS
   - Deploy to a stage

## Frontend Deployment (S3 + CloudFront)

### 1. Build the Frontend

```bash
cd frontend
npm install
npm run build
```

This creates optimized static files in `frontend/dist/`.

### 2. Create S3 Bucket

```bash
# Create bucket (must be globally unique name)
aws s3 mb s3://prepsquad-frontend-YOUR_NAME

# Enable static website hosting
aws s3 website s3://prepsquad-frontend-YOUR_NAME \
  --index-document index.html \
  --error-document index.html
```

### 3. Configure Bucket Policy

Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::prepsquad-frontend-YOUR_NAME/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket prepsquad-frontend-YOUR_NAME \
  --policy file://bucket-policy.json
```

### 4. Upload Files to S3

```bash
aws s3 sync dist/ s3://prepsquad-frontend-YOUR_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://prepsquad-frontend-YOUR_NAME/ \
  --cache-control "no-cache"
```

### 5. Create CloudFront Distribution

1. **Go to AWS Console → CloudFront → Create Distribution**

2. **Configure Origin:**
   - Origin Domain: Your S3 bucket website endpoint
   - Origin Protocol Policy: HTTP only

3. **Configure Default Cache Behavior:**
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD
   - Cache Policy: CachingOptimized

4. **Configure Settings:**
   - Price Class: Use Only North America and Europe (or as needed)
   - Default Root Object: `index.html`

5. **Add Custom Error Responses:**
   - 404 → /index.html (200) - for SPA routing
   - 403 → /index.html (200) - for SPA routing

6. **Create Distribution**

### 6. Update Frontend API URL

Update your frontend to use the API Gateway URL:

```javascript
// In Auth.jsx, CreateGroup.jsx, GroupList.jsx
const API_URL = 'https://YOUR_API_GATEWAY_URL/api'
```

Rebuild and redeploy:
```bash
npm run build
aws s3 sync dist/ s3://prepsquad-frontend-YOUR_NAME/ --delete
```

### 7. Invalidate CloudFront Cache (after updates)

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Environment Variables

For production, consider using:

**Backend:**
- AWS Systems Manager Parameter Store
- AWS Secrets Manager

**Frontend:**
- Environment variables at build time
- CloudFront Functions for dynamic config

## CI/CD Setup (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/setup-sam@v2
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: SAM Build and Deploy
        run: |
          cd backend
          sam build
          sam deploy --no-confirm-changeset --no-fail-on-empty-changeset

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build and Deploy Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          aws s3 sync dist/ s3://prepsquad-frontend-YOUR_NAME/ --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1
```

## Cost Estimation

**Monthly costs for low-medium traffic:**
- Lambda: ~$5-20 (1M requests, 512MB, 1s avg)
- API Gateway: ~$3.50 (1M requests)
- S3: ~$1-3 (50GB storage, 100GB transfer)
- CloudFront: ~$10-30 (100GB transfer)
- **Total: ~$20-60/month**

Free tier eligible for first year!

## Monitoring

1. **CloudWatch Logs** - View Lambda logs
2. **CloudWatch Metrics** - Monitor API performance
3. **X-Ray** - Trace requests (optional)
4. **CloudFront Reports** - Analyze traffic

## Security Best Practices

1. Use HTTPS only (CloudFront handles SSL)
2. Enable AWS WAF for DDoS protection
3. Implement proper CORS policies
4. Use IAM roles with least privilege
5. Enable CloudTrail for audit logs
6. Rotate credentials regularly
7. Use AWS Secrets Manager for sensitive data

## Cleanup

To remove all resources:

```bash
# Delete CloudFront distribution (disable first, wait, then delete)
# Delete S3 bucket
aws s3 rb s3://prepsquad-frontend-YOUR_NAME --force

# Delete SAM stack
sam delete

# Or delete Lambda + API Gateway manually
```

## Next Steps

1. Add a custom domain with Route 53
2. Set up SSL certificate with ACM
3. Implement authentication (Cognito)
4. Add database (DynamoDB or RDS)
5. Set up monitoring and alerts
6. Implement caching strategies

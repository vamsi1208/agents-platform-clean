# Agents Platform

A cloud-native platform that enables users to interact with AI-powered agents through a clean web interface. The platform leverages AWS services to provide scalable, secure, and intelligent automation for software testing and quality assurance workflows.

## Overview

This project delivers an end-to-end solution for running AI agents in the cloud. Users authenticate through Cognito, then interact with multiple specialized agents that generate test cases, create automation scripts, and retrieve session history—all powered by AWS Bedrock models.

### What it does

- **Test Case Generation Agent**: Generates comprehensive test cases from natural language descriptions using AI
- **Playwright Agent**: Creates runnable Playwright automation scripts for web testing
- **History Agent**: Retrieves and displays previous agent interactions for a user

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ React + Vite Frontend (CloudFront + S3)                         │
│ - Authentication via AWS Amplify + Cognito                      │
│ - Agent UI with markdown output rendering                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ API Gateway (with Cognito Authorization)                        │
│ - /agents/test-case  (POST)                                     │
│ - /agents/playwright (POST)                                     │
│ - /agents/history    (GET)                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Lambda Agents  AWS Bedrock  DynamoDB
   (Node.js)      (Inference)  (Sessions)
```

### Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: AWS Cognito (User Pools)
- **API**: AWS API Gateway + Lambda (Node.js 20)
- **AI/ML**: AWS Bedrock (Amazon Nova Lite model)
- **Database**: DynamoDB (session storage)
- **CDN**: CloudFront + S3 (static hosting)
- **Infrastructure**: AWS CDK (TypeScript)

### Key Libraries

- `react-markdown` - Render markdown output from agents
- `axios` - HTTP client with Cognito token injection
- `aws-amplify` - AWS SDK integration & auth
- `aws-cdk-lib` - Infrastructure as Code
- `@aws-sdk/client-dynamodb` - DynamoDB access

## Project Structure

```
agents-platform-clean/
├── frontend/                          React SPA with Amplify auth
│   ├── src/
│   │   ├── lib/
│   │   │   ├── amplify.ts            Cognito configuration
│   │   │   └── api.ts                Axios client with JWT injection
│   │   ├── components/
│   │   │   ├── AgentPage.tsx         Reusable agent UI component
│   │   │   └── ...
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   └── agents/
│       ├── test-case-agent/          Generates test cases via Bedrock
│       │   ├── handler.js
│       │   └── package.json
│       ├── playwright-agent/         Generates Playwright scripts
│       │   ├── handler.js
│       │   └── package.json
│       └── history-agent/            Queries user session history
│           ├── handler.js
│           └── package.json
│
├── infrastructure/                    AWS CDK stack
│   ├── lib/
│   │   └── infrastructure-stack.ts   Full AWS setup (Cognito, Lambda, API GW, etc.)
│   ├── bin/
│   │   └── infrastructure.ts
│   ├── package.json
│   └── cdk.json
│
├── docs/                              Documentation
├── test-api.js                        Manual testing script
└── README.md
```

## How it Works

### User Flow

1. **Sign Up / Login**: User authenticates via Cognito
2. **Select Agent**: Choose between Test Case, Playwright, or History agent
3. **Input**: Enter a natural language description or query
4. **Backend Processing**: 
   - Lambda handler receives authenticated request
   - Calls AWS Bedrock for AI inference
   - Stores session in DynamoDB
5. **Output**: Markdown result rendered in browser

### Data Flow

```
React UI 
  → (POST with JWT token)
  → API Gateway (Cognito authorizer)
  → Lambda
  → Bedrock (AI model inference)
  → DynamoDB (store session)
  → Response (JSON with output)
  → React UI (markdown rendering)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- AWS Account with CLI configured
- AWS Bedrock model access (Amazon Nova Lite)

### Local Development

#### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

#### 2. Backend - Local Testing

```bash
cd backend/agents/test-case-agent
npm install
npm run build

# Test with provided script:
cd ../../..
node test-api.js
# (requires TEST_EMAIL and TEST_PASSWORD env vars)
```

### Deployment to AWS

#### Step 1: Build Infrastructure

```bash
cd infrastructure
npm install
npm run build
npx cdk deploy
```

Note the CDK outputs:
- `CloudFrontURL` - Frontend URL
- `ApiGatewayURL` - API base URL
- `UserPoolId` - Cognito pool ID
- `UserPoolClientId` - Cognito client ID
- `FrontendBucketName` - S3 bucket for static files

#### Step 2: Build & Deploy Frontend

```bash
cd ../frontend

# Create .env.local with CDK outputs
cat > .env.local << EOF
VITE_API_URL=<ApiGatewayURL>
VITE_USER_POOL_ID=<UserPoolId>
VITE_USER_POOL_CLIENT_ID=<UserPoolClientId>
EOF

npm install
npm run build

# Deploy to S3
aws s3 sync dist/ s3://<FrontendBucketName>/
```

#### Step 3: Access the Application

Open `https://<CloudFrontURL>` in your browser

## Environment Variables

### Lambda Functions

Set in `infrastructure-stack.ts`:

```
TABLE_NAME           - DynamoDB table name (auto-set)
BEDROCK_MODEL_ID     - Model ID (us.amazon.nova-lite-v1:0)
BEDROCK_REGION       - AWS region (us-west-2)
```

### Frontend

Set in `frontend/.env.local`:

```
VITE_API_URL              - API Gateway URL
VITE_USER_POOL_ID         - Cognito User Pool ID
VITE_USER_POOL_CLIENT_ID  - Cognito App Client ID
```

## API Endpoints

All endpoints require `Authorization: <Cognito ID Token>` header.

### POST /agents/test-case

Generate test cases from a description.

**Request:**
```json
{
  "input": "Generate test cases for a banking application login feature. User logs in with email and password. Account locks after 3 failed attempts."
}
```

**Response:**
```json
{
  "sessionId": "abc-123",
  "output": "# Test Cases\n\n## Positive Cases\n..."
}
```

### POST /agents/playwright

Generate Playwright automation script.

**Request:**
```json
{
  "input": "Write a Playwright test that navigates to example.com and clicks the signup button"
}
```

**Response:**
```json
{
  "sessionId": "def-456",
  "output": "```javascript\nconst { test, expect } = require('@playwright/test');\n..."
}
```

### GET /agents/history

Retrieve user's last 20 sessions.

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "abc-123",
      "agent": "test-case-agent",
      "input": "...",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

## Troubleshooting

### Frontend won't load

- Verify CloudFront distribution is created and healthy
- Check S3 bucket has proper permissions
- Inspect CloudFront cache settings (clear if needed)

### API returns 401 Unauthorized

- Ensure `Authorization` header contains valid Cognito ID token
- Verify token is not expired
- Check Cognito User Pool configuration

### Lambda timeout or 500 errors

- Check CloudWatch logs: `/aws/lambda/TestCaseAgentFn`
- Verify Bedrock access in Lambda IAM role
- Check Lambda timeout (default: 30 seconds)
- Verify `BEDROCK_MODEL_ID` and `BEDROCK_REGION` are correct

### DynamoDB errors

- Verify table exists and has correct name
- Check Lambda IAM role has `dynamodb:PutItem` and `dynamodb:Query` permissions
- Ensure partition key structure matches: `userId` + `sessionId`

## Testing

### Manual API Testing

```bash
# Set environment variables
export TEST_EMAIL="your-email@example.com"
export TEST_PASSWORD="your-password"

# Run test script
node test-api.js
```

The script will:
1. Authenticate with Cognito
2. Call the test-case agent
3. Display generated test cases

## Development & Contribution

### Code Structure

- **Frontend** follows React best practices with TypeScript
- **Backend** agents are Lambda handlers with common Bedrock/DynamoDB patterns
- **Infrastructure** uses AWS CDK with IaC principles

### Building

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend/agents/test-case-agent && npm run build

# Infrastructure
cd infrastructure && npm run build
```

## License

MIT

## Support

For issues or questions:
1. Check CloudWatch logs for Lambda errors
2. Review `implementation-deployment-guide.html` for detailed architecture
3. Refer to AWS CDK and Bedrock documentation

---

**Created**: 2026-06-29  
**Version**: 1.0.0

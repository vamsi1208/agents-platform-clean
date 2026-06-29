# Agents Platform — Skills & Technical Reference

## Frontend (React + TypeScript)
- React 18 with functional components and hooks
- React Router v6 for client-side routing
- AWS Amplify JS SDK for Cognito auth and API calls
- Tailwind CSS for styling
- Axios or fetch for REST API calls
- Hosted on S3 as static site, served via CloudFront

## Backend (Node.js + TypeScript on Lambda)
- Each agent is an independent Lambda function
- Uses AWS SDK v3 (`@aws-sdk/client-bedrock-runtime`) to invoke Bedrock
- Receives requests from API Gateway (JSON body)
- Returns structured JSON responses
- Saves sessions to DynamoDB using `@aws-sdk/client-dynamodb`

## Amazon Bedrock
- Model: `anthropic.claude-haiku-20240307-v1:0`
- API: `InvokeModelCommand` from `@aws-sdk/client-bedrock-runtime`
- Each agent has a carefully crafted system prompt
- Responses parsed and structured before returning to frontend

## Amazon API Gateway
- REST API with two resources:
  - `POST /agents/test-case`
  - `POST /agents/playwright`
- CORS enabled for CloudFront domain
- Cognito Authorizer on all routes

## Amazon Cognito
- User Pool for authentication
- Hosted UI or custom React login form
- JWT tokens used to authorize API Gateway calls

## Amazon DynamoDB
- Table: `agent-sessions`
- Partition key: `userId` (string)
- Sort key: `sessionId` (string)
- Stores: agentType, input, output, timestamp

## AWS CDK (TypeScript)
- Single stack: `AgentsPlatformStack`
- Defines: Lambda, API Gateway, Cognito, DynamoDB, S3, CloudFront
- Environment: dev (free tier)

---

## Prompt Engineering

### Test Case Agent System Prompt
```
You are a QA engineer. Given a feature description or user story, generate comprehensive test cases in Given/When/Then format. Include positive, negative, and edge cases. Return as structured markdown.
```

### Playwright Agent System Prompt
```
You are a Playwright automation expert. Given a URL or user journey description, generate a complete, runnable Playwright test script in TypeScript using best practices (page object model if needed). Include imports and assertions.
```

---

## Folder Structure

```
agents-platform/
├── docs/
│   ├── spec.md
│   ├── skills.md
│   └── architecture.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── AgentsCatalog.tsx
│   │   │   ├── TestCaseAgent.tsx
│   │   │   ├── PlaywrightAgent.tsx
│   │   │   └── History.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   └── agents/
│       ├── test-case-agent/
│       │   ├── handler.ts
│       │   └── package.json
│       └── playwright-agent/
│           ├── handler.ts
│           └── package.json
└── infrastructure/
    ├── bin/infrastructure.ts
    └── lib/infrastructure-stack.ts
```

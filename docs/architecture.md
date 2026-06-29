# Agents Platform — Architecture

## High-Level Architecture

```
Browser (User)
     │
     ▼
CloudFront (CDN)
     │
     ├──► S3 (React Static Site)
     │
     └──► API Gateway (REST API)
               │
               │  [Cognito JWT Authorizer]
               │
               ├──► Lambda: test-case-agent
               │         │
               │         ├──► Bedrock (Claude Haiku)
               │         └──► DynamoDB (save session)
               │
               └──► Lambda: playwright-agent
                         │
                         ├──► Bedrock (Claude Haiku)
                         └──► DynamoDB (save session)
```

---

## Component Breakdown

### CloudFront + S3
- CloudFront distribution sits in front of both S3 (frontend) and API Gateway
- S3 bucket is private — only CloudFront OAC can access it
- React app is built and deployed to S3

### API Gateway
- REST API with `/agents/{agentType}` resource pattern
- Cognito User Pool Authorizer validates JWT on every request
- CORS configured for the CloudFront domain

### Lambda Functions
- Runtime: Node.js 20.x
- Each agent is a separate Lambda
- IAM role with `bedrock:InvokeModel` and `dynamodb:PutItem` permissions
- Timeout: 30s (Bedrock can be slow)
- Memory: 256MB

### Amazon Bedrock
- Region: us-east-1 (Bedrock model availability)
- Model: `anthropic.claude-haiku-20240307-v1:0`
- Invoked via `InvokeModelCommand` with `anthropic` message format
- Max tokens: 2048 per response

### DynamoDB
- On-demand billing mode (free tier friendly)
- Table: `agent-sessions`
  - PK: `userId` (from Cognito JWT sub)
  - SK: `sessionId` (UUID + timestamp)
  - Attributes: `agentType`, `input`, `output`, `createdAt`

### Cognito
- User Pool with email/password sign-up
- App Client for the React frontend
- JWT issued on login, attached to all API requests as `Authorization` header

---

## Request Flow (Example: Test Case Agent)

```
1. User types feature description in React UI
2. React calls POST /agents/test-case with JWT in Authorization header
3. API Gateway validates JWT via Cognito Authorizer
4. Lambda is invoked with { userId, input }
5. Lambda constructs Bedrock prompt
6. Lambda calls Bedrock InvokeModel → gets test cases
7. Lambda saves { userId, sessionId, input, output } to DynamoDB
8. Lambda returns { sessionId, output } to API Gateway
9. API Gateway returns response to React
10. React renders formatted test cases
```

---

## CDK Stack Resources

```typescript
// Resources defined in AgentsPlatformStack
- CfnUserPool (Cognito)
- CfnUserPoolClient (Cognito App Client)
- Table (DynamoDB - agent-sessions)
- Function (Lambda - test-case-agent)
- Function (Lambda - playwright-agent)
- RestApi (API Gateway)
- CognitoUserPoolsAuthorizer
- Bucket (S3 - frontend)
- Distribution (CloudFront)
```

---

## Deployment Steps

1. `cd infrastructure && npm run build && cdk deploy`
2. CDK outputs: CloudFront URL, API Gateway URL, Cognito User Pool ID
3. Update frontend `.env` with those values
4. `cd frontend && npm run build`
5. `aws s3 sync dist/ s3://<bucket-name>`
6. Access app via CloudFront URL

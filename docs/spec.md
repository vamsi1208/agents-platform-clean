# Agents Platform — Product Specification

## Overview
A web-based platform that hosts a suite of AI-powered agents, allowing users to interact with them through a clean UI. Built entirely on AWS using a free-tier-friendly architecture with Amazon Bedrock as the AI backbone.

---

## Goals
- Host multiple AI agents on a single platform
- Each agent has a dedicated UI and backend
- All infrastructure runs on AWS (free tier where possible)
- Bedrock powers the LLM capabilities

---

## Agents (Phase 1)

### 1. Test Case Agent
- Input: feature description or user story (text)
- Output: structured test cases (Given/When/Then or table format)
- Model: Amazon Bedrock (Claude Haiku via Bedrock)
- Backend: AWS Lambda (Node.js)

### 2. Playwright Agent
- Input: URL or user journey description
- Output: ready-to-run Playwright test script (TypeScript)
- Model: Amazon Bedrock (Claude Haiku via Bedrock)
- Backend: AWS Lambda (Node.js)

---

## Future Agents (Phase 2+)
- API Test Agent — generates REST API tests from OpenAPI/Swagger
- Bug Report Agent — converts logs/screenshots to structured bug reports
- Documentation Agent — generates docs from source code
- Code Review Agent — reviews code snippets and suggests improvements

---

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | React (TypeScript), hosted on S3 + CloudFront     |
| Backend     | Node.js Lambda functions (TypeScript)             |
| API Layer   | Amazon API Gateway (REST)                         |
| AI/LLM      | Amazon Bedrock (Claude Haiku)                     |
| Auth        | Amazon Cognito (User Pool)                        |
| Storage     | Amazon DynamoDB (history/sessions)                |
| IaC         | AWS CDK (TypeScript)                              |

---

## User Flows

### Test Case Agent Flow
1. User logs in via Cognito
2. Navigates to "Test Case Agent" page
3. Enters a feature description or user story
4. Clicks "Generate"
5. API Gateway triggers Lambda
6. Lambda calls Bedrock (Claude Haiku)
7. Response rendered as formatted test cases
8. User can copy or download output
9. Session saved to DynamoDB

### Playwright Agent Flow
1. User logs in
2. Navigates to "Playwright Agent" page
3. Enters a URL or user journey description
4. Clicks "Generate Script"
5. Lambda calls Bedrock with Playwright-specific prompt
6. Output rendered as a TypeScript code block
7. User can copy or download the script

---

## Pages

| Page                  | Description                              |
|-----------------------|------------------------------------------|
| `/`                   | Landing page — hero, list of agents      |
| `/agents`             | Agents catalog with cards                |
| `/agents/test-case`   | Test Case Agent UI                       |
| `/agents/playwright`  | Playwright Agent UI                      |
| `/history`            | User's previous sessions and outputs     |
| `/login`              | Cognito-powered login/signup             |

---

## AWS Free Tier Alignment

| Service     | Free Tier Limit                              |
|-------------|----------------------------------------------|
| Lambda      | 1M requests/month, 400K GB-s compute         |
| API Gateway | 1M API calls/month (first 12 months)         |
| S3          | 5GB storage, 20K GET, 2K PUT                 |
| CloudFront  | 1TB transfer, 10M requests/month             |
| DynamoDB    | 25GB storage, 25 RCU/WCU                     |
| Cognito     | 50,000 MAU free                              |
| Bedrock     | Pay-per-token — use Claude Haiku (cheapest)  |

---

## Constraints
- No always-on servers — Lambda only (no ECS/EC2)
- Use Claude Haiku model for all Bedrock calls during dev/test
- All AWS resources tagged: `project: agents-platform`, `env: dev`

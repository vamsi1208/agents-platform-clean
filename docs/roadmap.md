# Agents Platform — Roadmap

## Phase 1 — Foundation (Current)
- [ ] Create docs (spec, skills, architecture, roadmap)
- [ ] Set up CDK infrastructure stack
  - [ ] Cognito User Pool
  - [ ] DynamoDB table
  - [ ] Lambda functions (test-case, playwright)
  - [ ] API Gateway with Cognito authorizer
  - [ ] S3 + CloudFront for frontend
- [ ] Build Lambda: test-case-agent (Bedrock integration)
- [ ] Build Lambda: playwright-agent (Bedrock integration)
- [ ] Build React frontend
  - [ ] Landing page
  - [ ] Agents catalog
  - [ ] Test Case Agent page
  - [ ] Playwright Agent page
  - [ ] Login/Auth via Cognito
  - [ ] History page (DynamoDB)
- [ ] Deploy and test end-to-end

## Phase 2 — More Agents
- [ ] API Test Agent (OpenAPI input → REST test cases)
- [ ] Bug Report Agent (log/description → bug report)
- [ ] Documentation Agent (code → markdown docs)

## Phase 3 — Platform Features
- [ ] Agent output sharing (public links)
- [ ] Saved templates / prompts
- [ ] Usage dashboard per user
- [ ] Admin panel to manage agents

## Phase 4 — Production Hardening
- [ ] Custom domain via Route 53
- [ ] WAF on CloudFront
- [ ] CloudWatch alarms and dashboards
- [ ] CI/CD via CodePipeline

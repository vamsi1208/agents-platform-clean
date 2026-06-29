import * as cdk from 'aws-cdk-lib/core';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

const TAGS = { project: 'agents-platform', env: 'dev' };

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── Cognito ────────────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'AgentsUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: { minLength: 8 },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'AgentsUserPoolClient', {
      userPool,
      authFlows: { userPassword: true, userSrp: true },
      generateSecret: false,
    });

    // ── DynamoDB ───────────────────────────────────────────────────────────
    const sessionsTable = new dynamodb.Table(this, 'AgentSessionsTable', {
      tableName: 'agent-sessions',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ── Lambda IAM Role ────────────────────────────────────────────────────
    const lambdaRole = new iam.Role(this, 'AgentLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'aws-marketplace:ViewSubscriptions',
                'aws-marketplace:Subscribe',
                'aws-marketplace:Unsubscribe',
              ],
              resources: ['*'],
            }),
          ],
        }),
        DynamoAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:PutItem', 'dynamodb:Query'],
              resources: [sessionsTable.tableArn],
            }),
          ],
        }),
      },
    });

    const lambdaEnv = {
      TABLE_NAME: sessionsTable.tableName,
      BEDROCK_MODEL_ID: 'us.amazon.nova-lite-v1:0',
      BEDROCK_REGION: 'us-west-2',
    };

    // ── Lambda: test-case-agent ────────────────────────────────────────────
    const testCaseFn = new lambda.Function(this, 'TestCaseAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/agents/test-case-agent'), {
        exclude: ['*.ts', 'tsconfig.json'],
      }),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: lambdaEnv,
    });

    // ── Lambda: playwright-agent ───────────────────────────────────────────
    const playwrightFn = new lambda.Function(this, 'PlaywrightAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/agents/playwright-agent'), {
        exclude: ['*.ts', 'tsconfig.json'],
      }),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: lambdaEnv,
    });

    // ── API Gateway ────────────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, 'AgentsApi', {
      restApiName: 'agents-platform-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'AgentsAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const authOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // ── Lambda: history-agent ──────────────────────────────────────────────
    const historyFn = new lambda.Function(this, 'HistoryAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/agents/history-agent'), {
        exclude: ['*.ts', 'tsconfig.json'],
      }),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(15),
      memorySize: 128,
      environment: lambdaEnv,
    });

    const agents = api.root.addResource('agents');
    agents.addResource('test-case').addMethod('POST', new apigateway.LambdaIntegration(testCaseFn), authOptions);
    agents.addResource('playwright').addMethod('POST', new apigateway.LambdaIntegration(playwrightFn), authOptions);
    agents.addResource('history').addMethod('GET', new apigateway.LambdaIntegration(historyFn), authOptions);

    // ── S3 Frontend Bucket ─────────────────────────────────────────────────
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ── CloudFront ─────────────────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'AgentsDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });

    // ── Tag all resources ──────────────────────────────────────────────────
    Object.entries(TAGS).forEach(([k, v]) => cdk.Tags.of(this).add(k, v));

    // ── Outputs ────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'CloudFrontURL', { value: `https://${distribution.domainName}` });
    new cdk.CfnOutput(this, 'ApiGatewayURL', { value: api.url });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'FrontendBucketName', { value: frontendBucket.bucketName });
  }
}

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';

const bedrock = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION ?? 'us-west-2' });
const dynamo = new DynamoDBClient({});

const SYSTEM_PROMPT = `You are a QA engineer. Given a feature description or user story, generate comprehensive test cases in Given/When/Then format. Include positive, negative, and edge cases. Return as structured markdown.`;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { input } = JSON.parse(event.body ?? '{}');
    if (!input) return { statusCode: 400, body: JSON.stringify({ error: 'input is required' }) };

    const userId = event.requestContext.authorizer?.claims?.sub ?? 'anonymous';

    const response = await bedrock.send(new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      system: [{ text: SYSTEM_PROMPT }],
      messages: [{ role: 'user', content: [{ text: input }] }],
      inferenceConfig: { maxTokens: 2048 },
    }));

    const output = response.output?.message?.content?.[0]?.text ?? '';

    const sessionId = `${Date.now()}-${randomUUID()}`;
    await dynamo.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        userId: { S: userId },
        sessionId: { S: sessionId },
        agentType: { S: 'test-case' },
        input: { S: input },
        output: { S: output },
        createdAt: { S: new Date().toISOString() },
      },
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ sessionId, output }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

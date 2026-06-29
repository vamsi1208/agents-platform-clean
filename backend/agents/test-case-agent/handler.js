"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const crypto_1 = require("crypto");
const bedrock = new client_bedrock_runtime_1.BedrockRuntimeClient({ region: process.env.BEDROCK_REGION ?? 'us-west-2' });
const dynamo = new client_dynamodb_1.DynamoDBClient({});
const SYSTEM_PROMPT = `You are a QA engineer. Given a feature description or user story, generate comprehensive test cases in Given/When/Then format. Include positive, negative, and edge cases. Return as structured markdown.`;
const handler = async (event) => {
    try {
        const { input } = JSON.parse(event.body ?? '{}');
        if (!input)
            return { statusCode: 400, body: JSON.stringify({ error: 'input is required' }) };
        const userId = event.requestContext.authorizer?.claims?.sub ?? 'anonymous';
        const response = await bedrock.send(new client_bedrock_runtime_1.ConverseCommand({
            modelId: process.env.BEDROCK_MODEL_ID,
            system: [{ text: SYSTEM_PROMPT }],
            messages: [{ role: 'user', content: [{ text: input }] }],
            inferenceConfig: { maxTokens: 2048 },
        }));
        const output = response.output?.message?.content?.[0]?.text ?? '';
        const sessionId = `${Date.now()}-${(0, crypto_1.randomUUID)()}`;
        await dynamo.send(new client_dynamodb_1.PutItemCommand({
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
    }
    catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
exports.handler = handler;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dynamo = new client_dynamodb_1.DynamoDBClient({});
const handler = async (event) => {
    try {
        const userId = event.requestContext.authorizer?.claims?.sub ?? 'anonymous';
        const result = await dynamo.send(new client_dynamodb_1.QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: { ':uid': { S: userId } },
            ScanIndexForward: false,
            Limit: 20,
        }));
        const sessions = (result.Items ?? []).map((item) => ({
            sessionId: item.sessionId?.S,
            agentType: item.agentType?.S,
            input: item.input?.S,
            output: item.output?.S,
            createdAt: item.createdAt?.S,
        }));
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ sessions }),
        };
    }
    catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
    }
};
exports.handler = handler;

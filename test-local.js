const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const SYSTEM_PROMPT = `You are a QA engineer. Given a feature description or user story, generate comprehensive test cases in Given/When/Then format. Include positive, negative, and edge cases. Return as structured markdown.`;

const input = `Generate test cases for a banking application login feature. 
The user can log in with email and password. 
After 3 failed attempts the account gets locked. 
Password must be at least 8 characters with a number and special character.`;

async function run() {
  console.log('Invoking Bedrock...\n');
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-haiku-4-5-20251001-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: input }],
    }),
  }));

  const result = JSON.parse(Buffer.from(response.body).toString());
  console.log('=== GENERATED TEST CASES ===\n');
  console.log(result.content[0].text);
}

run().catch(console.error);

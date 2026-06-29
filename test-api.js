const https = require('https');

const USER_POOL_ID = 'us-east-1_Aoxgqntxz';
const CLIENT_ID = '5b7kb05lkkti1s91lb8o1n3im5';
const API_URL = 'https://a3i7g4cl61.execute-api.us-east-1.amazonaws.com/prod';
const REGION = 'us-east-1';

const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Set TEST_EMAIL and TEST_PASSWORD environment variables');
  process.exit(1);
}

async function getToken() {
  const body = JSON.stringify({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: EMAIL, PASSWORD },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: `cognito-idp.${REGION}.amazonaws.com`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.AuthenticationResult) resolve(parsed.AuthenticationResult.IdToken);
        else reject(parsed);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateTestCases(token) {
  const body = JSON.stringify({
    input: 'Generate test cases for a banking application login feature. User logs in with email and password. Account locks after 3 failed attempts.',
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'a3i7g4cl61.execute-api.us-east-1.amazonaws.com',
      path: '/prod/agents/test-case',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('1. Authenticating with Cognito...');
  const token = await getToken();
  console.log('   ✅ Got token\n');

  console.log('2. Calling Test Case Agent...');
  const result = await generateTestCases(token);

  if (result.output) {
    console.log('   ✅ Success!\n');
    console.log('=== GENERATED TEST CASES ===\n');
    console.log(result.output);
  } else {
    console.log('   ❌ Error:', result);
  }
})();

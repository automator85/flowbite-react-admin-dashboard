import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.SUPABASE_TEST_EMAIL;
const testPassword = process.env.SUPABASE_TEST_PASSWORD;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SUPABASE_KEY:', supabaseKey ? 'Set' : 'Missing');
console.log('TEST_EMAIL:', testEmail ? 'Set' : 'Missing');
console.log('TEST_PASSWORD:', testPassword ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
  console.error('Missing required credentials in .env file');
  process.exit(1);
}

// Authenticate first
console.log('\nAuthenticating test user...');
let authToken;
try {
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });

  if (!authResponse.ok) {
    throw new Error(`Authentication failed: ${await authResponse.text()}`);
  }

  const authData = await authResponse.json();
  authToken = authData.access_token;
  console.log('Authentication successful');
} catch (error) {
  console.error('Authentication error:', error);
  process.exit(1);
}

// Test connection with auth token
console.log('\nTesting authenticated connection to Supabase...');
try {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${authToken}`
    }
  });
  console.log('Connection test status:', response.status);
  if (!response.ok) {
    console.error('Connection test response:', await response.text());
  }
} catch (error) {
  console.error('Connection test error:', error);
}

async function testQuery(name, query) {
  console.log('\n----------------------------------------');
  console.log(`Testing ${name}...`);
  console.log('Full URL:', `${supabaseUrl}/rest/v1/${query}`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add your test queries here
await testQuery('List Workers', 'workers?select=*');

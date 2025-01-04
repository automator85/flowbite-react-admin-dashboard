import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedAccess() {
  try {
    // First try to sign in
    console.log('Attempting to sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_TEST_EMAIL,
      password: process.env.SUPABASE_TEST_PASSWORD
    });

    if (signInError) {
      throw new Error(`Sign in error: ${signInError.message}`);
    }

    if (!signInData.session) {
      throw new Error('No session received after sign in');
    }

    const session = signInData.session;

    console.log('Session found:', {
      user: session.user.email,
      expires_at: new Date(session.expires_at * 1000).toLocaleString()
    });

    console.log('\nTesting API access...');
    
    // Test contracts access
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        *,
        contract_type:contract_types(*),
        worker:workers(
          *,
          role:roles(*)
        )
      `)
      .limit(1);

    if (contractsError) {
      throw new Error(`API error: ${contractsError.message}`);
    }

    console.log('\nSuccessfully fetched contracts:', contracts.length > 0 ? 'Yes' : 'No');
    if (contracts.length > 0) {
      console.log('Sample contract:', {
        id: contracts[0].id,
        contract_number: contracts[0].contract_number,
        worker_name: contracts[0].worker?.full_name,
        contract_type: contracts[0].contract_type?.type
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
  }
}

console.log('Testing authenticated API access...');
testAuthenticatedAccess();

import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function testWorkers() {
  const query = `workers?select=id,full_name,email,role_id,role:roles(*)`.replace(/\s+/g, '');
  console.log('\nTesting workers query...');
  console.log('URL:', `${supabaseUrl}/rest/v1/${query}`);
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  console.log('Workers data:', JSON.stringify(data, null, 2));
  return data;
}

async function testContracts(workerId) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14); // Last 14 days
  const formattedDate = startDate.toISOString().split('T')[0];
  
  const query = `
    contracts?select=
      id,
      contract_number,
      date_signed,
      status,
      contract_type_id,
      contract_type:contract_types(*)
    &worker_id=eq.${workerId}
    &date_signed=gte.${formattedDate}
    &date_signed=not.is.null
  `.replace(/\s+/g, '');

  console.log('\nTesting contracts query...');
  console.log('URL:', `${supabaseUrl}/rest/v1/${query}`);
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  console.log('Contracts data:', JSON.stringify(data, null, 2));
  return data;
}

async function testComissionRates(contractTypeId, roleId) {
  const dateSigned = new Date().toISOString().split('T')[0];
  
  const query = `
    comissions?select=*
    &contract_type_id=eq.${contractTypeId}
    &role_id=eq.${roleId}
    &or=(valid_to.is.null,valid_to.gte.${dateSigned})
    &or=(valid_from.is.null,valid_from.lte.${dateSigned})
  `.replace(/\s+/g, '');

  console.log('\nTesting commission rates query...');
  console.log('URL:', `${supabaseUrl}/rest/v1/${query}`);
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  console.log('Commission rates data:', JSON.stringify(data, null, 2));
  return data;
}

// Run tests
async function runTests() {
  try {
    // Test workers
    const workers = await testWorkers();
    
    if (workers.length > 0) {
      // Test contracts for first worker
      const contracts = await testContracts(workers[0].id);
      
      if (contracts.length > 0) {
        // Test commission rates for first contract
        await testComissionRates(contracts[0].contract_type_id, workers[0].role_id);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();

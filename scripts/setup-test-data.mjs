import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function supabaseRequest(table, method = 'POST', body = null) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
    method,
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    ...(body && { body: JSON.stringify(body) })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${error}`);
  }
  return response.json();
}

async function setupTestData() {
  try {
    console.log('Setting up test data...');

    // Create a role
    console.log('\nCreating role...');
    const roles = await supabaseRequest('roles', 'POST', 
    { role_name: 'Sales Representative', description: 'Handles direct sales' }
    );
    const role = roles[0];
    console.log('Created role:', role);

    // Create a worker
    console.log('\nCreating worker...');
    const workers = await supabaseRequest('workers', 'POST', 
    { 
      full_name: 'Alice Sales',
      email: `alice${Date.now()}@example.com`,
      role_id: role.id
    });
    const worker = workers[0];
    console.log('Created worker:', worker);

    // Create a contract type
    console.log('\nCreating contract type...');
    const contractTypes = await supabaseRequest('contract_types', 'POST',
    { type: 'Basic', description: 'Basic contract', active: true }
    );
    const contractType = contractTypes[0];
    console.log('Created contract type:', contractType);

    // Create commission rate
    console.log('\nCreating commission rate...');
    await supabaseRequest('comissions', 'POST',
    {
      contract_type_id: contractType.id,
      role_id: role.id,
      comission: 100,
      valid_from: '2023-01-01'
    });
    console.log('Created commission rate');

    // Create contracts for the last two weeks
    console.log('\nCreating contracts...');
    const today = new Date();
    const daysArray = Array.from({ length: 14 }, (_, i) => i);
    
    // Create contracts one at a time to avoid ID conflicts
    await daysArray.reduce(async (promise, days) => {
      await promise;
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      
      const result = await supabaseRequest('contracts', 'POST', {
        worker_id: worker.id,
        contract_type_id: contractType.id,
        contract_number: `CNT-${date.getTime()}`,
        date_signed: date.toISOString().split('T')[0],
        status: 'active'
      });
      console.log(`Created contract for day -${days}`);
      return result;
    }, Promise.resolve());
    
    console.log('All contracts created successfully');

    console.log('\nTest data setup complete!');
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

setupTestData();

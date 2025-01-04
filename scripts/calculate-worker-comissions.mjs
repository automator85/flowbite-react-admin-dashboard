import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function getAllWorkers() {
  const query = `
    workers?select=
      id,
      full_name,
      email,
      role_id,
      role:roles(*)
  `.replace(/\s+/g, '');

  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

async function getWorkerContracts(workerId) {
  const query = `
    contracts?select=
      id,
      contract_number,
      date_signed,
      status,
      contract_type_id,
      contract_type:contract_types(*)
    &worker_id=eq.${workerId}
    &date_signed=not.is.null
  `.replace(/\s+/g, '');

  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

async function getComissionRate(contractTypeId, roleId, dateSigned) {
  const query = `
    comissions?select=*
    &contract_type_id=eq.${contractTypeId}
    &role_id=eq.${roleId}
    &or=(valid_to.is.null,valid_to.gte.${dateSigned})
    &or=(valid_from.is.null,valid_from.lte.${dateSigned})
  `.replace(/\s+/g, '');

  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const rates = await response.json();
  return rates[0]?.comission || 0;
}

async function calculateWorkerComissions(worker) {
  try {
    const contracts = await getWorkerContracts(worker.id);
    
    // Get today's date at midnight for consistent comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Calculate start of week (Monday) and month
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let todaySum = 0;
    let yesterdaySum = 0;
    let weekSum = 0;
    let monthSum = 0;

    for (const contract of contracts) {
      const dateSigned = new Date(contract.date_signed);
      const comissionRate = await getComissionRate(contract.contract_type_id, worker.role_id, contract.date_signed);
      
      // Single contract commission
      const comission = comissionRate;

      // Add to appropriate period sums
      if (dateSigned.toDateString() === today.toDateString()) {
        todaySum += comission;
      }
      if (dateSigned.toDateString() === yesterday.toDateString()) {
        yesterdaySum += comission;
      }
      if (dateSigned >= startOfWeek && dateSigned <= today) {
        weekSum += comission;
      }
      if (dateSigned >= startOfMonth && dateSigned <= today) {
        monthSum += comission;
      }
    }

    console.log('='.repeat(80));
    console.log(`Worker: ${worker.full_name} (ID: ${worker.id})`);
    console.log(`Role: ${worker.role?.role_name} (ID: ${worker.role_id})`);
    console.log(`Email: ${worker.email}`);
    console.log('='.repeat(80));
    
    console.log('\nComission Summary:');
    console.log('-'.repeat(40));
    console.log('Today:', today.toLocaleDateString());
    console.log('Comissions:', todaySum.toFixed(2));
    console.log('\nYesterday:', yesterday.toLocaleDateString());
    console.log('Comissions:', yesterdaySum.toFixed(2));
    console.log('\nThis Week:', `${startOfWeek.toLocaleDateString()} - ${today.toLocaleDateString()}`);
    console.log('Comissions:', weekSum.toFixed(2));
    console.log('\nThis Month:', `${startOfMonth.toLocaleDateString()} - ${today.toLocaleDateString()}`);
    console.log('Comissions:', monthSum.toFixed(2));

    // Print contract details
    console.log('\nDetailed Contract Information:');
    console.log('-'.repeat(40));
    if (contracts.length === 0) {
      console.log('No contracts found for this period');
    } else {
      for (const contract of contracts) {
        const dateSigned = new Date(contract.date_signed);
        const comissionRate = await getComissionRate(contract.contract_type_id, worker.role_id, contract.date_signed);
        
        console.log(`\nContract: ${contract.contract_number}`);
        console.log('Date:', dateSigned.toLocaleDateString());
        console.log('Type:', contract.contract_type.type);
        console.log('Status:', contract.status);
        console.log('Comission Rate:', comissionRate);
      }
    }
    console.log('\n');

  } catch (error) {
    console.error('Error calculating commissions for worker', worker.id);
    console.error('Error details:', error.message);
  }
}

async function calculateAllWorkerComissions() {
  try {
    const workers = await getAllWorkers();
    console.log(`Found ${workers.length} workers\n`);

    for (const worker of workers) {
      await calculateWorkerComissions(worker);
    }
  } catch (error) {
    console.error('Error:', error);
    console.error('Error details:', error.message);
  }
}

console.log('Calculating commissions for all workers...');
calculateAllWorkerComissions();

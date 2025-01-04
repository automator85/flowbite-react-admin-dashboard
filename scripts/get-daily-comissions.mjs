import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function getAllWorkers() {
  const query = 'workers?select=id,full_name,email,role_id,role:roles(role_name)';

  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

async function getWorkerById(workerId) {
  const query = `workers?select=id,full_name,email,role_id,role:roles(role_name)&id=eq.${workerId}`;

  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const workers = await response.json();
  return workers[0];
}

async function getWorkerContracts(workerId, startDate) {
  const query = `contracts?select=id,contract_number,date_signed,status,contract_type_id,contract_type:contract_types(type,description)&worker_id=eq.${workerId}&date_signed=gte.${startDate}&date_signed=not.is.null`;

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
  console.log('\nGetting commission rate for:', { contractTypeId, roleId, dateSigned });
  
  const query = contractTypeId === null
    ? `comissions?select=comission&contract_type_id=is.null&role_id=eq.${roleId}&or=(valid_to.is.null%2Cvalid_to.gte.${dateSigned})&or=(valid_from.is.null%2Cvalid_from.lte.${dateSigned})`
    : `comissions?select=comission&contract_type_id=eq.${contractTypeId}&role_id=eq.${roleId}&or=(valid_to.is.null%2Cvalid_to.gte.${dateSigned})&or=(valid_from.is.null%2Cvalid_from.lte.${dateSigned})`;
  console.log('Commission query:', query);
  
  const url = `${supabaseUrl}/rest/v1/${query}`;
  console.log('Full URL:', url);

  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${error}`);
  }
  const rates = await response.json();
  return rates[0]?.comission || 0;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDayLabel(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

/** 
 * @param {string} [workerId] - Optional worker ID to filter commissions
 * @returns {Promise<import('../src/types/commissions').CommissionData>}
 */
export async function getDailyComissions(workerId) {
  try {
    // Get dates for the last 14 days
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate start of current week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    // Calculate start of previous week
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // Initialize data arrays for both weeks
    const thisWeekData = new Array(7).fill(0);
    const lastWeekData = new Array(7).fill(0);

    // Process contracts for the specified worker or all workers
    const processContracts = async (worker) => {
      const contracts = await getWorkerContracts(worker.id, formatDate(startOfLastWeek));
      console.log('Processing contracts for worker:', worker.id, contracts.length, 'contracts');
      
      await Promise.all(contracts.map(async contract => {
        console.log('Processing contract:', contract.id, contract.date_signed);
        const dateSigned = new Date(contract.date_signed);
        const comissionRate = await getComissionRate(
          contract.contract_type_id, 
          worker.role_id, 
          contract.date_signed
        );
        
        // Calculate days since start of respective week
        const isThisWeek = dateSigned >= startOfWeek;
        const weekStart = isThisWeek ? startOfWeek : startOfLastWeek;
        const dayIndex = Math.floor((dateSigned - weekStart) / (1000 * 60 * 60 * 24));
        
        if (isThisWeek && dayIndex >= 0 && dayIndex < 7) {
          thisWeekData[dayIndex] += comissionRate;
        } else if (!isThisWeek && dayIndex >= 0 && dayIndex < 7) {
          lastWeekData[dayIndex] += comissionRate;
        }
      }));
    };

    if (workerId) {
      // Process contracts for specific worker
      const worker = await getWorkerById(workerId);
      if (!worker) throw new Error(`Worker not found: ${workerId}`);
      await processContracts(worker);
    } else {
      // Process contracts for all workers
      const workers = await getAllWorkers();
      await Promise.all(workers.map(processContracts));
    }

    // Generate date labels
    const dateLabels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return getDayLabel(date);
    });

    // Format arrays with proper JSON structure
    const result = {
      labels: dateLabels.map(label => label.toString()),
      thisWeek: Array.from(thisWeekData),
      lastWeek: Array.from(lastWeekData)
    };

    // Ensure numbers stay as numbers
    const formattedResult = {
      labels: result.labels,
      thisWeek: result.thisWeek.map(Number),
      lastWeek: result.lastWeek.map(Number)
    };

    console.log('Commission data:', JSON.stringify(formattedResult, null, 2));
    return formattedResult;

  } catch (error) {
    console.error('Error calculating daily commissions:', error);
    throw error;
  }
}

// For testing the script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const workerId = process.argv[2]; // Optional worker ID from command line
  getDailyComissions(workerId).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('Failed to get daily commissions:', error);
  });
}

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function fetchContractsWithDetails() {
  try {
    // Simpler query structure
    const query = `
      contracts?select=
        *,
        contract_type:contract_types(*),
        worker:workers(
          *,
          role:roles(*)
        )
    `.replace(/\s+/g, '');

    const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contracts = await response.json();
    console.log(`Found ${contracts.length} contracts\n`);
    
    // Process each contract
    for (const contract of contracts) {
      const roleId = contract.worker?.role?.id;
      const contractTypeId = contract.contract_type_id;

      // Fetch comission rate separately
      if (roleId && contractTypeId && contract.date_signed) {
        const comissionQuery = `
          comissions?select=*
          &contract_type_id=eq.${contractTypeId}
          &role_id=eq.${roleId}
          &or=(valid_to.is.null,valid_to.gte.${contract.date_signed})
          &or=(valid_from.is.null,valid_from.lte.${contract.date_signed})
        `.replace(/\s+/g, '');

        const comissionResponse = await fetch(`${supabaseUrl}/rest/v1/${comissionQuery}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        const comissions = await comissionResponse.json();

        // Print separator for better readability
        console.log('='.repeat(80));
        
        // Print all details
        console.log('\nContract Details:');
        console.log('ID:', contract.id);
        console.log('Contract Number:', contract.contract_number);
        console.log('Status:', contract.status);
        console.log('Date Signed:', contract.date_signed);
        
        console.log('\nContract Type:');
        console.log('ID:', contract.contract_type?.id);
        console.log('Type:', contract.contract_type?.type);
        console.log('Company:', contract.contract_type?.company);
        console.log('Category:', contract.contract_type?.category);
        
        console.log('\nWorker Information:');
        console.log('ID:', contract.worker?.id);
        console.log('Name:', contract.worker?.full_name);
        console.log('Email:', contract.worker?.email);
        console.log('Role ID:', roleId);
        console.log('Role Name:', contract.worker?.role?.role_name);
        
        if (comissions && comissions.length > 0) {
          const comission = comissions[0];
          console.log('\nComission Information:');
          console.log('Comission:', comission.comission);
          console.log('Valid From:', comission.valid_from || 'No start date');
          console.log('Valid To:', comission.valid_to || 'No end date');
        } else {
          console.log('\nNo valid comission rate found for this contract type and role');
        }
      } else {
        console.log('\nMissing required information for comission calculation:');
        console.log('Role ID:', roleId);
        console.log('Contract Type ID:', contractTypeId);
        console.log('Date Signed:', contract.date_signed);
      }
    }
  } catch (error) {
    console.error('Error fetching contracts:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      const text = await error.response.text();
      console.error('Response:', text);
    }
  }
}

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
fetchContractsWithDetails();

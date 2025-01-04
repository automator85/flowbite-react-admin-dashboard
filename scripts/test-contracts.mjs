import { getContracts, getContractWithDetails } from '../src/services/contracts.js';

async function testContractsData() {
  try {
    console.log('Fetching all contracts...');
    const contracts = await getContracts();
    console.log(`Found ${contracts.length} contracts`);
    console.log('First contract:', JSON.stringify(contracts[0], null, 2));

    if (contracts.length > 0) {
      console.log('\nFetching detailed contract data...');
      const contractWithDetails = await getContractWithDetails(contracts[0].id);
      console.log('Contract with details:', JSON.stringify(contractWithDetails, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testContractsData();

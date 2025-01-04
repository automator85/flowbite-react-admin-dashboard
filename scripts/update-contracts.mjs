import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmeryxtptkahrssypvwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXJ5eHRwdGthaHJzc3lwdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1Mjg5NjcsImV4cCI6MjA0ODEwNDk2N30.WiPq5CwFlsLBXH7DMLzHNHo0XoOrFrofSdRDIbsUw6w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateContracts() {
  try {
    // Get all contracts from the last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const dateStr = twoWeeksAgo.toISOString().split('T')[0];

    const { data: contracts, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .gte('date_signed', dateStr);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${contracts.length} contracts to update`);

    // Update all contracts to worker_id 7
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ worker_id: 7 })
      .gte('date_signed', dateStr);

    if (updateError) {
      throw updateError;
    }

    console.log('Successfully updated contracts to worker_id 7');

  } catch (error) {
    console.error('Error:', error);
  }
}

updateContracts();

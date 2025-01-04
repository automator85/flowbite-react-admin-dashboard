import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmeryxtptkahrssypvwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXJ5eHRwdGthaHJzc3lwdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1Mjg5NjcsImV4cCI6MjA0ODEwNDk2N30.WiPq5CwFlsLBXH7DMLzHNHo0XoOrFrofSdRDIbsUw6w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupForecast() {
  try {
    // Get worker with ID 7
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', 7)
      .single();

    if (workerError) {
      throw new Error('Worker with ID 7 not found');
    }

    console.log('Found worker:', worker);

    // Update worker with a test user_id if not set
    if (!worker.user_id) {
      const { error: updateError } = await supabase
        .from('workers')
        .update({ user_id: '12345-test-user-id' }) // This should match your authenticated user's ID
        .eq('id', 7);

      if (updateError) {
        throw updateError;
      }
      console.log('Updated worker with test user_id');
    }

    const workerId = 7;

    // 3. Create a forecast for the current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Check if forecast exists for this month
    const { data: existingForecast, error: existingError } = await supabase
      .from('monthly_revenue_forecasts')
      .select('*')
      .eq('worker_id', workerId)
      .eq('month', currentMonth)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    let forecast;
    if (existingForecast) {
      // Update existing forecast
      const { data: updatedForecast, error: updateError } = await supabase
        .from('monthly_revenue_forecasts')
        .update({ 
          forecast_value: 5000,
          is_active: true 
        })
        .eq('id', existingForecast.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      forecast = updatedForecast;
      console.log('Updated existing forecast:', forecast);
    } else {
      // Create new forecast
      const { data: newForecast, error: insertError } = await supabase
        .from('monthly_revenue_forecasts')
        .insert({
          worker_id: workerId,
          month: currentMonth,
          forecast_value: 5000,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }
      forecast = newForecast;
      console.log('Created new forecast:', forecast);
    }
    console.log('\nSetup complete! The dashboard chart should now show data.');

  } catch (error) {
    console.error('Error:', error);
  }
}

setupForecast();

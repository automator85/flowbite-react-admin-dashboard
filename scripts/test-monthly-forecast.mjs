import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmeryxtptkahrssypvwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZXJ5eHRwdGthaHJzc3lwdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1Mjg5NjcsImV4cCI6MjA0ODEwNDk2N30.WiPq5CwFlsLBXH7DMLzHNHo0XoOrFrofSdRDIbsUw6w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getMonthlyForecast(workerId) {
  try {
    console.log('Fetching forecast for worker:', workerId);

    // First, check if the worker exists
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single();

    if (workerError) {
      console.error('\nError fetching worker:', workerError);
      return;
    }
    console.log('\nWorker found:', worker);

    // Get all forecasts for debugging (without is_active filter)
    const { data: allForecasts, error: allForecastsError } = await supabase
      .from('monthly_revenue_forecasts')
      .select('*')
      .eq('worker_id', workerId);

    if (allForecastsError) {
      console.error('\nError fetching all forecasts:', allForecastsError);
      return;
    }
    console.log('\nAll forecasts found:', allForecasts?.length || 0);
    console.log(allForecasts);

    // Get active forecasts
    const { data: activeForecasts, error: activeForecastsError } = await supabase
      .from('monthly_revenue_forecasts')
      .select('*')
      .eq('worker_id', workerId)
      .eq('is_active', true);

    if (activeForecastsError) {
      console.error('\nError fetching active forecasts:', activeForecastsError);
      return;
    }
    console.log('\nActive forecasts found:', activeForecasts?.length || 0);
    console.log(activeForecasts);

    // Get December 2024 forecast specifically
    const { data: decForecast, error: decForecastError } = await supabase
      .from('monthly_revenue_forecasts')
      .select('*')
      .eq('worker_id', workerId)
      .eq('month', '2024-12-01')
      .single();

    if (decForecastError && decForecastError.code !== 'PGRST116') {
      console.error('\nError fetching December forecast:', decForecastError);
      return;
    }
    console.log('\nDecember 2024 forecast found:', decForecast ? 'Yes' : 'No');
    console.log(decForecast);

    // Get current month in YYYY-MM-DD format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    console.log('\nCurrent month:', currentMonth);

    // Get forecast for current month
    const { data: forecast, error } = await supabase
      .from('monthly_revenue_forecasts')
      .select('forecast_value, month')
      .eq('worker_id', workerId)
      .eq('month', currentMonth)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('\nError:', error);
      return;
    }

    console.log('\nForecast for current month:', forecast);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test with worker_id = 7
getMonthlyForecast(7);

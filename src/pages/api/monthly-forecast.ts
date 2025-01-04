import type { APIRoute } from 'astro';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// Create a new Supabase client for each request to ensure proper auth
function createSupabaseClient(authToken?: string): SupabaseClient<Database> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authToken ? {
        Authorization: `Bearer ${authToken}`
      } : {}
    }
  });
}

interface ForecastData {
  forecast_value: number;
  month: string;
}

interface Worker {
  id: number;
}

async function getWorkerIdFromUserId(supabase: SupabaseClient<Database>, userId: string): Promise<number | null> {
  try {
    // Try to find worker by user_id (auth user UUID)
    const { data: workers, error } = await supabase
      .from('workers')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error getting worker id:', error);
      return null;
    }

    if (!workers || !Array.isArray(workers) || workers.length === 0) {
      console.error('No worker found with user_id:', userId);
      return null;
    }

    const worker = workers[0] as Worker;
    if (!worker || typeof worker.id !== 'number') {
      console.error('Invalid worker data:', worker);
      return null;
    }

    return worker.id;
  } catch (error) {
    console.error('Error in getWorkerIdFromAuthId:', error);
    return null;
  }
}

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('Fetching monthly forecast...'); // Debug log
    
    console.log('Fetching monthly forecast...'); // Debug log
    
    // Get the auth token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!authToken) {
      console.error('No auth token found in Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized - Missing Bearer token' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create a new Supabase client with the auth token
    const supabase = createSupabaseClient(authToken);
    
    // Get current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('No authenticated user found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Auth user ID:', session.user.id); // Debug log

    // Get worker_id from user_id
    const workerId = await getWorkerIdFromUserId(supabase, session.user.id);
    
    if (workerId === null) {
      console.error('No worker found for auth user:', session.user.id);
      return new Response(JSON.stringify({ error: 'Worker not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Worker ID:', workerId); // Debug log

    // Get the current month in YYYY-MM-DD format
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    console.log('Current month:', currentMonth); // Debug log

    // Get the forecast for the current month and worker
    const { data: forecastData, error: forecastError } = await supabase
      .from('monthly_revenue_forecasts')
      .select('forecast_value, month')
      .eq('worker_id', workerId)
      .eq('month', currentMonth)
      .eq('is_active', true)
      .single<ForecastData>();

    console.log('Forecast query result:', { forecastData, forecastError }); // Debug log

    if (forecastError) {
      // If no forecast found
      if (forecastError.code === 'PGRST116') {
        console.log('No forecast found');
        return new Response(JSON.stringify({ 
          forecast: 0,
          month: currentMonth,
          message: 'No forecast found'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.error('Error fetching forecast:', forecastError);
      return new Response(JSON.stringify({ error: 'Failed to fetch forecast' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const response = {
      forecast: forecastData?.forecast_value || 0,
      month: forecastData?.month || currentMonth
    };
    console.log('Response data:', response); // Debug log

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error getting monthly forecast:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

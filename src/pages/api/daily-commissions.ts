import type { APIRoute } from 'astro';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getDailyComissions } from '../../../scripts/get-daily-comissions.mjs';
import type { CommissionData } from '../../types/commissions';
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

function isCommissionData(data: unknown): data is CommissionData {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as CommissionData).labels) &&
    Array.isArray((data as CommissionData).thisWeek) &&
    Array.isArray((data as CommissionData).lastWeek) &&
    (data as CommissionData).labels.every(item => typeof item === 'string') &&
    (data as CommissionData).thisWeek.every(item => typeof item === 'number') &&
    (data as CommissionData).lastWeek.every(item => typeof item === 'number')
  );
}

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('Fetching commission data...'); // Debug log
    
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

    // Pass worker ID as string to getDailyComissions
    const data = await getDailyComissions(workerId.toString());
    console.log('Raw commission data:', data); // Debug log
    
    if (!isCommissionData(data)) {
      console.error('Invalid commission data format:', data); // Debug log
      throw new Error('Invalid commission data format');
    }
    
    const response = JSON.stringify(data, null, 2);
    console.log('Response data:', response); // Debug log
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error getting daily commissions:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

import type { APIRoute } from 'astro';
import type { AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

interface SignInCredentials {
  email: string;
  password: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('Received sign-in request');
    
    const body = await request.json() as SignInCredentials;
    console.log('Request body:', { email: body.email, password: '***' });
    
    const { email, password } = body;
    if (!email || !password) {
      console.error('Missing credentials');
      return new Response(
        JSON.stringify({
          error: 'Email and password are required'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Attempting Supabase authentication...');
    const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!data.session) {
      console.error('No session data received from Supabase');
      return new Response(
        JSON.stringify({
          error: 'Authentication failed - no session created'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Authentication successful');
    return new Response(
      JSON.stringify({
        user: data.user,
        session: data.session
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

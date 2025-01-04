import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

async function supabaseRequest(endpoint, body = null) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${endpoint}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body || {})
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, body: ${error}`);
  }
  return response.json();
}

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');

    // Create tables using raw SQL
    const sql = `
    -- Create roles table
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Create workers table
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      role_id INTEGER REFERENCES roles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Create contract types table
    CREATE TABLE IF NOT EXISTS contract_types (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Create contracts table
    CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER REFERENCES workers(id),
      contract_type_id INTEGER REFERENCES contract_types(id),
      contract_number TEXT NOT NULL,
      date_signed DATE NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Create commissions table
    CREATE TABLE IF NOT EXISTS commissions (
      id SERIAL PRIMARY KEY,
      contract_type_id INTEGER REFERENCES contract_types(id),
      role_id INTEGER REFERENCES roles(id),
      commission DECIMAL NOT NULL,
      valid_from DATE,
      valid_to DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );
    `;

    // Execute SQL using Supabase's pg_dump function
    await supabaseRequest('exec_sql', 'POST', { sql });
    
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();

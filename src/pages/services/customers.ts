import { supabase, TABLES } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCustomer(customer: CustomerInsert): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create customer');
  return data;
}

export async function updateCustomer(id: number, customer: CustomerUpdate): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .update(customer)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Customer not found');
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  const { error } = await supabase
    .from(TABLES.CUSTOMERS)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Additional customer-specific functions
export async function getCustomersByWorker(workerId: number): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .select('*')
    .eq('assigned_worker_id', workerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCustomersByInterestLevel(level: number): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .select('*')
    .eq('interest_level', level)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCustomerWithAddress(id: number): Promise<Customer & { address: any }> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .select(`
      *,
      address:${TABLES.ADDRESSES}(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Customer not found');
  return data;
}

export async function updateCustomerConsent(
  id: number,
  consent: boolean
): Promise<Customer> {
  const { data, error } = await supabase
    .from(TABLES.CUSTOMERS)
    .update({ consultation_consent: consent })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Customer not found');
  return data;
}

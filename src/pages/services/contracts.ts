import { supabase, TABLES } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Contract = Database['public']['Tables']['contracts']['Row'];
type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export async function getContracts(): Promise<Contract[]> {
  const { data, error } = await supabase
    .from(TABLES.CONTRACTS)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getContractById(id: number): Promise<Contract | null> {
  const { data, error } = await supabase
    .from(TABLES.CONTRACTS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Get contract with related data
export async function getContractWithDetails(id: number) {
  const { data, error } = await supabase
    .from(TABLES.CONTRACTS)
    .select(`
      *,
      customer:${TABLES.CUSTOMERS}(*),
      worker:${TABLES.WORKERS}(*),
      address:${TABLES.ADDRESSES}(*),
      contract_type:${TABLES.CONTRACT_TYPES}(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

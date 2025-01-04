import { supabase, TABLES } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Worker = Database['public']['Tables']['workers']['Row'];
type WorkerInsert = Database['public']['Tables']['workers']['Insert'];
type WorkerUpdate = Database['public']['Tables']['workers']['Update'];

export async function getWorkers(): Promise<Worker[]> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWorkerById(id: number): Promise<Worker | null> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createWorker(worker: WorkerInsert): Promise<Worker> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .insert(worker)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create worker');
  return data;
}

export async function updateWorker(id: number, worker: WorkerUpdate): Promise<Worker> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .update(worker)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Worker not found');
  return data;
}

export async function deleteWorker(id: number): Promise<void> {
  const { error } = await supabase
    .from(TABLES.WORKERS)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Additional worker-specific functions
export async function getWorkersByRole(roleId: number): Promise<Worker[]> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .select('*')
    .eq('role_id', roleId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWorkersByManager(managerId: number): Promise<Worker[]> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .select('*')
    .eq('manager_id', managerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateWorkerLocation(
  id: number, 
  latitude: string, 
  longitude: string
): Promise<Worker> {
  const { data, error } = await supabase
    .from(TABLES.WORKERS)
    .update({
      current_latitude: latitude,
      current_longitude: longitude
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Worker not found');
  return data;
}

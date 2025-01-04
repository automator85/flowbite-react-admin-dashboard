export interface Database {
  public: {
    Tables: {
      workers: {
        Row: {
          id: number
          user_id: string | null
          created_at: string
          full_name: string
          email: string | null
          role_id: number | null
          profile_pic: string | null
          revenue_goal_month: number | null
          revenue_goal_daily: number | null
          manager_id: number | null
          current_latitude: number | null
          current_longitude: number | null
          organization: string | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          created_at?: string
          full_name: string
          email?: string | null
          role_id?: number | null
          profile_pic?: string | null
          revenue_goal_month?: number | null
          revenue_goal_daily?: number | null
          manager_id?: number | null
          current_latitude?: number | null
          current_longitude?: number | null
          organization?: string | null
        }
        Update: {
          id?: number
          user_id?: string | null
          created_at?: string
          full_name?: string
          email?: string | null
          role_id?: number | null
          profile_pic?: string | null
          revenue_goal_month?: number | null
          revenue_goal_daily?: number | null
          manager_id?: number | null
          current_latitude?: number | null
          current_longitude?: number | null
          organization?: string | null
        }
      }
      contracts: {
        Row: {
          id: number
          created_at: string
          worker_id: number
          contract_type_id: number
          contract_number: string
          date_signed: string
          status: string
        }
        Insert: {
          id?: number
          created_at?: string
          worker_id: number
          contract_type_id: number
          contract_number: string
          date_signed: string
          status?: string
        }
        Update: {
          id?: number
          created_at?: string
          worker_id?: number
          contract_type_id?: number
          contract_number?: string
          date_signed?: string
          status?: string
        }
      }
      monthly_revenue_forecasts: {
        Row: {
          id: number
          created_at: string
          month: string
          worker_id: number
          forecast_value: number
          details?: {
            calc: string
            sum_so_far: number
            daily_avg_7d: number
          }
          is_active: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          month: string
          worker_id: number
          forecast_value: number
          details?: {
            calc: string
            sum_so_far: number
            daily_avg_7d: number
          }
          is_active?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          month?: string
          worker_id?: number
          forecast_value?: number
          details?: {
            calc: string
            sum_so_far: number
            daily_avg_7d: number
          }
          is_active?: boolean
        }
      }
      comissions: {
        Row: {
          id: number
          created_at: string
          contract_type_id: number
          role_id: number
          comission: number
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          contract_type_id: number
          role_id: number
          comission: number
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          contract_type_id?: number
          role_id?: number
          comission?: number
          valid_from?: string
          valid_to?: string | null
        }
      }
    }
  }
}

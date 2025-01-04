# Supabase Database Structure

## Tables

### addresses
- id: integer
- created_at: timestamp without time zone
- street: varchar
- house_number: varchar
- zip_code: varchar
- city: varchar
- country: varchar
- latitude: numeric
- longitude: numeric
- max_units: integer
- created_by_user_id: uuid

### comissions
- id: integer
- created_at: timestamp without time zone
- contract_type_id: integer
- role_id: integer
- comission: numeric
- valid_from: date
- valid_to: date

### contract_categories
- id: bigint
- created_at: timestamp with time zone
- category: text
- active: boolean

### contract_companies
- id: bigint
- created_at: timestamp with time zone
- company: text
- actice: boolean
- color_code: text
- color_code2: text

### contract_types
- id: integer
- created_at: timestamp without time zone
- type: text
- company: text
- category: text
- description: text
- active: boolean

### contracts
- id: integer
- created_at: timestamp without time zone
- customer_id: integer
- address_id: integer
- worker_id: integer
- contract_type_id: integer
- signature_png: bytea
- signature_base64: text
- contract_number: text
- status: text
- date_signed: date

### customers
- id: integer
- created_at: timestamp without time zone
- first_name: varchar
- last_name: varchar
- birthdate: date
- email: varchar
- phone_number: varchar
- floor: varchar
- notes: text
- assigned_worker_id: integer
- address_id: integer
- interest_level: integer
- consultation_consent: boolean
- signature_png: bytea
- signature_base64: text
- bank_details: text

### daily_revenue
- id: integer
- revenue_date: date
- worker_id: integer
- revenue: numeric
- created_at: timestamp without time zone
- updated_at: timestamp without time zone

### monthly_revenue
- id: integer
- month_start: date
- month_end: date
- worker_id: integer
- revenue: numeric
- created_at: timestamp without time zone
- updated_at: timestamp without time zone

### monthly_revenue_forecasts
- id: bigint
- created_at: timestamp with time zone
- month: date
- worker_id: integer
- forecast_value: numeric
- details: jsonb
- is_active: boolean

### organization
- id: bigint
- created_at: timestamp with time zone
- name: text
- email: text
- phone: text
- address: text
- active: boolean

### payroll
- id: bigint
- created_at: timestamp with time zone
- worker: integer
- month: date
- fix_salary: numeric
- provision: numeric
- bonus: numeric
- sum: numeric

### roles
- id: integer
- role_name: varchar
- description: text

### weekly_revenue
- id: integer
- week_start: date
- week_end: date
- worker_id: integer
- revenue: numeric
- created_at: timestamp without time zone
- updated_at: timestamp without time zone

### workers
- id: integer
- user_id: uuid
- created_at: timestamp without time zone
- full_name: varchar
- email: text
- role_id: integer
- profile_pic: text
- revenue_goal_month: numeric
- revenue_goal_daily: numeric
- manager_id: integer
- current_latitude: text
- current_longitude: text
- organization: text

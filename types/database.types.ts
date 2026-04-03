// Auto-generate this file with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
// Manually maintained until a Supabase project ID is set up.
// Diagnosis engine tables (issue_categories … diagnosis_answers) added by migration
// 20260327000000_diagnosis_engine.sql — update this file after running:
//   npx supabase gen types typescript --project-id <id>
// Part requests tables (part_requests, part_request_items) added by migration
// 20260328000000_part_requests.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'customer' | 'technician' | 'admin'
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'technician' | 'admin'
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'customer' | 'technician' | 'admin'
          onboarding_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Diagnosis engine tables
      // -----------------------------------------------------------------------

      issue_categories: {
        Row: {
          id:          string
          label:       string
          description: string
          sort_order:  number
          is_active:   boolean
          created_at:  string
        }
        Insert: {
          id?:         string
          label:       string
          description: string
          sort_order?: number
          is_active?:  boolean
          created_at?: string
        }
        Update: {
          id?:          string
          label?:       string
          description?: string
          sort_order?:  number
          is_active?:   boolean
        }
        Relationships: []
      }

      diagnosis_questions: {
        Row: {
          id:                string
          issue_category_id: string
          question_text:     string
          hint_text:         string | null
          sort_order:        number
          is_active:         boolean
          created_at:        string
        }
        Insert: {
          id?:               string
          issue_category_id: string
          question_text:     string
          hint_text?:        string | null
          sort_order?:       number
          is_active?:        boolean
          created_at?:       string
        }
        Update: {
          id?:               string
          issue_category_id?: string
          question_text?:    string
          hint_text?:        string | null
          sort_order?:       number
          is_active?:        boolean
        }
        Relationships: []
      }

      diagnosis_options: {
        Row: {
          id:               string
          question_id:      string
          option_text:      string
          sort_order:       number
          next_question_id: string | null
          created_at:       string
        }
        Insert: {
          id?:              string
          question_id:      string
          option_text:      string
          sort_order?:      number
          next_question_id?: string | null
          created_at?:      string
        }
        Update: {
          id?:               string
          question_id?:      string
          option_text?:      string
          sort_order?:       number
          next_question_id?: string | null
        }
        Relationships: []
      }

      diagnosis_outcomes: {
        Row: {
          id:                 string
          issue_category_id:  string
          title:              string
          description:        string
          recommended_action: string
          urgency:            'low' | 'medium' | 'high'
          conditions:         Json   // OutcomeCondition[] — cast in repository layer
          is_active:          boolean
          created_at:         string
        }
        Insert: {
          id?:                string
          issue_category_id:  string
          title:              string
          description:        string
          recommended_action: string
          urgency?:           'low' | 'medium' | 'high'
          conditions?:        Json
          is_active?:         boolean
          created_at?:        string
        }
        Update: {
          id?:                string
          issue_category_id?: string
          title?:             string
          description?:       string
          recommended_action?: string
          urgency?:           'low' | 'medium' | 'high'
          conditions?:        Json
          is_active?:         boolean
        }
        Relationships: []
      }

      parts: {
        Row: {
          id:            string
          name:          string
          part_number:   string
          description:   string | null
          price:         number
          is_active:     boolean
          stock:         number | null   // NULL = not tracked; 0 = out of stock
          compatibility: string | null   // comma-separated compatible models
          created_at:    string
        }
        Insert: {
          id?:            string
          name:           string
          part_number:    string
          description?:   string | null
          price:          number
          is_active?:     boolean
          stock?:         number | null
          compatibility?: string | null
          created_at?:    string
        }
        Update: {
          id?:            string
          name?:          string
          part_number?:   string
          description?:   string | null
          price?:         number
          is_active?:     boolean
          stock?:         number | null
          compatibility?: string | null
        }
        Relationships: []
      }

      outcome_parts: {
        Row: {
          outcome_id: string
          part_id:    string
          sort_order: number
        }
        Insert: {
          outcome_id: string
          part_id:    string
          sort_order?: number
        }
        Update: {
          outcome_id?: string
          part_id?:    string
          sort_order?: number
        }
        Relationships: []
      }

      diagnosis_sessions: {
        Row: {
          id:                string
          user_id:           string
          machine_id:        string | null
          issue_category_id: string | null
          status:            'in_progress' | 'completed' | 'escalated' | 'abandoned'
          outcome_id:        string | null
          confidence_score:  number | null
          completed_at:      string | null
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:               string
          user_id:           string
          machine_id?:       string | null
          issue_category_id?: string | null
          status?:           'in_progress' | 'completed' | 'escalated' | 'abandoned'
          outcome_id?:       string | null
          confidence_score?: number | null
          completed_at?:     string | null
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          id?:               string
          user_id?:          string
          machine_id?:       string | null
          issue_category_id?: string | null
          status?:           'in_progress' | 'completed' | 'escalated' | 'abandoned'
          outcome_id?:       string | null
          confidence_score?: number | null
          completed_at?:     string | null
          updated_at?:       string
        }
        Relationships: []
      }

      diagnosis_answers: {
        Row: {
          id:          string
          session_id:  string
          question_id: string
          option_id:   string
          answered_at: string
        }
        Insert: {
          id?:         string
          session_id:  string
          question_id: string
          option_id:   string
          answered_at?: string
        }
        Update: {
          id?:          string
          session_id?:  string
          question_id?: string
          option_id?:   string
          answered_at?: string
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Technician applications table
      // -----------------------------------------------------------------------

      technician_applications: {
        Row: {
          id:                   string
          user_id:              string
          full_name:            string
          phone:                string | null
          bio:                  string | null
          city:                 string | null
          province:             string | null
          service_radius_km:    number | null
          service_areas:        string[]
          years_experience:     number | null
          departments:          string[]
          machine_categories:   string[]
          skills:               string[]
          id_document_url:      string | null
          qualification_urls:   string[]
          agreed_to_terms:      boolean
          agreed_at:            string | null
          status:               'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
          rejection_reason:     string | null
          admin_notes:          string | null
          reviewed_by:          string | null
          reviewed_at:          string | null
          affiliation_level:    'affiliate_technician' | 'certified_technician' | 'certified_partner'
          level_updated_at:     string | null
          territory_priority:   number
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                  string
          user_id:              string
          full_name:            string
          phone?:               string | null
          bio?:                 string | null
          city?:                string | null
          province?:            string | null
          service_radius_km?:   number | null
          service_areas?:       string[]
          years_experience?:    number | null
          departments?:         string[]
          machine_categories?:  string[]
          skills?:              string[]
          id_document_url?:     string | null
          qualification_urls?:  string[]
          agreed_to_terms?:     boolean
          agreed_at?:           string | null
          status?:              'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
          rejection_reason?:    string | null
          admin_notes?:         string | null
          reviewed_by?:         string | null
          reviewed_at?:         string | null
          affiliation_level?:   'affiliate_technician' | 'certified_technician' | 'certified_partner'
          level_updated_at?:    string | null
          territory_priority?:  number
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          id?:                  string
          user_id?:             string
          full_name?:           string
          phone?:               string | null
          bio?:                 string | null
          city?:                string | null
          province?:            string | null
          service_radius_km?:   number | null
          service_areas?:       string[]
          years_experience?:    number | null
          departments?:         string[]
          machine_categories?:  string[]
          skills?:              string[]
          id_document_url?:     string | null
          qualification_urls?:  string[]
          agreed_to_terms?:     boolean
          agreed_at?:           string | null
          status?:              'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_info'
          rejection_reason?:    string | null
          admin_notes?:         string | null
          reviewed_by?:         string | null
          reviewed_at?:         string | null
          affiliation_level?:   'affiliate_technician' | 'certified_technician' | 'certified_partner'
          level_updated_at?:    string | null
          territory_priority?:  number
          updated_at?:          string
        }
        Relationships: [
          {
            foreignKeyName: "technician_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      // -----------------------------------------------------------------------
      // Technician dashboard tables
      // -----------------------------------------------------------------------

      technician_leads: {
        Row: {
          id:                string
          lead_number:       string
          title:             string
          description:       string | null
          category:          string | null
          location_city:     string | null
          location_province: string | null
          urgency:           'low' | 'normal' | 'high' | 'urgent'
          status:            'open' | 'assigned' | 'closed' | 'expired'
          assigned_to:       string | null
          created_by:        string | null
          expires_at:        string | null
          created_at:        string
          updated_at:        string
        }
        Insert: {
          id?:               string
          lead_number?:      string
          title:             string
          description?:      string | null
          category?:         string | null
          location_city?:    string | null
          location_province?: string | null
          urgency?:          'low' | 'normal' | 'high' | 'urgent'
          status?:           'open' | 'assigned' | 'closed' | 'expired'
          assigned_to?:      string | null
          created_by?:       string | null
          expires_at?:       string | null
          created_at?:       string
          updated_at?:       string
        }
        Update: {
          id?:               string
          lead_number?:      string
          title?:            string
          description?:      string | null
          category?:         string | null
          location_city?:    string | null
          location_province?: string | null
          urgency?:          'low' | 'normal' | 'high' | 'urgent'
          status?:           'open' | 'assigned' | 'closed' | 'expired'
          assigned_to?:      string | null
          created_by?:       string | null
          expires_at?:       string | null
          updated_at?:       string
        }
        Relationships: []
      }

      technician_jobs: {
        Row: {
          id:                string
          job_number:        string
          lead_id:           string | null
          technician_id:     string
          title:             string
          description:       string | null
          category:          string | null
          customer_name:     string | null
          customer_phone:    string | null
          location_address:  string | null
          location_city:     string | null
          location_province: string | null
          scheduled_date:    string | null
          status:            'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'
          completion_notes:  string | null
          actual_fault:      string | null
          cancelled_reason:  string | null
          admin_notes:       string | null
          points_awarded:    number | null
          accepted_at:       string | null
          created_at:        string
          updated_at:        string
          completed_at:      string | null
        }
        Insert: {
          id?:               string
          job_number?:       string
          lead_id?:          string | null
          technician_id:     string
          title:             string
          description?:      string | null
          category?:         string | null
          customer_name?:    string | null
          customer_phone?:   string | null
          location_address?: string | null
          location_city?:    string | null
          location_province?: string | null
          scheduled_date?:   string | null
          status?:           'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'
          completion_notes?: string | null
          actual_fault?:     string | null
          cancelled_reason?: string | null
          admin_notes?:      string | null
          points_awarded?:   number | null
          accepted_at?:      string | null
          created_at?:       string
          updated_at?:       string
          completed_at?:     string | null
        }
        Update: {
          id?:               string
          job_number?:       string
          lead_id?:          string | null
          technician_id?:    string
          title?:            string
          description?:      string | null
          category?:         string | null
          customer_name?:    string | null
          customer_phone?:   string | null
          location_address?: string | null
          location_city?:    string | null
          location_province?: string | null
          scheduled_date?:   string | null
          status?:           'assigned' | 'en_route' | 'on_site' | 'completed' | 'cancelled'
          completion_notes?: string | null
          actual_fault?:     string | null
          cancelled_reason?: string | null
          admin_notes?:      string | null
          points_awarded?:   number | null
          accepted_at?:      string | null
          updated_at?:       string
          completed_at?:     string | null
        }
        Relationships: []
      }

      technician_lead_assignments: {
        Row: {
          id:             string
          lead_id:        string
          technician_id:  string
          status:         'offered' | 'accepted' | 'declined' | 'expired'
          offered_at:     string
          responded_at:   string | null
          expires_at:     string | null
          job_id:         string | null
          decline_reason: string | null
          note:           string | null
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:            string
          lead_id:        string
          technician_id:  string
          status?:        'offered' | 'accepted' | 'declined' | 'expired'
          offered_at?:    string
          responded_at?:  string | null
          expires_at?:    string | null
          job_id?:        string | null
          decline_reason?: string | null
          note?:          string | null
          created_at?:    string
          updated_at?:    string
        }
        Update: {
          id?:            string
          lead_id?:       string
          technician_id?: string
          status?:        'offered' | 'accepted' | 'declined' | 'expired'
          offered_at?:    string
          responded_at?:  string | null
          expires_at?:    string | null
          job_id?:        string | null
          decline_reason?: string | null
          note?:          string | null
          updated_at?:    string
        }
        Relationships: [
          {
            foreignKeyName: "technician_lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "technician_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_lead_assignments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }

      technician_job_logs: {
        Row: {
          id:          string
          job_id:      string
          actor_id:    string | null
          actor_role:  'technician' | 'admin' | 'system'
          action:      'job_created' | 'status_changed' | 'note_added' | 'fault_captured' | 'admin_override' | 'cancelled' | 'points_awarded' | 'admin_note_added'
          prev_value:  string | null
          next_value:  string | null
          note:        string | null
          created_at:  string
        }
        Insert: {
          id?:         string
          job_id:      string
          actor_id?:   string | null
          actor_role?: 'technician' | 'admin' | 'system'
          action:      'job_created' | 'status_changed' | 'note_added' | 'fault_captured' | 'admin_override' | 'cancelled' | 'points_awarded' | 'admin_note_added'
          prev_value?: string | null
          next_value?: string | null
          note?:       string | null
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: "technician_job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "technician_jobs"
            referencedColumns: ["id"]
          }
        ]
      }

      technician_points: {
        Row: {
          id:            string
          technician_id: string
          job_id:        string | null
          points:        number
          reason:        'job_completed' | 'bonus' | 'adjustment' | 'redemption'
          state:         'pending' | 'released' | 'voided'
          released_at:   string | null
          released_by:   string | null
          void_reason:   string | null
          source_ref:    string | null
          note:          string | null
          created_at:    string
        }
        Insert: {
          id?:           string
          technician_id: string
          job_id?:       string | null
          points:        number
          reason?:       'job_completed' | 'bonus' | 'adjustment' | 'redemption'
          state?:        'pending' | 'released' | 'voided'
          released_at?:  string | null
          released_by?:  string | null
          void_reason?:  string | null
          source_ref?:   string | null
          note?:         string | null
          created_at?:   string
        }
        Update: {
          id?:           string
          technician_id?: string
          job_id?:       string | null
          points?:       number
          reason?:       'job_completed' | 'bonus' | 'adjustment' | 'redemption'
          state?:        'pending' | 'released' | 'voided'
          released_at?:  string | null
          released_by?:  string | null
          void_reason?:  string | null
          source_ref?:   string | null
          note?:         string | null
        }
        Relationships: []
      }

      technician_rewards: {
        Row: {
          id:          string
          title:       string
          description: string | null
          points_cost: number
          category:    'voucher' | 'tool' | 'merchandise' | 'cash_equivalent'
          is_active:   boolean
          stock:       number | null
          created_at:  string
        }
        Insert: {
          id?:         string
          title:       string
          description?: string | null
          points_cost: number
          category?:   'voucher' | 'tool' | 'merchandise' | 'cash_equivalent'
          is_active?:  boolean
          stock?:      number | null
          created_at?: string
        }
        Update: {
          id?:         string
          title?:      string
          description?: string | null
          points_cost?: number
          category?:   'voucher' | 'tool' | 'merchandise' | 'cash_equivalent'
          is_active?:  boolean
          stock?:      number | null
        }
        Relationships: []
      }

      technician_reward_redemptions: {
        Row: {
          id:            string
          technician_id: string
          reward_id:     string
          points_spent:  number
          status:        'pending' | 'fulfilled' | 'cancelled'
          note:          string | null
          created_at:    string
          processed_at:  string | null
        }
        Insert: {
          id?:           string
          technician_id: string
          reward_id:     string
          points_spent:  number
          status?:       'pending' | 'fulfilled' | 'cancelled'
          note?:         string | null
          created_at?:   string
          processed_at?: string | null
        }
        Update: {
          id?:           string
          technician_id?: string
          reward_id?:    string
          points_spent?: number
          status?:       'pending' | 'fulfilled' | 'cancelled'
          note?:         string | null
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "technician_rewards"
            referencedColumns: ["id"]
          }
        ]
      }

      // -----------------------------------------------------------------------
      // Part requests tables
      // -----------------------------------------------------------------------

      part_requests: {
        Row: {
          id:               string
          request_number:   string
          user_id:          string
          status:           'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          customer_name:    string
          customer_email:   string
          customer_company: string | null
          customer_phone:   string | null
          shipping_address: string | null
          notes:            string | null
          admin_notes:      string | null
          created_at:       string
          updated_at:       string
          confirmed_at:     string | null
          shipped_at:       string | null
          delivered_at:     string | null
        }
        Insert: {
          id?:               string
          request_number?:   string
          user_id:           string
          status?:           'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          customer_name:     string
          customer_email:    string
          customer_company?: string | null
          customer_phone?:   string | null
          shipping_address?: string | null
          notes?:            string | null
          admin_notes?:      string | null
          created_at?:       string
          updated_at?:       string
          confirmed_at?:     string | null
          shipped_at?:       string | null
          delivered_at?:     string | null
        }
        Update: {
          id?:               string
          request_number?:   string
          user_id?:          string
          status?:           'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          customer_name?:    string
          customer_email?:   string
          customer_company?: string | null
          customer_phone?:   string | null
          shipping_address?: string | null
          notes?:            string | null
          admin_notes?:      string | null
          updated_at?:       string
          confirmed_at?:     string | null
          shipped_at?:       string | null
          delivered_at?:     string | null
        }
        Relationships: []
      }

      part_request_items: {
        Row: {
          id:            string
          request_id:    string
          part_number:   string
          part_name:     string
          part_category: string
          quantity:      number
          notes:         string | null
          created_at:    string
        }
        Insert: {
          id?:            string
          request_id:     string
          part_number:    string
          part_name:      string
          part_category?: string
          quantity?:      number
          notes?:         string | null
          created_at?:    string
        }
        Update: {
          id?:            string
          request_id?:    string
          part_number?:   string
          part_name?:     string
          part_category?: string
          quantity?:      number
          notes?:         string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "part_requests"
            referencedColumns: ["id"]
          }
        ]
      }

      // -----------------------------------------------------------------------
      // Machines table
      // -----------------------------------------------------------------------

      machines: {
        Row: {
          id:           string
          user_id:      string
          name:         string
          brand:        string | null
          model:        string | null
          serial_number: string | null
          year:         number | null
          notes:        string | null
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id?:           string
          user_id:       string
          name:          string
          brand?:        string | null
          model?:        string | null
          serial_number?: string | null
          year?:         number | null
          notes?:        string | null
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          id?:           string
          user_id?:      string
          name?:         string
          brand?:        string | null
          model?:        string | null
          serial_number?: string | null
          year?:         number | null
          notes?:        string | null
          updated_at?:   string
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Support tickets table
      // -----------------------------------------------------------------------

      support_tickets: {
        Row: {
          id:             string
          ticket_number:  string
          user_id:        string
          subject:        string
          description:    string | null
          status:         'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
          priority:       'low' | 'medium' | 'high' | 'urgent'
          assigned_to:    string | null
          resolved_at:    string | null
          created_at:     string
          updated_at:     string
        }
        Insert: {
          id?:            string
          ticket_number?: string
          user_id:        string
          subject:        string
          description?:   string | null
          status?:        'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
          priority?:      'low' | 'medium' | 'high' | 'urgent'
          assigned_to?:   string | null
          resolved_at?:   string | null
          created_at?:    string
          updated_at?:    string
        }
        Update: {
          id?:            string
          ticket_number?: string
          user_id?:       string
          subject?:       string
          description?:   string | null
          status?:        'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
          priority?:      'low' | 'medium' | 'high' | 'urgent'
          assigned_to?:   string | null
          resolved_at?:   string | null
          updated_at?:    string
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Risk logs table
      // -----------------------------------------------------------------------

      risk_logs: {
        Row: {
          id:           string
          event_type:   string
          severity:     'low' | 'medium' | 'high' | 'critical'
          status:       'open' | 'investigating' | 'resolved' | 'dismissed'
          description:  string
          actor_id:     string | null
          resolved_at:  string | null
          resolved_by:  string | null
          created_at:   string
        }
        Insert: {
          id?:          string
          event_type:   string
          severity?:    'low' | 'medium' | 'high' | 'critical'
          status?:      'open' | 'investigating' | 'resolved' | 'dismissed'
          description:  string
          actor_id?:    string | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?:  string
        }
        Update: {
          id?:          string
          event_type?:  string
          severity?:    'low' | 'medium' | 'high' | 'critical'
          status?:      'open' | 'investigating' | 'resolved' | 'dismissed'
          description?: string
          actor_id?:    string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Reviews table
      // -----------------------------------------------------------------------

      reviews: {
        Row: {
          id:            string
          user_id:       string
          technician_id: string | null
          job_id:        string | null
          rating:        number
          comment:       string | null
          is_published:  boolean
          created_at:    string
        }
        Insert: {
          id?:            string
          user_id:        string
          technician_id?: string | null
          job_id?:        string | null
          rating:         number
          comment?:       string | null
          is_published?:  boolean
          created_at?:    string
        }
        Update: {
          id?:            string
          user_id?:       string
          technician_id?: string | null
          job_id?:        string | null
          rating?:        number
          comment?:       string | null
          is_published?:  boolean
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Custom requests table
      // -----------------------------------------------------------------------

      custom_requests: {
        Row: {
          id:              string
          request_number:  string
          user_id:         string
          title:           string
          description:     string | null
          status:          'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'
          budget:          number | null
          admin_notes:     string | null
          created_at:      string
          updated_at:      string
        }
        Insert: {
          id?:             string
          request_number?: string
          user_id:         string
          title:           string
          description?:    string | null
          status?:         'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'
          budget?:         number | null
          admin_notes?:    string | null
          created_at?:     string
          updated_at?:     string
        }
        Update: {
          id?:             string
          request_number?: string
          user_id?:        string
          title?:          string
          description?:    string | null
          status?:         'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'completed'
          budget?:         number | null
          admin_notes?:    string | null
          updated_at?:     string
        }
        Relationships: []
      }

      // -----------------------------------------------------------------------
      // Affiliation level tables
      // -----------------------------------------------------------------------

      technician_level_criteria: {
        Row: {
          level:               'certified_technician' | 'certified_partner'
          min_jobs_completed:  number
          min_points_balance:  number
          min_days_at_level:   number
          description:         string | null
        }
        Insert: {
          level:               'certified_technician' | 'certified_partner'
          min_jobs_completed:  number
          min_points_balance:  number
          min_days_at_level?:  number
          description?:        string | null
        }
        Update: {
          level?:              'certified_technician' | 'certified_partner'
          min_jobs_completed?: number
          min_points_balance?: number
          min_days_at_level?:  number
          description?:        string | null
        }
        Relationships: []
      }

      technician_level_requests: {
        Row: {
          id:                       string
          technician_id:            string
          requested_level:          'certified_technician' | 'certified_partner'
          current_level:            'affiliate_technician' | 'certified_technician' | 'certified_partner'
          snapshot_jobs_completed:  number
          snapshot_points_balance:  number
          snapshot_days_at_level:   number
          status:                   'pending' | 'approved' | 'rejected'
          reviewed_by:              string | null
          reviewed_at:              string | null
          rejection_reason:         string | null
          admin_notes:              string | null
          created_at:               string
        }
        Insert: {
          id?:                      string
          technician_id:            string
          requested_level:          'certified_technician' | 'certified_partner'
          current_level:            'affiliate_technician' | 'certified_technician' | 'certified_partner'
          snapshot_jobs_completed:  number
          snapshot_points_balance:  number
          snapshot_days_at_level:   number
          status?:                  'pending' | 'approved' | 'rejected'
          reviewed_by?:             string | null
          reviewed_at?:             string | null
          rejection_reason?:        string | null
          admin_notes?:             string | null
          created_at?:              string
        }
        Update: {
          status?:           'pending' | 'approved' | 'rejected'
          reviewed_by?:      string | null
          reviewed_at?:      string | null
          rejection_reason?: string | null
          admin_notes?:      string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_level_requests_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_stale_leads: {
        Args: Record<string, never>
        Returns: undefined
      }
      accept_technician_lead: {
        Args: { p_lead_id: string }
        Returns: Json
      }
      decline_technician_lead: {
        Args: { p_lead_id: string; p_reason?: string }
        Returns: Json
      }
      update_job_status_with_log: {
        Args: {
          p_job_id: string
          p_status: string
          p_notes?: string
          p_actual_fault?: string
        }
        Returns: Json
      }
      capture_job_fault: {
        Args: { p_job_id: string; p_fault: string }
        Returns: Json
      }
      admin_override_job_status: {
        Args: { p_job_id: string; p_status: string; p_reason?: string }
        Returns: Json
      }
      release_points_entry: {
        Args: { p_points_id: string }
        Returns: Json
      }
      void_points_entry: {
        Args: { p_points_id: string; p_reason?: string }
        Returns: Json
      }
      admin_grant_points: {
        Args: {
          p_technician_id: string
          p_points: number
          p_reason?: string
          p_note?: string
        }
        Returns: Json
      }
      fulfill_redemption: {
        Args: { p_redemption_id: string; p_note?: string }
        Returns: Json
      }
      cancel_redemption: {
        Args: { p_redemption_id: string; p_note?: string }
        Returns: Json
      }
      evaluate_progression_criteria: {
        Args: { p_technician_id: string }
        Returns: Json
      }
      request_level_promotion: {
        Args: { p_technician_id: string }
        Returns: Json
      }
      approve_level_promotion: {
        Args: { p_request_id: string; p_admin_notes?: string }
        Returns: Json
      }
      reject_level_promotion: {
        Args: { p_request_id: string; p_reason?: string }
        Returns: Json
      }
      admin_set_level: {
        Args: { p_technician_id: string; p_level: string; p_notes?: string }
        Returns: Json
      }
    }
    Enums: {
      user_role: 'customer' | 'technician' | 'admin'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

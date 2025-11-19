export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chats: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          chat_id: string
          content: string
          id: string
          role: string
          timestamp: string | null
        }
        Insert: {
          chat_id: string
          content: string
          id?: string
          role: string
          timestamp?: string | null
        }
        Update: {
          chat_id?: string
          content?: string
          id?: string
          role?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_performance_metrics: {
        Row: {
          category: string | null
          chat_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          model_used: string
          prompt_length: number | null
          response_length: number | null
          response_time_ms: number
          sentiment_label: string | null
          sentiment_score: number | null
          tokens_used: number | null
          user_id: string
          user_satisfaction: number | null
        }
        Insert: {
          category?: string | null
          chat_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used: string
          prompt_length?: number | null
          response_length?: number | null
          response_time_ms: number
          sentiment_label?: string | null
          sentiment_score?: number | null
          tokens_used?: number | null
          user_id: string
          user_satisfaction?: number | null
        }
        Update: {
          category?: string | null
          chat_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string
          prompt_length?: number | null
          response_length?: number | null
          response_time_ms?: number
          sentiment_label?: string | null
          sentiment_score?: number | null
          tokens_used?: number | null
          user_id?: string
          user_satisfaction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_performance_metrics_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          status: string | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          status?: string | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          status?: string | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automations: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_size_bytes: number | null
          backup_type: string
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          s3_bucket: string | null
          s3_key: string | null
          s3_url: string | null
          started_at: string | null
          status: string
          tables_backed_up: string[] | null
          total_rows: number | null
        }
        Insert: {
          backup_size_bytes?: number | null
          backup_type: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          s3_bucket?: string | null
          s3_key?: string | null
          s3_url?: string | null
          started_at?: string | null
          status?: string
          tables_backed_up?: string[] | null
          total_rows?: number | null
        }
        Update: {
          backup_size_bytes?: number | null
          backup_type?: string
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          s3_bucket?: string | null
          s3_key?: string | null
          s3_url?: string | null
          started_at?: string | null
          status?: string
          tables_backed_up?: string[] | null
          total_rows?: number | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          connection_id: string
          contact_avatar: string | null
          contact_name: string
          contact_number: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          connection_id: string
          contact_avatar?: string | null
          contact_name: string
          contact_number: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          connection_id?: string
          contact_avatar?: string | null
          contact_name?: string
          contact_number?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_execution_logs: {
        Row: {
          duration_ms: number | null
          errors: string[] | null
          execution_finished_at: string | null
          execution_started_at: string | null
          id: string
          messages_failed: number | null
          messages_processed: number | null
          messages_sent: number | null
          status: string | null
        }
        Insert: {
          duration_ms?: number | null
          errors?: string[] | null
          execution_finished_at?: string | null
          execution_started_at?: string | null
          id?: string
          messages_failed?: number | null
          messages_processed?: number | null
          messages_sent?: number | null
          status?: string | null
        }
        Update: {
          duration_ms?: number | null
          errors?: string[] | null
          execution_finished_at?: string | null
          execution_started_at?: string | null
          id?: string
          messages_failed?: number | null
          messages_processed?: number | null
          messages_sent?: number | null
          status?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          email_to: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          resend_message_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_to: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          resend_message_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_to?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          resend_message_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kiwify_webhooks_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      message_history: {
        Row: {
          error_message: string | null
          id: string
          metadata: Json | null
          scheduled_message_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          scheduled_message_id?: string | null
          sent_at?: string | null
          status: string
        }
        Update: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          scheduled_message_id?: string | null
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_history_scheduled_message_id_fkey"
            columns: ["scheduled_message_id"]
            isOneToOne: false
            referencedRelation: "scheduled_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "message_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_from_me: boolean | null
          media_url: string | null
          message_type: string
          status: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_from_me?: boolean | null
          media_url?: string | null
          message_type?: string
          status?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_from_me?: boolean | null
          media_url?: string | null
          message_type?: string
          status?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          error_message: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          platform_type: string
          platform_user_id: string
          platform_username: string | null
          refresh_token: string | null
          status: string
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          platform_type: string
          platform_user_id: string
          platform_username?: string | null
          refresh_token?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          platform_type?: string
          platform_user_id?: string
          platform_username?: string | null
          refresh_token?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      platform_messages: {
        Row: {
          connection_id: string
          content: string
          created_at: string | null
          id: string
          is_from_me: boolean | null
          media_url: string | null
          message_type: string | null
          metadata: Json | null
          platform_message_id: string
          platform_type: string
          recipient_id: string
          recipient_name: string | null
          sender_id: string
          sender_name: string | null
          status: string | null
          timestamp: string
        }
        Insert: {
          connection_id: string
          content: string
          created_at?: string | null
          id?: string
          is_from_me?: boolean | null
          media_url?: string | null
          message_type?: string | null
          metadata?: Json | null
          platform_message_id: string
          platform_type: string
          recipient_id: string
          recipient_name?: string | null
          sender_id: string
          sender_name?: string | null
          status?: string | null
          timestamp: string
        }
        Update: {
          connection_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_from_me?: boolean | null
          media_url?: string | null
          message_type?: string | null
          metadata?: Json | null
          platform_message_id?: string
          platform_type?: string
          recipient_id?: string
          recipient_name?: string | null
          sender_id?: string
          sender_name?: string | null
          status?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          connection_id: string
          contact_name: string
          contact_number: string
          created_at: string | null
          error_message: string | null
          id: string
          last_sent_at: string | null
          message_content: string
          next_run_at: string | null
          recurrence_config: Json | null
          recurrence_end_date: string | null
          recurrence_type: string | null
          scheduled_for: string
          sent_count: number | null
          status: string | null
          template_id: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_id: string
          contact_name: string
          contact_number: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sent_at?: string | null
          message_content: string
          next_run_at?: string | null
          recurrence_config?: Json | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          scheduled_for: string
          sent_count?: number | null
          status?: string | null
          template_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_id?: string
          contact_name?: string
          contact_number?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sent_at?: string | null
          message_content?: string
          next_run_at?: string | null
          recurrence_config?: Json | null
          recurrence_end_date?: string | null
          recurrence_type?: string | null
          scheduled_for?: string
          sent_count?: number | null
          status?: string | null
          template_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "scheduled_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          canceled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          kiwify_product_id: string
          kiwify_subscription_id: string | null
          metadata: Json | null
          payment_method: string | null
          plan_name: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          canceled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          kiwify_product_id: string
          kiwify_subscription_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          plan_name: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          kiwify_product_id?: string
          kiwify_subscription_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          plan_name?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          category: string
          created_at: string | null
          id: string
          log_level: string
          message: string
          metadata: Json | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          log_level: string
          message: string
          metadata?: Json | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          log_level?: string
          message?: string
          metadata?: Json | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_gmail_manager: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string
          expires_at: string
          full_name: string | null
          id: string
          is_active: boolean | null
          session_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          session_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          session_id?: string | null
        }
        Relationships: []
      }
      temp_gmail_received: {
        Row: {
          body_html: string | null
          body_text: string | null
          from_address: string | null
          id: string
          is_read: boolean | null
          message_id: string | null
          received_at: string | null
          subject: string | null
          temp_email_id: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          from_address?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          received_at?: string | null
          subject?: string | null
          temp_email_id: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          from_address?: string | null
          id?: string
          is_read?: boolean | null
          message_id?: string | null
          received_at?: string | null
          subject?: string | null
          temp_email_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temp_gmail_received_temp_email_id_fkey"
            columns: ["temp_email_id"]
            isOneToOne: false
            referencedRelation: "temp_gmail_manager"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled: boolean | null
          id: string
          secret: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          secret?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_2fa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_2fa_backup_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_2fa_backup_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          ai_language: string | null
          ai_tone: string | null
          auto_reply_enabled: boolean | null
          created_at: string | null
          id: string
          notifications_enabled: boolean | null
          scanline_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_language?: string | null
          ai_tone?: string | null
          auto_reply_enabled?: boolean | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          scanline_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_language?: string | null
          ai_tone?: string | null
          auto_reply_enabled?: boolean | null
          created_at?: string | null
          id?: string
          notifications_enabled?: boolean | null
          scanline_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          last_login_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_connections: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string
          instance_name: string
          last_seen_at: string | null
          phone_number: string
          qr_code: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          instance_name: string
          last_seen_at?: string | null
          phone_number: string
          qr_code?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          instance_name?: string
          last_seen_at?: string | null
          phone_number?: string
          qr_code?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "whatsapp_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          connection_id: string | null
          created_at: string | null
          direction: string
          from_number: string | null
          id: string
          raw_payload: Json | null
          status: string | null
          to_number: string | null
        }
        Insert: {
          body?: string | null
          connection_id?: string | null
          created_at?: string | null
          direction: string
          from_number?: string | null
          id?: string
          raw_payload?: Json | null
          status?: string | null
          to_number?: string | null
        }
        Update: {
          body?: string | null
          connection_id?: string | null
          created_at?: string | null
          direction?: string
          from_number?: string | null
          id?: string
          raw_payload?: Json | null
          status?: string | null
          to_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_dashboard_stats: {
        Row: {
          active_connections: number | null
          messages_this_week: number | null
          messages_today: number | null
          total_ai_chats: number | null
          total_ai_messages: number | null
          total_connections: number | null
          total_conversations: number | null
          total_messages: number | null
          total_unread_messages: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_next_run: {
        Args: { scheduled_msg_id: string }
        Returns: string
      }
      get_audit_logs:
        | {
            Args: { limit_count?: number; user_id: string }
            Returns: {
              action: string
              details: Json
              log_time: string
            }[]
          }
        | {
            Args: never
            Returns: {
              action_type: string
              created_at: string
              description: string
              id: string
              metadata: Json
              status: string
              target_email: string
              target_user_id: string
              user_email: string
              user_id: string
            }[]
          }
      has_role:
        | { Args: { role_name: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      increment:
        | {
            Args: { field_name: string; row_id: string; table_name: string }
            Returns: undefined
          }
        | { Args: { x: number }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

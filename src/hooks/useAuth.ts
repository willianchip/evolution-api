import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  email_verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  setAuth: (auth: { user: User; token: string }) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, deviceFingerprint: string, geolocation: any) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,

      setAuth: ({ user, token }) => {
        set({ user, token, isAuthenticated: true });
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const customError: any = new Error(error.message);
          customError.code = error.status === 400 ? 'INVALID_PASSWORD' : 'AUTH_ERROR';
          throw customError;
        }

        if (data.user) {
          set({ 
            user: {
              id: data.user.id,
              email: data.user.email!,
              email_verified: data.user.email_confirmed_at !== null,
            },
            token: data.session?.access_token || null,
            isAuthenticated: true 
          });
        }
      },

      register: async (email, password, deviceFingerprint, geolocation) => {
        const redirectUrl = `${window.location.origin}/dashboard`;
        
        console.log('[useAuth] Starting registration for:', email);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              device_fingerprint: deviceFingerprint,
              geolocation: geolocation,
            }
          }
        });

        if (error) {
          console.error('[useAuth] Registration error:', error);
          
          // Mensagens de erro mais específicas
          if (error.message?.includes('already registered')) {
            throw new Error('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
          } else if (error.message?.includes('invalid email')) {
            throw new Error('Email inválido. Por favor, verifique o endereço informado.');
          } else if (error.message?.includes('weak password')) {
            throw new Error('Senha muito fraca. Use pelo menos 8 caracteres com letras, números e símbolos.');
          } else if (error.message?.includes('Email rate limit exceeded')) {
            throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
          } else if (error.message?.includes('Unable to validate email')) {
            throw new Error('Erro ao enviar email de confirmação. Verifique se o email está correto ou tente novamente mais tarde.');
          }
          
          throw new Error(error.message || 'Erro ao criar conta. Tente novamente.');
        }

        if (data?.user) {
          console.log('[useAuth] Registration successful:', {
            id: data.user.id,
            email: data.user.email,
            confirmed: data.user.email_confirmed_at !== null,
          });
        }

        console.log('[useAuth] Verification email sent to:', email);
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

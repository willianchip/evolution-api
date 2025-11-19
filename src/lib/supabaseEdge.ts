// Configuração centralizada das URLs do Supabase
// Isso garante que todas as chamadas REST e Edge Functions usem as URLs corretas

export const SUPABASE_PROJECT_ID = 'fegvbiomgoodcswveyqn';
export const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const EDGE_URL = `${SUPABASE_URL}/functions/v1`;
export const REST_URL = `${SUPABASE_URL}/rest/v1`;
export const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZ3ZiaW9tZ29vZGNzd3ZleXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NTU2OTQsImV4cCI6MjA3NzAzMTY5NH0.7HECRtZ9BUqMeQMBowhaEPEDWGr-zd4JSh4MrqM_OCE';

// Headers padrão para chamadas REST
export const getRestHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  'apikey': ANON_KEY,
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

// Headers padrão para Edge Functions
export const getEdgeHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

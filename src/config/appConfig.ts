// Configuração central da aplicação
// IMPORTANTE: Ao fazer remix, atualize estas constantes com os valores do novo projeto

import { SUPABASE_URL, SUPABASE_PROJECT_ID, ANON_KEY, EDGE_URL } from '@/lib/supabaseEdge';

export const APP_CONFIG = {
  supabase: {
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    anonKey: ANON_KEY,
    edgeUrl: EDGE_URL,
  },
  app: {
    name: 'WhatsApp AI Manager',
    version: '1.0.0',
  },
};

// Validação de configuração
export const validateConfig = () => {
  const { supabase } = APP_CONFIG;
  
  if (!supabase.projectId || !supabase.url || !supabase.anonKey) {
    console.error('⚠️ Configuração incompleta! Verifique src/config/appConfig.ts');
    return false;
  }
  
  console.log('✅ Configuração validada:', {
    projectId: supabase.projectId,
    url: supabase.url,
  });
  
  return true;
};

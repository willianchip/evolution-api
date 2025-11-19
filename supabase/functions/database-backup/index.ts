import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const backupId = crypto.randomUUID();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting database backup...');

    // Criar log inicial
    const { error: logError } = await supabase
      .from('backup_logs')
      .insert({
        id: backupId,
        backup_type: 'full',
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });

    if (logError) throw logError;

    // Tabelas para backup
    const tables = ['users', 'messages', 'conversations', 'ai_chats', 'ai_messages', 
                    'scheduled_messages', 'whatsapp_connections', 'platform_connections'];
    
    const backupData: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    };

    let totalRows = 0;

    // Exportar cada tabela
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.error(`Error backing up ${table}:`, error);
        continue;
      }

      backupData.tables[table] = data;
      totalRows += data?.length || 0;
      console.log(`Backed up ${table}: ${data?.length || 0} rows`);
    }

    // Converter para JSON e comprimir
    const jsonData = JSON.stringify(backupData, null, 2);
    const jsonBlob = new Blob([jsonData], { type: 'application/json' });
    const backupSizeBytes = jsonBlob.size;

    // Upload para Supabase Storage
    const fileName = `backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('database-backups')
      .upload(fileName, jsonBlob, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from('database-backups')
      .getPublicUrl(fileName);

    const duration = Date.now() - startTime;

    // Atualizar log com sucesso
    await supabase
      .from('backup_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: Math.floor(duration / 1000),
        backup_size_bytes: backupSizeBytes,
        total_rows: totalRows,
        tables_backed_up: tables,
        s3_bucket: 'database-backups',
        s3_key: fileName,
        s3_url: publicUrlData.publicUrl,
        metadata: { backup_data_summary: Object.keys(backupData.tables).map(t => ({
          table: t,
          rows: backupData.tables[t].length
        }))}
      })
      .eq('id', backupId);

    console.log('Backup completed successfully:', fileName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        backup_id: backupId,
        file_name: fileName,
        size_bytes: backupSizeBytes,
        total_rows: totalRows,
        duration_ms: duration,
        url: publicUrlData.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Database backup error:', error);

    // Atualizar log com erro
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from('backup_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
        duration_seconds: Math.floor((Date.now() - startTime) / 1000)
      })
      .eq('id', backupId);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestAPIStepProps {
  onTestComplete: (success: boolean) => void;
}

export function TestAPIStep({ onTestComplete }: TestAPIStepProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleTest = async () => {
    console.log('🔬 [TestAPIStep] ========================================');
    console.log('🔬 [TestAPIStep] STARTING API TEST');
    console.log('🔬 [TestAPIStep] Timestamp:', new Date().toISOString());
    console.log('🔬 [TestAPIStep] ========================================');
    
    setTesting(true);
    setResult(null);

    try {
      console.log('📡 [TestAPIStep] Invoking Supabase function: test-evolution-api');
      console.log('📡 [TestAPIStep] Request details:', {
        function: 'test-evolution-api',
        method: 'invoke',
        timestamp: Date.now(),
      });

      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('test-evolution-api');
      const elapsed = Date.now() - startTime;

      console.log('📥 [TestAPIStep] Response received in', elapsed, 'ms');
      console.log('📥 [TestAPIStep] Data:', data);
      console.log('📥 [TestAPIStep] Error:', error);

      if (error) {
        console.error('❌ [TestAPIStep] Function returned error:', {
          message: error.message,
          context: error.context,
          details: error,
        });
        throw error;
      }

      if (data.success) {
        console.log('✅ [TestAPIStep] TEST SUCCESSFUL!');
        console.log('✅ [TestAPIStep] Evolution API Details:', {
          url: data.url,
          responseTime: data.responseTime,
          instanceCount: data.instanceCount,
        });
        
        setResult({
          success: true,
          message: 'Evolution API respondendo corretamente',
          details: data,
        });
        onTestComplete(true);
      } else {
        console.warn('⚠️ [TestAPIStep] TEST FAILED');
        console.warn('⚠️ [TestAPIStep] Error message:', data.error || data.message);
        console.warn('⚠️ [TestAPIStep] Full response:', data);
        
        setResult({
          success: false,
          message: data.error || data.message || 'Erro ao testar API',
          details: data,
        });
        onTestComplete(false);
      }
    } catch (error: any) {
      console.error('💥 [TestAPIStep] EXCEPTION CAUGHT');
      console.error('💥 [TestAPIStep] Error type:', error.constructor.name);
      console.error('💥 [TestAPIStep] Error message:', error.message);
      console.error('💥 [TestAPIStep] Error stack:', error.stack);
      console.error('💥 [TestAPIStep] Full error object:', error);
      
      setResult({
        success: false,
        message: error.message || 'Erro ao conectar com a API',
      });
      onTestComplete(false);
    } finally {
      console.log('🏁 [TestAPIStep] Test completed');
      console.log('🏁 [TestAPIStep] ========================================');
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Testar Evolution API</h2>
        <p className="text-muted-foreground">
          Vamos verificar se sua Evolution API está configurada corretamente
        </p>
      </div>

      <div className="flex justify-center py-8">
        <Button
          onClick={handleTest}
          disabled={testing}
          size="lg"
          className="w-full max-w-xs"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            'Iniciar Teste'
          )}
        </Button>
      </div>

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <AlertDescription className="font-medium">
                {result.message}
              </AlertDescription>
              {result.details && result.success && (
                <div className="text-sm space-y-1 mt-2">
                  <p>✅ URL: {result.details.url?.substring(0, 30)}...</p>
                  <p>✅ Tempo de resposta: {result.details.responseTime}ms</p>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {result && !result.success && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Certifique-se de que as variáveis de ambiente EVOLUTION_API_URL e
            EVOLUTION_API_KEY estão configuradas corretamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

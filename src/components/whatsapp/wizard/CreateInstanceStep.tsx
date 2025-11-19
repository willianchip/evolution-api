import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface CreateInstanceStepProps {
  onInstanceCreated: (instanceName: string) => void;
}

export function CreateInstanceStep({ onInstanceCreated }: CreateInstanceStepProps) {
  const [instanceName, setInstanceName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { createConnection } = useWhatsApp();

  const handleCreate = async () => {
    if (!instanceName.trim()) {
      setError('Digite um nome para a instância');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await createConnection.mutateAsync(instanceName);
      onInstanceCreated(instanceName);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar instância');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Criar Primeira Instância</h2>
        <p className="text-muted-foreground">
          Escolha um nome único para identificar sua conexão WhatsApp
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4 py-8">
        <div className="space-y-2">
          <Label htmlFor="instance-name">Nome da Instância</Label>
          <Input
            id="instance-name"
            placeholder="ex: MeuWhatsApp"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            disabled={creating}
          />
          <p className="text-xs text-muted-foreground">
            Use apenas letras, números e underscores
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleCreate}
          disabled={creating || !instanceName.trim()}
          className="w-full"
          size="lg"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando Instância...
            </>
          ) : (
            'Criar Instância'
          )}
        </Button>
      </div>
    </div>
  );
}

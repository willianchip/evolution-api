import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformType: string;
}

export const ConnectionModal = ({ isOpen, onClose, platformType }: ConnectionModalProps) => {
  const [accessToken, setAccessToken] = useState('');
  const [platformUserId, setPlatformUserId] = useState('');
  const [platformUsername, setPlatformUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('platform_connections')
        .insert({
          user_id: user.id,
          platform_type: platformType,
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          access_token: accessToken,
          is_active: true,
          status: 'connected',
        });

      if (error) throw error;

      toast({
        title: '✅ Conexão estabelecida',
        description: `${platformType} conectado com sucesso`,
      });

      onClose();
      setAccessToken('');
      setPlatformUserId('');
      setPlatformUsername('');
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: '❌ Erro na conexão',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Conectar {platformType}</DialogTitle>
          <DialogDescription>
            Configure sua conexão com {platformType}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username/ID</Label>
            <Input
              id="username"
              value={platformUsername}
              onChange={(e) => setPlatformUsername(e.target.value)}
              placeholder="@seu_username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={platformUserId}
              onChange={(e) => setPlatformUserId(e.target.value)}
              placeholder="123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Access Token</Label>
            <Input
              id="token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Cole seu token aqui"
            />
          </div>
          <Button 
            onClick={handleConnect} 
            disabled={isLoading || !accessToken || !platformUserId}
            className="w-full"
          >
            {isLoading ? 'Conectando...' : 'Conectar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RoleManagerProps {
  user: {
    id: string;
    email: string;
    roles?: string[];
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: '👑 Admin', description: 'Acesso total ao sistema' },
  { value: 'moderator', label: '🛡️ Moderator', description: 'Pode moderar conteúdo' },
  { value: 'user', label: '👤 User', description: 'Usuário padrão' },
];

export const RoleManager = ({ user, open, onOpenChange }: RoleManagerProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles || ['user']);
  const queryClient = useQueryClient();

  const updateRolesMutation = useMutation({
    mutationFn: async (roles: string[]) => {
      // Primeiro, remove todas as roles do usuário
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Depois, adiciona as novas roles
      if (roles.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(roles.map(role => ({ user_id: user.id, role: role as 'admin' | 'moderator' | 'user' })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: '✅ Roles atualizadas',
        description: `Permissões de ${user.email} foram atualizadas com sucesso`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating roles:', error);
      toast({
        title: '❌ Erro ao atualizar roles',
        description: 'Não foi possível atualizar as permissões',
        variant: 'destructive',
      });
    },
  });

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSave = () => {
    updateRolesMutation.mutate(selectedRoles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Editar roles de {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {AVAILABLE_ROLES.map(role => (
            <div key={role.value} className="flex items-start space-x-3">
              <Checkbox
                id={role.value}
                checked={selectedRoles.includes(role.value)}
                onCheckedChange={() => handleRoleToggle(role.value)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={role.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {role.label}
                </label>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateRolesMutation.isPending}>
            {updateRolesMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

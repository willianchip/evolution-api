import { useState } from 'react';
import { Plus, Trash2, Power, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import CyberneticBackground from '@/components/CyberneticBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AutomationDialog } from '@/components/AutomationDialog';
import { useAutomations } from '@/hooks/useAutomations';
import { Skeleton } from '@/components/ui/skeleton';

const Automations = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  
  const { automations, isLoading, toggleAutomation, deleteAutomation } = useAutomations();

  const handleEdit = (automation: any) => {
    setEditingAutomation(automation);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingAutomation(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta automação?')) {
      deleteAutomation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <CyberneticBackground />
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <CyberneticBackground />
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold cyber-glow mb-2">Automações Inteligentes</h1>
            <p className="text-muted-foreground">
              Configure regras e fluxos automáticos para suas conversas
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-primary to-secondary">
            <Plus className="h-5 w-5 mr-2" />
            Nova Automação
          </Button>
        </div>

        {!automations || automations.length === 0 ? (
          <Card className="cyber-card p-12 text-center">
            <Power className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma automação criada</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira automação para começar a responder mensagens automaticamente
            </p>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-primary to-secondary">
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeira Automação
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="cyber-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{automation.name}</h3>
                      <Badge variant={automation.is_active ? 'default' : 'secondary'}>
                        {automation.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Badge variant="outline">{automation.trigger_type}</Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{automation.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Quando:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {automation.trigger_type === 'keyword' && `Palavra-chave: "${automation.conditions.keywords?.join('", "')}"`}
                          {automation.trigger_type === 'time' && `Horário: ${automation.conditions.time}`}
                          {automation.trigger_type === 'new_contact' && 'Novo contato'}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Ação:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {automation.actions.type === 'reply' && `Responder: "${automation.actions.message}"`}
                          {automation.actions.type === 'ai_reply' && `Resposta IA (${automation.actions.ai_tone})`}
                          {automation.actions.type === 'forward' && `Encaminhar para: ${automation.actions.forward_to}`}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={automation.is_active}
                      onCheckedChange={() => toggleAutomation.mutate(automation.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(automation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(automation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
      
      <AutomationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        automation={editingAutomation}
      />
    </div>
  );
};

export default Automations;

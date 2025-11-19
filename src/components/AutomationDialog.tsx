import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAutomations } from '@/hooks/useAutomations';

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: any;
}

export const AutomationDialog = ({ open, onOpenChange, automation }: AutomationDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState<'keyword' | 'time' | 'new_contact'>('keyword');
  const [keywords, setKeywords] = useState('');
  const [actionType, setActionType] = useState<'reply' | 'ai_reply' | 'forward'>('reply');
  const [message, setMessage] = useState('');
  const [aiTone, setAiTone] = useState<'formal' | 'casual' | 'friendly'>('friendly');
  
  const { createAutomation, updateAutomation } = useAutomations();

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description || '');
      setTriggerType(automation.trigger_type);
      setKeywords(automation.conditions?.keywords?.join(', ') || '');
      setActionType(automation.actions?.type || 'reply');
      setMessage(automation.actions?.message || '');
      setAiTone(automation.actions?.ai_tone || 'friendly');
    } else {
      // Reset form
      setName('');
      setDescription('');
      setTriggerType('keyword');
      setKeywords('');
      setActionType('reply');
      setMessage('');
      setAiTone('friendly');
    }
  }, [automation, open]);

  const handleSubmit = () => {
    const automationData = {
      name,
      description,
      trigger_type: triggerType,
      conditions: {
        keywords: triggerType === 'keyword' ? keywords.split(',').map(k => k.trim()) : undefined,
      },
      actions: {
        type: actionType,
        message: actionType === 'reply' ? message : undefined,
        ai_tone: actionType === 'ai_reply' ? aiTone : undefined,
      },
      is_active: true,
    };

    if (automation) {
      updateAutomation.mutate({ id: automation.id, ...automationData });
    } else {
      createAutomation.mutate(automationData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{automation ? 'Editar' : 'Criar'} Automação</DialogTitle>
          <DialogDescription>
            Configure as condições e ações da automação inteligente
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Automação</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Resposta de Boas-vindas"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do que esta automação faz"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trigger">Quando ativar?</Label>
            <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
              <SelectTrigger id="trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keyword">Palavra-chave na mensagem</SelectItem>
                <SelectItem value="time">Horário específico</SelectItem>
                <SelectItem value="new_contact">Novo contato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {triggerType === 'keyword' && (
            <div className="space-y-2">
              <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ex: olá, oi, bom dia"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="action">O que fazer?</Label>
            <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reply">Responder com mensagem fixa</SelectItem>
                <SelectItem value="ai_reply">Responder com IA</SelectItem>
                <SelectItem value="forward">Encaminhar para outro número</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {actionType === 'reply' && (
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem de resposta</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite a mensagem que será enviada automaticamente"
              />
            </div>
          )}
          
          {actionType === 'ai_reply' && (
            <div className="space-y-2">
              <Label htmlFor="tone">Tom da IA</Label>
              <Select value={aiTone} onValueChange={(v: any) => setAiTone(v)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Amigável</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name || (triggerType === 'keyword' && !keywords)}>
            {automation ? 'Salvar' : 'Criar'} Automação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

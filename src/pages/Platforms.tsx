import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Smartphone, Instagram, Facebook, Plus } from 'lucide-react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { PlatformCard } from '@/components/platforms/PlatformCard';
import { ConnectionModal } from '@/components/platforms/ConnectionModal';
import { PlatformMessages } from '@/components/platforms/PlatformMessages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Platforms() {
  const { connections, messages, isLoading } = usePlatforms();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const platforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'text-green-500',
      description: 'Via Evolution API',
      connected: connections?.some(c => c.platform_type === 'whatsapp' && c.is_active) || false,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Smartphone,
      color: 'text-blue-500',
      description: 'Via Bot API',
      connected: connections?.some(c => c.platform_type === 'telegram' && c.is_active) || false,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500',
      description: 'Via Graph API',
      connected: connections?.some(c => c.platform_type === 'instagram' && c.is_active) || false,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      description: 'Via Messenger API',
      connected: connections?.some(c => c.platform_type === 'facebook' && c.is_active) || false,
    },
  ];

  const getMessageCount = (platformType: string) => {
    return messages?.filter(m => m.platform_type === platformType).length || 0;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Plataformas</h1>
          <p className="text-muted-foreground">Gerencie conexões multi-plataforma</p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map(platform => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              messageCount={getMessageCount(platform.id)}
              onConnect={() => {
                setSelectedPlatform(platform.id);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>

        {/* Messages by Platform */}
        <Card className="bg-card/50 backdrop-blur border-primary/20">
          <CardHeader>
            <CardTitle>Mensagens Recentes</CardTitle>
            <CardDescription>Histórico de mensagens por plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="telegram">Telegram</TabsTrigger>
                <TabsTrigger value="instagram">Instagram</TabsTrigger>
                <TabsTrigger value="facebook">Facebook</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <PlatformMessages messages={messages || []} />
              </TabsContent>

              {platforms.map(platform => (
                <TabsContent key={platform.id} value={platform.id} className="mt-4">
                  <PlatformMessages 
                    messages={messages?.filter(m => m.platform_type === platform.id) || []} 
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Connection Modal */}
        <ConnectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          platformType={selectedPlatform || 'whatsapp'}
        />
      </div>
    </div>
  );
}

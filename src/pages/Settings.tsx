import { useState, useEffect } from 'react';
import { User, Bell, Bot, Palette, Shield, Save, Eye, Zap, Monitor, Bookmark, Plus, X, Battery } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CyberneticBackground from '@/components/CyberneticBackground';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { TwoFactorAuth } from '@/components/TwoFactorAuth';
import { useVisualEffects } from '@/hooks/useVisualEffects';
import { COLOR_THEMES } from '@/config/themes';
import { Slider } from '@/components/ui/slider';

const Settings = () => {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings } = useSettings();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [aiTone, setAiTone] = useState<'formal' | 'casual' | 'friendly'>('friendly');
  const [aiLanguage, setAiLanguage] = useState('pt-BR');
  
  const [presetName, setPresetName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎨');

  const {
    matrixRainEnabled,
    matrixSpeed,
    matrixOpacity,
    scanLineEnabled,
    scanLineInterval,
    scanLineOpacity,
    particlesEnabled,
    particlesCount,
    particlesSpeed,
    vhsEnabled,
    vhsScanlines,
    vhsNoise,
    vhsCurvature,
    vhsChromatic,
    colorTheme,
    toggleMatrixRain,
    setMatrixSpeed,
    setMatrixOpacity,
    toggleScanLine,
    setScanLineInterval,
    setScanLineOpacity,
    toggleParticles,
    setParticlesCount,
    setParticlesSpeed,
    toggleVHS,
    setVHSScanlines,
    setVHSNoise,
    setVHSCurvature,
    setVHSChromatic,
    setColorTheme,
    presets,
    currentPresetId,
    savePreset,
    loadPreset,
    deletePreset,
    autoPowerSavingEnabled,
    powerSavingActive,
    toggleAutoPowerSaving,
    deactivatePowerSaving,
    enablePerformanceMode,
    resetToDefaults,
  } = useVisualEffects();

  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notifications_enabled);
      setAutoReplyEnabled(settings.auto_reply_enabled);
      setAiTone(settings.ai_tone);
      setAiLanguage(settings.ai_language);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      notifications_enabled: notificationsEnabled,
      auto_reply_enabled: autoReplyEnabled,
      ai_tone: aiTone as 'formal' | 'casual' | 'friendly',
      ai_language: aiLanguage,
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen">
        <CyberneticBackground />
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-20">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold cyber-glow mb-2">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência</p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Perfil */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Perfil</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="userId">ID do Usuário</Label>
                <Input
                  id="userId"
                  value={user?.id || ''}
                  disabled
                  className="bg-muted font-mono text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Notificações */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Notificações</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificações de mensagens</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas quando novas mensagens chegarem
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </div>
          </Card>

          {/* Automação IA */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Inteligência Artificial</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoReply">Resposta automática</Label>
                  <p className="text-sm text-muted-foreground">
                    A IA responderá automaticamente mensagens do WhatsApp
                  </p>
                </div>
                <Switch
                  id="autoReply"
                  checked={autoReplyEnabled}
                  onCheckedChange={setAutoReplyEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="aiTone">Tom de voz da IA</Label>
                <Select value={aiTone} onValueChange={(value) => setAiTone(value as 'formal' | 'casual' | 'friendly')}>
                  <SelectTrigger id="aiTone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Amigável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiLanguage">Idioma</Label>
                <Select value={aiLanguage} onValueChange={setAiLanguage}>
                  <SelectTrigger id="aiLanguage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Tema */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Aparência</h2>
            </div>
            
            <p className="text-muted-foreground">
              O tema está configurado para <span className="text-primary font-semibold">Dark Mode</span>
            </p>
          </Card>

          {/* Efeitos Visuais */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Efeitos Visuais</h2>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Matrix Rain</Label>
                    <p className="text-sm text-muted-foreground">Chuva de código Matrix</p>
                  </div>
                  <Switch checked={matrixRainEnabled} onCheckedChange={toggleMatrixRain} />
                </div>
                
                {matrixRainEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="matrix-speed" className="text-sm">
                        Velocidade: {matrixSpeed.toFixed(1)}x
                      </Label>
                      <Slider
                        id="matrix-speed"
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        value={[matrixSpeed]}
                        onValueChange={(v) => setMatrixSpeed(v[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="matrix-opacity" className="text-sm">
                        Opacidade: {Math.round(matrixOpacity * 100)}%
                      </Label>
                      <Slider
                        id="matrix-opacity"
                        min={0.05}
                        max={0.5}
                        step={0.05}
                        value={[matrixOpacity]}
                        onValueChange={(v) => setMatrixOpacity(v[0])}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Scan Line</Label>
                    <p className="text-sm text-muted-foreground">Linha de varredura horizontal</p>
                  </div>
                  <Switch checked={scanLineEnabled} onCheckedChange={toggleScanLine} />
                </div>
                
                {scanLineEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="scan-interval" className="text-sm">
                        Intervalo: {scanLineInterval / 1000}s
                      </Label>
                      <Slider
                        id="scan-interval"
                        min={5000}
                        max={20000}
                        step={1000}
                        value={[scanLineInterval]}
                        onValueChange={(v) => setScanLineInterval(v[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="scan-opacity" className="text-sm">
                        Opacidade: {Math.round(scanLineOpacity * 100)}%
                      </Label>
                      <Slider
                        id="scan-opacity"
                        min={0.1}
                        max={0.6}
                        step={0.05}
                        value={[scanLineOpacity]}
                        onValueChange={(v) => setScanLineOpacity(v[0])}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Network Particles</Label>
                    <p className="text-sm text-muted-foreground">Partículas conectadas</p>
                  </div>
                  <Switch checked={particlesEnabled} onCheckedChange={toggleParticles} />
                </div>
                
                {particlesEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="particles-count" className="text-sm">
                        Quantidade: {particlesCount}
                      </Label>
                      <Slider
                        id="particles-count"
                        min={50}
                        max={200}
                        step={10}
                        value={[particlesCount]}
                        onValueChange={(v) => setParticlesCount(v[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="particles-speed" className="text-sm">
                        Velocidade: {particlesSpeed.toFixed(1)}x
                      </Label>
                      <Slider
                        id="particles-speed"
                        min={0.3}
                        max={1.2}
                        step={0.1}
                        value={[particlesSpeed]}
                        onValueChange={(v) => setParticlesSpeed(v[0])}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Efeito VHS/CRT</Label>
                    <p className="text-sm text-muted-foreground">
                      Vintage retro-futurista ⚠️ +5% GPU
                    </p>
                  </div>
                  <Switch checked={vhsEnabled} onCheckedChange={toggleVHS} />
                </div>
                
                {vhsEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="vhs-scanlines" className="text-sm">
                        Scanlines: {vhsScanlines}%
                      </Label>
                      <Slider
                        id="vhs-scanlines"
                        min={0}
                        max={100}
                        step={10}
                        value={[vhsScanlines]}
                        onValueChange={(v) => setVHSScanlines(v[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vhs-noise" className="text-sm">
                        Noise: {vhsNoise}%
                      </Label>
                      <Slider
                        id="vhs-noise"
                        min={0}
                        max={100}
                        step={10}
                        value={[vhsNoise]}
                        onValueChange={(v) => setVHSNoise(v[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vhs-curvature" className="text-sm">
                        Curvatura: {vhsCurvature}
                      </Label>
                      <Slider
                        id="vhs-curvature"
                        min={0}
                        max={10}
                        step={1}
                        value={[vhsCurvature]}
                        onValueChange={(v) => setVHSCurvature(v[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="vhs-chromatic" className="text-sm">
                        Distorção Cromática: {vhsChromatic}
                      </Label>
                      <Slider
                        id="vhs-chromatic"
                        min={0}
                        max={5}
                        step={1}
                        value={[vhsChromatic]}
                        onValueChange={(v) => setVHSChromatic(v[0])}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Economia Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Desativa efeitos quando FPS {'<'} 30, CPU {'>'} 75% ou bateria {'<'} 20%
                    </p>
                  </div>
                  <Switch 
                    checked={autoPowerSavingEnabled} 
                    onCheckedChange={toggleAutoPowerSaving} 
                  />
                </div>

                {powerSavingActive && (
                  <Alert className="border-yellow-500/50">
                    <Battery className="h-4 w-4" />
                    <AlertTitle>Modo Economia Ativo</AlertTitle>
                    <AlertDescription>
                      Efeitos pesados foram desativados automaticamente para melhorar performance.
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto ml-2"
                        onClick={deactivatePowerSaving}
                      >
                        Desativar manualmente
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="colorTheme">Tema de Cores</Label>
                <Select value={colorTheme} onValueChange={(v) => setColorTheme(v as any)}>
                  <SelectTrigger id="colorTheme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span>{theme.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={enablePerformanceMode}
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Performance Mode
                </Button>
                
                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                  className="flex-1"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Reset Padrões
                </Button>
              </div>
            </div>
          </Card>

          {/* Presets Favoritos */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bookmark className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Presets Favoritos</h2>
            </div>
            
            <div className="space-y-4">
              {presets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={currentPresetId === preset.id ? "default" : "outline"}
                      className="flex flex-col h-20 relative group"
                      onClick={() => loadPreset(preset.id)}
                    >
                      <span className="text-2xl mb-1">{preset.icon}</span>
                      <span className="text-xs truncate w-full px-2">{preset.name}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePreset(preset.id);
                        }}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Salvar Preset
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Salvar Configuração Atual</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="preset-name">Nome do Preset</Label>
                        <Input 
                          id="preset-name"
                          placeholder="Ex: Meu Setup Favorito"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && presetName.trim()) {
                              savePreset(presetName, selectedIcon);
                              setPresetName('');
                              setSelectedIcon('🎨');
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label>Ícone</Label>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {['🔥', '⚡', '🌊', '🎮', '🏢', '💎', '🌟', '🎨', '🚀', '💚', '🌈', '✨'].map(emoji => (
                            <Button
                              key={emoji}
                              variant={selectedIcon === emoji ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedIcon(emoji)}
                              className="text-lg transition-all hover:scale-110"
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          if (presetName.trim()) {
                            savePreset(presetName, selectedIcon);
                            setPresetName('');
                            setSelectedIcon('🎨');
                          }
                        }}
                        className="w-full"
                        disabled={!presetName.trim()}
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        Salvar Preset
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>

          {/* Segurança */}
          <Card className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Segurança</h2>
            </div>
            
            <div className="space-y-4">
              <ChangePasswordDialog />
              <TwoFactorAuth />
              <Button variant="outline" className="w-full text-destructive">
                Excluir Conta
              </Button>
            </div>
          </Card>

          {/* Salvar */}
          <Button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            className="w-full bg-gradient-to-r from-primary to-secondary"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

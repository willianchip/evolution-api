import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColorTheme, COLOR_THEMES } from '@/config/themes';
import { toast } from 'sonner';

interface VisualEffectsPreset {
  id: string;
  name: string;
  icon: string;
  settings: {
    matrixRainEnabled: boolean;
    matrixIntensity: 'subtle' | 'normal' | 'dramatic' | 'extreme';
    matrixSpeed: number;
    matrixOpacity: number;
    scanLineEnabled: boolean;
    scanLineInterval: number;
    scanLineDuration: number;
    scanLineOpacity: number;
    particlesEnabled: boolean;
    particlesCount: number;
    particlesSpeed: number;
    particlesDistance: number;
    vhsEnabled: boolean;
    vhsScanlines: number;
    vhsNoise: number;
    vhsCurvature: number;
    vhsChromatic: number;
    colorTheme: ColorTheme;
  };
}

interface VisualEffectsState {
  matrixRainEnabled: boolean;
  matrixIntensity: 'subtle' | 'normal' | 'dramatic' | 'extreme';
  matrixSpeed: number;
  matrixOpacity: number;
  
  scanLineEnabled: boolean;
  scanLineInterval: number;
  scanLineDuration: number;
  scanLineOpacity: number;
  
  particlesEnabled: boolean;
  particlesCount: number;
  particlesSpeed: number;
  particlesDistance: number;
  
  vhsEnabled: boolean;
  vhsScanlines: number;
  vhsNoise: number;
  vhsCurvature: number;
  vhsChromatic: number;
  
  colorTheme: ColorTheme;
  
  presets: VisualEffectsPreset[];
  currentPresetId: string | null;
  
  autoPowerSavingEnabled: boolean;
  powerSavingActive: boolean;
  
  toggleMatrixRain: () => void;
  setMatrixIntensity: (intensity: 'subtle' | 'normal' | 'dramatic' | 'extreme') => void;
  setMatrixSpeed: (speed: number) => void;
  setMatrixOpacity: (opacity: number) => void;
  
  toggleScanLine: () => void;
  setScanLineInterval: (interval: number) => void;
  setScanLineDuration: (duration: number) => void;
  setScanLineOpacity: (opacity: number) => void;
  
  toggleParticles: () => void;
  setParticlesCount: (count: number) => void;
  setParticlesSpeed: (speed: number) => void;
  setParticlesDistance: (distance: number) => void;
  
  toggleVHS: () => void;
  setVHSScanlines: (value: number) => void;
  setVHSNoise: (value: number) => void;
  setVHSCurvature: (value: number) => void;
  setVHSChromatic: (value: number) => void;
  
  setColorTheme: (theme: ColorTheme) => void;
  
  savePreset: (name: string, icon?: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  exportPresets: () => string;
  importPresets: (jsonData: string) => void;
  
  toggleAutoPowerSaving: () => void;
  activatePowerSaving: () => void;
  deactivatePowerSaving: () => void;
  
  enablePerformanceMode: () => void;
  resetToDefaults: () => void;
}

export const useVisualEffects = create<VisualEffectsState>()(
  persist(
    (set, get) => ({
      matrixRainEnabled: true,
      matrixIntensity: 'extreme',
      matrixSpeed: 2.5,
      matrixOpacity: 0.35,
      
      scanLineEnabled: true,
      scanLineInterval: 10000,
      scanLineDuration: 2500,
      scanLineOpacity: 0.35,
      
      particlesEnabled: true,
      particlesCount: 150,
      particlesSpeed: 0.8,
      particlesDistance: 200,
      
      vhsEnabled: false,
      vhsScanlines: 50,
      vhsNoise: 30,
      vhsCurvature: 3,
      vhsChromatic: 2,
      
      colorTheme: 'matrix-green',
      
      presets: [],
      currentPresetId: null,
      
      autoPowerSavingEnabled: true,
      powerSavingActive: false,
      
      toggleMatrixRain: () => set((state) => ({ matrixRainEnabled: !state.matrixRainEnabled })),
      setMatrixIntensity: (intensity) => set({ matrixIntensity: intensity }),
      setMatrixSpeed: (speed) => set({ matrixSpeed: speed }),
      setMatrixOpacity: (opacity) => set({ matrixOpacity: opacity }),
      
      toggleScanLine: () => set((state) => ({ scanLineEnabled: !state.scanLineEnabled })),
      setScanLineInterval: (interval) => set({ scanLineInterval: interval }),
      setScanLineDuration: (duration) => set({ scanLineDuration: duration }),
      setScanLineOpacity: (opacity) => set({ scanLineOpacity: opacity }),
      
      toggleParticles: () => set((state) => ({ particlesEnabled: !state.particlesEnabled })),
      setParticlesCount: (count) => set({ particlesCount: count }),
      setParticlesSpeed: (speed) => set({ particlesSpeed: speed }),
      setParticlesDistance: (distance) => set({ particlesDistance: distance }),
      
      toggleVHS: () => set((state) => ({ vhsEnabled: !state.vhsEnabled })),
      setVHSScanlines: (value) => set({ vhsScanlines: value }),
      setVHSNoise: (value) => set({ vhsNoise: value }),
      setVHSCurvature: (value) => set({ vhsCurvature: value }),
      setVHSChromatic: (value) => set({ vhsChromatic: value }),
      
      setColorTheme: (theme) => {
        set({ colorTheme: theme });
        const colors = COLOR_THEMES[theme];
        document.documentElement.style.setProperty('--theme-primary', colors.primary);
        document.documentElement.style.setProperty('--theme-primary-rgb', colors.primaryRGB);
      },
      
      savePreset: (name, icon = '🎨') => 
        set((state) => {
          const newPreset: VisualEffectsPreset = {
            id: Date.now().toString(),
            name,
            icon,
            settings: {
              matrixRainEnabled: state.matrixRainEnabled,
              matrixIntensity: state.matrixIntensity,
              matrixSpeed: state.matrixSpeed,
              matrixOpacity: state.matrixOpacity,
              scanLineEnabled: state.scanLineEnabled,
              scanLineInterval: state.scanLineInterval,
              scanLineDuration: state.scanLineDuration,
              scanLineOpacity: state.scanLineOpacity,
              particlesEnabled: state.particlesEnabled,
              particlesCount: state.particlesCount,
              particlesSpeed: state.particlesSpeed,
              particlesDistance: state.particlesDistance,
              vhsEnabled: state.vhsEnabled,
              vhsScanlines: state.vhsScanlines,
              vhsNoise: state.vhsNoise,
              vhsCurvature: state.vhsCurvature,
              vhsChromatic: state.vhsChromatic,
              colorTheme: state.colorTheme,
            }
          };
          
          toast.success('Preset salvo com sucesso!');
          
          return { 
            presets: [...state.presets, newPreset],
            currentPresetId: newPreset.id
          };
        }),

      loadPreset: (id) => 
        set((state) => {
          const preset = state.presets.find(p => p.id === id);
          if (!preset) return state;
          
          const colors = COLOR_THEMES[preset.settings.colorTheme];
          document.documentElement.style.setProperty('--theme-primary', colors.primary);
          document.documentElement.style.setProperty('--theme-primary-rgb', colors.primaryRGB);
          
          toast.success(`Preset "${preset.name}" carregado!`);
          
          return { 
            ...preset.settings, 
            currentPresetId: id,
            presets: state.presets,
            autoPowerSavingEnabled: state.autoPowerSavingEnabled,
            powerSavingActive: state.powerSavingActive
          };
        }),

      deletePreset: (id) => 
        set((state) => {
          const preset = state.presets.find(p => p.id === id);
          if (preset) {
            toast.success(`Preset "${preset.name}" removido!`);
          }
          return {
            presets: state.presets.filter(p => p.id !== id),
            currentPresetId: state.currentPresetId === id ? null : state.currentPresetId
          };
        }),

      exportPresets: () => {
        const state = get();
        const exportData = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          presets: state.presets,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importPresets: (jsonData) => {
        try {
          const importData = JSON.parse(jsonData);
          if (!importData.presets || !Array.isArray(importData.presets)) {
            toast.error('Arquivo inválido');
            return;
          }
          
          set((state) => ({
            presets: [...state.presets, ...importData.presets]
          }));
          
          toast.success(`${importData.presets.length} preset(s) importado(s)!`);
        } catch (error) {
          toast.error('Erro ao importar presets');
        }
      },
      
      toggleAutoPowerSaving: () => set((state) => ({ 
        autoPowerSavingEnabled: !state.autoPowerSavingEnabled 
      })),

      activatePowerSaving: () => 
        set((state) => {
          sessionStorage.setItem('pre-power-saving-state', JSON.stringify({
            matrixRainEnabled: state.matrixRainEnabled,
            matrixIntensity: state.matrixIntensity,
            scanLineEnabled: state.scanLineEnabled,
            particlesEnabled: state.particlesEnabled,
            particlesCount: state.particlesCount,
            vhsEnabled: state.vhsEnabled,
          }));
          
          toast.info('🔋 Modo Economia de Energia ativado', {
            description: 'Efeitos pesados desativados para economizar recursos'
          });
          
          return {
            ...state,
            powerSavingActive: true,
            matrixRainEnabled: false,
            scanLineEnabled: false,
            particlesEnabled: true,
            particlesCount: 50,
            vhsEnabled: false,
          };
        }),

      deactivatePowerSaving: () => {
        const savedState = sessionStorage.getItem('pre-power-saving-state');
        if (savedState) {
          const restored = JSON.parse(savedState);
          set({
            powerSavingActive: false,
            ...restored,
          });
          sessionStorage.removeItem('pre-power-saving-state');
        } else {
          set({ powerSavingActive: false });
        }
        
        toast.success('⚡ Modo Economia desativado', {
          description: 'Efeitos restaurados'
        });
      },
      
      enablePerformanceMode: () => set({
        matrixRainEnabled: true,
        matrixIntensity: 'subtle',
        scanLineEnabled: false,
        particlesEnabled: true,
        particlesCount: 80,
        vhsEnabled: false,
      }),
      
      resetToDefaults: () => set({
        matrixRainEnabled: true,
        matrixIntensity: 'extreme',
        matrixSpeed: 2.5,
        matrixOpacity: 0.35,
        scanLineEnabled: true,
        scanLineInterval: 10000,
        scanLineDuration: 2500,
        scanLineOpacity: 0.35,
        particlesEnabled: true,
        particlesCount: 150,
        particlesSpeed: 0.8,
        particlesDistance: 200,
        vhsEnabled: false,
        vhsScanlines: 50,
        vhsNoise: 30,
        vhsCurvature: 3,
        vhsChromatic: 2,
        colorTheme: 'matrix-green',
      }),
    }),
    {
      name: 'visual-effects-preferences',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const colors = COLOR_THEMES[state.colorTheme];
          document.documentElement.style.setProperty('--theme-primary', colors.primary);
          document.documentElement.style.setProperty('--theme-primary-rgb', colors.primaryRGB);
        }
      },
    }
  )
);

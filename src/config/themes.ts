export type ColorTheme = 'matrix-green' | 'matrix-cyan' | 'cyberpunk-magenta' | 'hacker-yellow' | 'tron-blue';

export interface ThemeColors {
  primary: string;
  primaryRGB: string;
  glow: string;
  name: string;
  description: string;
}

export const COLOR_THEMES: Record<ColorTheme, ThemeColors> = {
  'matrix-green': {
    primary: '#39ff14',
    primaryRGB: '57, 255, 20',
    glow: '0 0 20px #39ff14',
    name: 'Matrix Verde',
    description: 'Clássico verde neon Matrix'
  },
  'matrix-cyan': {
    primary: '#00ffff',
    primaryRGB: '0, 255, 255',
    glow: '0 0 20px #00ffff',
    name: 'Matrix Ciano',
    description: 'Azul ciano futurista'
  },
  'cyberpunk-magenta': {
    primary: '#ff00ff',
    primaryRGB: '255, 0, 255',
    glow: '0 0 20px #ff00ff',
    name: 'Cyberpunk Magenta',
    description: 'Magenta vibrante cyberpunk'
  },
  'hacker-yellow': {
    primary: '#ffff00',
    primaryRGB: '255, 255, 0',
    glow: '0 0 20px #ffff00',
    name: 'Hacker Amarelo',
    description: 'Amarelo terminal hacker'
  },
  'tron-blue': {
    primary: '#00bfff',
    primaryRGB: '0, 191, 255',
    glow: '0 0 20px #00bfff',
    name: 'Tron Azul',
    description: 'Azul elétrico Tron'
  }
};


export const casinoTheme = {
  // Brand colors
  colors: {
    primary: 'hsl(var(--primary))',
    primaryLight: 'hsl(var(--primary-light))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    casino: {
      gold: 'hsl(var(--casino-gold))',
      purple: 'hsl(var(--casino-purple))',
      red: 'hsl(var(--casino-red))',
      green: 'hsl(var(--casino-green))',
      blue: 'hsl(var(--casino-blue))',
      black: 'hsl(var(--casino-black))',
    }
  },
  
  // Font families
  fonts: {
    heading: 'var(--font-sans)',
    body: 'var(--font-sans)',
  },
  
  // Slot machine themes
  slotThemes: {
    classic: {
      background: 'linear-gradient(to bottom, #2c3e50, #1a2530)',
      reelBackground: '#34495e',
      buttonColor: 'hsl(var(--casino-gold))',
      textColor: '#ffffff',
      symbols: ['🍒', '🍋', '🍊', '🔔', '💎', '7️⃣'],
    },
    fruity: {
      background: 'linear-gradient(to bottom, #27ae60, #2ecc71)',
      reelBackground: '#228b22',
      buttonColor: '#e74c3c',
      textColor: '#ffffff',
      symbols: ['🍓', '🍌', '🍎', '🍉', '🍍', '🥭'],
    },
    space: {
      background: 'linear-gradient(to bottom, #0c0e22, #1e2147)',
      reelBackground: '#16193b',
      buttonColor: '#9b59b6',
      textColor: '#ffffff',
      symbols: ['🌍', '🚀', '👨‍🚀', '👽', '🛸', '🌌'],
    },
    jackpot: {
      background: 'linear-gradient(to bottom, #8e44ad, #9b59b6)',
      reelBackground: '#7d3c98',
      buttonColor: 'hsl(var(--casino-gold))',
      textColor: '#ffffff',
      symbols: ['💎', '👑', '💰', '💍', '💵', '💯'],
    },
  },
  
  // Animation speeds
  animations: {
    fast: '0.2s',
    medium: '0.5s',
    slow: '1s',
  },
  
  // Effect settings
  effects: {
    winGlow: '0 0 15px hsl(var(--casino-gold))',
    buttonGlow: '0 0 10px rgba(255, 215, 0, 0.5)',
  },
  
  // Sound settings
  sounds: {
    enabled: true,
    volume: 0.5,
  },
  
  // UI settings
  ui: {
    borderRadius: '0.5rem',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
};

export type CasinoTheme = typeof casinoTheme;
export type SlotTheme = keyof typeof casinoTheme.slotThemes;

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    primary: string;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((v) => !v);

  const colors = isDark
    ? {
        background: '#0b0b0c',
        card: '#0b0b0c',
        text: '#ffffff',
        muted: '#9a9a9a',
        primary: '#E67012',
      }
    : {
        background: '#ffffff',
        card: '#ffffff',
        text: '#222222',
        muted: '#666666',
        primary: '#E67012',
      };

  return (
  <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeProvider;

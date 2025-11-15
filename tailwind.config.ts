import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Instagram-style card colors
        pink: {
          primary: '#ff0080',
          light: '#ff4da6',
        },
        blue: {
          verified: '#00d4ff',
          'verified-end': '#0099ff',
        },
        green: {
          online: '#00ff88',
        },
        gold: {
          star: '#ffd700',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-pink': 'linear-gradient(135deg, #ff0080, #ff4da6)',
        'gradient-blue': 'linear-gradient(135deg, #00d4ff, #0099ff)',
      },
      boxShadow: {
        'pink-glow': '0 8px 24px rgba(255, 0, 128, 0.4)',
        'online-pulse': '0 0 10px rgba(0, 255, 136, 0.6)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
          },
          '50%': {
            opacity: '0.7',
            transform: 'scale(0.95)',
            boxShadow: '0 0 6px rgba(0, 255, 136, 0.4)',
          },
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};

export default config;

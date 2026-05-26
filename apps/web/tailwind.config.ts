import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e9eef5',
          200: '#cfd9e7',
          300: '#a7b8d2',
          400: '#7891b8',
          500: '#56729f',
          600: '#3d5a85',
          700: '#314869',
          800: '#1f2d44',
          900: '#0f1a2e',
          950: '#070d1a',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        elevated: '0 10px 30px -10px rgb(15 23 42 / 0.15), 0 4px 12px -4px rgb(15 23 42 / 0.08)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-in-up': 'fade-in-up 240ms cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scale-in 180ms cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [animate],
};
export default config;

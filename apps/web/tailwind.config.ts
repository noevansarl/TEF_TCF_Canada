import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1B3A6B', light: '#2E75B6', dark: '#152e56' },
        secondary: { DEFAULT: '#C55A11', light: '#e06515' },
        success:   '#1E7145',
        error:     '#C00000',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      borderRadius: { xl: '12px', '2xl': '20px' },
      animation: {
        'fade-in':     'fadeIn 0.3s ease',
        'slide-up':    'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'waveform':    'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' },
                   '100%': { opacity: '1', transform: 'translateY(0)' } },
        wave:    { '0%,100%': { transform: 'scaleY(1)' },
                   '50%': { transform: 'scaleY(2)' } },
      }
    }
  },
  plugins: []
} satisfies Config

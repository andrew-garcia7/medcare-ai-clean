/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],

  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },

      colors: {
        bg: {
          DEFAULT: '#020b18',
          2: '#041426',
          3: '#061e36',
        },

        teal: {
          DEFAULT: '#00d4b4',
          glow: 'rgba(0,212,180,0.15)',
        },

        blue: {
          med: '#4f9cf9',
          dark: '#2563eb',
        },

        gold: '#f0c040',

        'text-muted': '#8fa8c0',
        'text-faint': '#506070',
      },

      backgroundImage: {
        'grad-teal':
          'linear-gradient(135deg, #00d4b4, #2563eb)',

        'grad-card':
          'linear-gradient(135deg, rgba(0,212,180,0.06), rgba(79,156,249,0.04))',
      },

      animation: {
        'fade-up': 'fadeUp 0.8s ease both',
        'pulse-dot': 'pulseDot 2s infinite',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },

        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.5)' },
        },
      },
    },
  },

  plugins: [],
};
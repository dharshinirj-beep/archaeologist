/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        canvas: '#F7F4EF',
        surface: '#FFFFFF',
        ink: {
          900: '#1A1814',
          700: '#3D3A33',
          500: '#6B665C',
          300: '#A8A199',
        },
        clay: {
          50: '#FBF7F2',
          100: '#F4E9DC',
          200: '#E8D4BD',
          300: '#D9BC9A',
          400: '#C79E72',
          500: '#B5854F',
          600: '#9A6E3E',
          700: '#7E5832',
          800: '#634628',
          900: '#4A3520',
        },
        sage: {
          400: '#7A9B7E',
          500: '#5C8262',
          600: '#4A6B50',
        },
        rust: {
          500: '#B85C3C',
          600: '#A04E32',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26,24,20,0.04), 0 4px 16px rgba(26,24,20,0.05)',
        lift: '0 2px 4px rgba(26,24,20,0.05), 0 12px 32px rgba(26,24,20,0.08)',
        glow: '0 0 0 1px rgba(181,133,79,0.2), 0 8px 32px rgba(181,133,79,0.12)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(181,133,79,0.15)' },
          '50%': { boxShadow: '0 0 0 8px rgba(181,133,79,0.03)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        scaleIn: 'scaleIn 0.4s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        drawLine: 'drawLine 1.2s ease-out forwards',
        floatY: 'floatY 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

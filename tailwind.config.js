/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0f766e',
        accent: '#b5823d',
        dark: '#17333b',
        light: '#f4efe7',
        surface: '#fff9f1',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Manrope', 'serif'],
      },
      animation: {
        'rise': 'rise 0.6s ease-out',
        'shine': 'shine 0.3s ease-in-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shine: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(8, 145, 178, 0.35)' },
          '50%': { boxShadow: '0 0 0 12px rgba(8, 145, 178, 0)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backgroundImage: {
        'gradient-pet': 'linear-gradient(135deg, #0f766e 0%, #17333b 100%)',
        'gradient-soft': 'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(181, 130, 61, 0.12) 100%)',
      },
    },
  },
  plugins: [],
}

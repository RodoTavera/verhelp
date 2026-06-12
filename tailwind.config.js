/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#3F6B4D',
        accent: '#C97A4B',
        dark: '#1F2A1D',
        light: '#F5F0E6',
        surface: '#FBF8F2',
        leaf: '#7FA08A',
        sand: '#E6D8BE',
        terracotta: '#C97A4B',
        ink: '#1F2A1D',
        moss: '#3F6B4D',
        cream: '#FBF8F2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Inter', 'serif'],
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
        'gradient-pet': 'linear-gradient(135deg, #3F6B4D 0%, #1F2A1D 100%)',
        'gradient-soft': 'linear-gradient(135deg, rgba(63, 107, 77, 0.08) 0%, rgba(201, 122, 75, 0.1) 100%)',
        'gradient-animal': 'linear-gradient(140deg, #F5F0E6 0%, #E6D8BE 100%)',
        'gradient-meadow': 'linear-gradient(180deg, rgba(127, 160, 138, 0.18) 0%, rgba(245, 240, 230, 0) 100%)',
      },
    },
  },
  plugins: [],
}

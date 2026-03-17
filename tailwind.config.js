/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['\"JetBrains Mono\"', 'monospace'],
      },
      colors: {
        sovereign: {
          bg: '#0F1115',
          card: '#161B22',
          border: '#2B2B2B',
          accent: '#F4C430',
          headerBorder: '#1A1F26',
        },
      },
    },
  },
  plugins: [],
}

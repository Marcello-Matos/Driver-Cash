/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e9fbf1',
          100: '#c9f5dc',
          200: '#93ebb9',
          300: '#57dd92',
          400: '#22c55e',
          500: '#16a34a',
          600: '#12823c',
          700: '#106634',
          800: '#0f512c',
          900: '#0c3f24'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
      }
    }
  },
  plugins: []
}

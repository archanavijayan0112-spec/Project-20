/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#161312',
        paper: '#FAF6EF',
        clay: '#C2582E',
        moss: '#3F4D3A',
        sand: '#E8DFC9',
        ember: '#E0A23B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
      }
    },
  },
  plugins: [],
};

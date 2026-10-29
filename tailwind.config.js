export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { navy: { 950: '#050816', 900: '#0a1030', 800: '#0f1a45' } },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['"Space Grotesk"', 'Inter', 'sans-serif'] },
      boxShadow: { glow: '0 0 40px rgba(59,130,246,.45)' },
    },
  },
  plugins: [],
}

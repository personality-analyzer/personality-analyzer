export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Tajawal', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#0e7490', light: '#22b8cf', dark: '#0b5566' },
      },
    },
  },
  plugins: [],
};

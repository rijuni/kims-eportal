export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'kims-bg': '#196174', // Teal background from mockup
        'kims-green': '#0e8851', // Active sidebar green
        'kims-header-btn': '#2c4048', // Dark X button
        'kims-header-icon': '#e2e8f0', // Search icon color
      },
      fontFamily: {
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

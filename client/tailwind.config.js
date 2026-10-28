/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ove: {
          primary: '#777B45',      // Primary Olive Green
          forest: '#30452B',       // Deep Forest Green
          secondary: '#929568',    // Secondary Olive
          main: '#FFFFFF',         // Main Background
          soft: '#F7F8F3',         // Soft Background
          card: '#FFFFFF',         // Card Background
          text: '#273126',         // Primary Dark Text
          muted: '#74796F',        // Secondary Muted Text
          border: '#E4E7DC',       // Borders
          success: '#477A52',      // Success / Won
          warning: '#B88736',      // Warning / Pending
          error: '#B94A48',        // Error / Lost
        },
        // Keep brand aliases for backwards-compatibility
        brand: {
          primary: '#777B45',
          forest: '#30452B',
          soft: '#F7F8F3',
          text: '#273126',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

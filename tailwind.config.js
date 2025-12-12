/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The specific background from the video
        bg: '#000000', 
        card: '#1C1C1E', // Apple-style dark grey card
        subcard: '#2C2C2E', // Slightly lighter for items
        accent: '#FFFFFF', // High contrast white
        muted: '#8E8E93', // Text grey
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Clean modern font
      }
    },
  },
  plugins: [],
}
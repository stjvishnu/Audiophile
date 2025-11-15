/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Your content paths here
  ],
  theme: {
    extend: {
      // Your theme extensions here
    },
  },
  plugins: [
    // ✅ Use the correct name of the installed package
    require('tailwind-scrollbar-hide'),
  ],
}
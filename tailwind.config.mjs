/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        surface: '#111827',
        'surface-hover': '#1f2937',
        border: '#374151',
        'text-primary': '#f3f4f6',
        'text-secondary': '#9ca3af',
        accent: '#f43f5e',
      },
    },
  },
  plugins: [],
};

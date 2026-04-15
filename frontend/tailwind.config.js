/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f4a8e",
        secondary: "#0c3c73",
        "sidebar-bg": "#f9f9fb",
        "bg-main": "#f4f6f8",
        "blue-light": "#e0f2fe",
        "green-light": "#dcfce7",
        "red-light": "#fee2e2",
        "yellow-light": "#fef3c7",
        "text-muted": "#64748b",
        "text-main": "#1e293b",
        "border-col": "#e2e8f0",
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 8px 20px -4px rgb(0 0 0 / 0.12), 0 4px 8px -2px rgb(0 0 0 / 0.06)',
      }
    },
  },
  plugins: [],
}

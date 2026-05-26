/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff", 100: "#d9eaff", 200: "#bbdbff",
          500: "#2b7bf4", 600: "#1660e9", 700: "#1250d6",
          800: "#1542ae", 950: "#122454",
        },
        surface: {
          0: "#ffffff", 50: "#f8f9fb", 100: "#f1f3f7",
          200: "#e4e8f0", 300: "#cdd3e0", 400: "#9aa3b8",
          500: "#6b7591", 600: "#4e5870", 700: "#374154",
          800: "#232d3f", 900: "#151c2b", 950: "#0d1220",
        },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        float: "0 8px 32px 0 rgb(0 0 0 / 0.12)",
      },
    },
  },
  plugins: [],
};

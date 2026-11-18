/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ["Poppins", "ui-sans-serif", "system-ui"] },
    colors: { brand: { 50:"#EEF4FF",100:"#DCE8FF",500:"#3B82F6",600:"#2563EB",700:"#1D4ED8" }, ink: "#14213D", mint: "#22C55E" },
    boxShadow: { card: "0 10px 30px -12px rgba(37,99,235,.18)" },
  } },
  plugins: [],
};

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ["DM Sans", "Arial", "sans-serif"] },
    colors: {
      brand: { 50: "#f3f4ec", 100: "#e2e8da", 500: "#406451", 600: "#305440", 700: "#203f32" },
      ink: "#192c23", mint: "#537156",
      slate: { 50: "#f4f3ed", 100: "#eaeae1", 200: "#d9dace", 300: "#c2c6b9", 500: "#60685f", 600: "#4e594f", 700: "#39463b" }
    },
    borderRadius: { lg: "4px", xl: "5px", "2xl": "6px", "3xl": "8px" },
    boxShadow: { card: "0 6px 24px -14px rgba(22,42,30,.24)" },
  } },
  plugins: [],
};

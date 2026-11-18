export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ["DM Sans", "Arial", "sans-serif"] },
    colors: {
      brand: { 50: "#fff4f0", 100: "#ffe1d7", 500: "#b93622", 600: "#a82e1d", 700: "#882719" },
      ink: "#222324", mint: "#ad3824",
      slate: { 50: "#f5f5f6", 100: "#ededef", 200: "#dedee0", 300: "#c7c7cb", 500: "#626268", 600: "#515258", 700: "#414247" }
    },
    borderRadius: { lg:"10px", xl:"15px", "2xl":"20px", "3xl":"28px" },
    boxShadow: { card:"0 12px 32px -20px rgba(30,32,37,.26)" },
  } },
  plugins: [],
};

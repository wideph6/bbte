import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        urdu: ["var(--font-urdu)", "var(--font-urdu-fallback)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Premium emerald — Islamic education feel, trustworthy + serious.
        brand: {
          DEFAULT: "#047857",
          dark: "#064e3b",
          darker: "#022c22",
          light: "#10b981",
          tint: "#ecfdf5",
        },
        // Gold accent — Pakistani favorite for premium / sacred contexts.
        gold: {
          DEFAULT: "#ca8a04",
          light: "#eab308",
          soft: "#fde68a",
          deep: "#854d0e",
        },
        cream: {
          DEFAULT: "#faf7f0",
          dark: "#f5efdf",
        },
        whatsapp: "#25D366",
        whatsappDark: "#128C7E",
      },
      backgroundImage: {
        // Subtle Islamic-feel radial gradient washes for hero/cta sections.
        "hero-radial":
          "radial-gradient(ellipse at top right, rgba(16,185,129,0.18), transparent 55%), radial-gradient(ellipse at bottom left, rgba(202,138,4,0.10), transparent 50%)",
        "emerald-rich":
          "linear-gradient(135deg, #064e3b 0%, #047857 45%, #022c22 100%)",
        "cta-rich":
          "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(2,44,34,0.06), 0 4px 16px rgba(2,44,34,0.06)",
        lift: "0 4px 8px rgba(2,44,34,0.06), 0 16px 40px rgba(2,44,34,0.10)",
        glow: "0 0 0 1px rgba(4,120,87,0.10), 0 12px 32px rgba(4,120,87,0.18)",
        gold: "0 8px 24px rgba(202,138,4,0.25)",
        wa: "0 8px 24px rgba(37,211,102,0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shine": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "fade-up": "fade-up 0.6s ease-out both",
        "shine": "shine 2.5s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

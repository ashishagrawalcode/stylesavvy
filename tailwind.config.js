/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      colors: {
        brand: {
          purple: "#9b59ff",
          cyan: "#06b6d4",
          pink: "#f472b6",
          green: "#10b981",
        },
        surface: {
          DEFAULT: "#0d0d0d",
          2: "#111111",
          3: "#171717",
        },
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        dotBlink: {
          "0%, 80%, 100%": { opacity: "0", transform: "scale(0.8)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(155,89,255,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(155,89,255,0.6)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        rotateSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "rotate-slow": "rotateSlow 20s linear infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        "fade-in-up": "fadeInUp 0.7s ease forwards",
        "slide-in-left": "slideInLeft 0.7s ease forwards",
        "slide-in-right": "slideInRight 0.7s ease forwards",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-lg": "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        glow: "0 0 30px rgba(155,89,255,0.35)",
        "glow-cyan": "0 0 30px rgba(6,182,212,0.35)",
        "glow-lg": "0 0 60px rgba(155,89,255,0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "neon-gradient": "linear-gradient(135deg, #9b59ff 0%, #06b6d4 100%)",
        "premium-gradient": "linear-gradient(160deg, #ffffff 0%, #888888 100%)",
      },
    },
  },
  plugins: [],
};
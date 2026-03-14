import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {
      colors: {
        border: "hsl(217 33% 17%)",
        input: "hsl(217 33% 17%)",
        ring: "hsl(190 95% 55%)",
        background: "hsl(222 47% 7%)",
        foreground: "hsl(210 40% 98%)",
        primary: {
          DEFAULT: "hsl(190 95% 55%)",
          foreground: "hsl(222 47% 7%)"
        },
        muted: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(215 20% 75%)"
        },
        card: {
          DEFAULT: "hsl(222 47% 10% / 0.65)",
          foreground: "hsl(210 40% 98%)"
        }
      },
      borderRadius: {
        lg: "1rem",
        md: "0.8rem",
        sm: "0.6rem"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
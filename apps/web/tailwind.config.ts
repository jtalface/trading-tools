import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121417",
        panel: "#ffffff",
        line: "#d9dee7",
        mint: "#1f9d7a",
        berry: "#a2345c",
        amber: "#b77716",
        steel: "#425466"
      },
      boxShadow: {
        soft: "0 12px 35px rgba(18, 20, 23, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

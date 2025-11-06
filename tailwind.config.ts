import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        chat: {
          background: "#0b141a",
          sidebar: "#111b21",
          bubbleSent: "#005c4b",
          bubbleReceived: "#202c33"
        }
      }
    }
  },
  plugins: []
};

export default config;

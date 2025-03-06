/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"], // Escaneia arquivos Angular
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#A0C4FF", // Azul pastel claro
          DEFAULT: "#6C8EBF", // Azul pastel mais forte
          dark: "#4A6A97", // Azul escuro suave
        },
        secondary: {
          light: "#A3D9A5", // Verde turquesa pastel claro
          DEFAULT: "#6CBF87", // Verde pastel médio
          dark: "#4A8A65", // Verde escuro suave
        },
        neutral: {
          100: "#FFFFFF", // Fundo branco
          200: "#F8FAFC", // Fundo cinza claro
          300: "#E2E8F0", // Cinza muito claro
          400: "#CBD5E1", // Cinza suave
          500: "#94A3B8", // Cinza médio
          600: "#555555", // Texto principal
          700: "#777777", // Texto secundário
        },
      },
    },
  },  
  plugins: [
    require('@tailwindcss/forms'), // Plugin para formulários
    require('@tailwindcss/typography'), // Plugin para textos
  ],
};

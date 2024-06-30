/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'text-gradient': 'linear-gradient(to right, #a18cd1, #fbc2eb, #fdcbf1, #ef6d4a, #ff9a9e)',
      },
    },
  },
  plugins: [],
};

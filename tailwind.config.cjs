// tailwind.config.cjs
const withMT = require("@material-tailwind/react/utils/withMT")
module.exports = withMT({
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
    "./src/components/ReactBits/**/*.{js,jsx,ts,tsx}", // <- NEW
    "./node_modules/@material-tailwind/react/components/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/theme/**/*.{js,jsx,ts,tsx}",
  ],
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"), // por si el Bit lo pide
  ],
})

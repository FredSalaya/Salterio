module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}",
  ],
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
}
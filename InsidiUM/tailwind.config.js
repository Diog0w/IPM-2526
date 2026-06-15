/**
 * Configuração do Tailwind CSS
 * Define os ficheiros onde o Tailwind deve procurar classes CSS
 * @type {import('tailwindcss').Config}
 */
export default {
  // Caminhos dos ficheiros onde o Tailwind deve procurar classes
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  // Extensões do tema padrão (atualmente vazio)
  theme: { extend: {} },
  // Plugins do Tailwind (atualmente nenhum)
  plugins: [],
}

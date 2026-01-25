/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Modern gradient colors
                'brand-cyan': '#06b6d4',
                'brand-purple': '#a855f7',
                'brand-pink': '#ec4899',
            },
        },
    },
    plugins: [],
}

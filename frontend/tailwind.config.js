/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Home page colors
                "primary": "#0A7599",
                "primary-hover": "#085c7a",
                "accent": "#10B981",
                "background-light": "#F7FAFC",
                "background-dark": "#0A101D",
                "text-light": "#1A202C",
                "text-dark": "#E2E8F0",
                "text-muted-light": "#4A5568",
                "text-muted-dark": "#A0AEC0",
                "border-light": "#E2E8F0",
                "border-dark": "#2D3748",

                // Dashboard colors (from provided HTML)
                'primary-light': '#06b6d4', // Cyan 500
                'primary-dark': '#0e7490', // Cyan 700
                'background': '#020617', // Slate 950
                'surface': '#0f172a',    // Slate 900
                'surface-accent': '#1e293b', // Slate 800
                'text-primary': '#f8fafc', // Slate 50
                'text-secondary': '#94a3b8', // Slate 400
                'text-tertiary': '#475569', // Slate 600
                'border-color': '#334155', // Slate 700

                // Light mode dashboard colors
                'light-background': '#ffffff',
                'light-surface': '#f8fafc', // Slate 50
                'light-surface-accent': '#f1f5f9', // Slate 100
                'light-text-primary': '#0f172a', // Slate 900
                'light-text-secondary': '#64748b', // Slate 500
                'light-text-tertiary': '#94a3b8', // Slate 400
                'light-border-color': '#e2e8f0', // Slate 200
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"],
                "sans": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.75rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
                "full": "9999px"
            },
            boxShadow: {
                'glow-cyan': '0 0 30px -5px rgba(8, 145, 178, 0.6)',
                'inner-strong': 'inset 0 2px 4px 0 rgba(0,0,0,0.5)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
    ],
}

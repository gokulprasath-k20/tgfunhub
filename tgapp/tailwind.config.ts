import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Strict grayscale palette — no color tints allowed
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0a',
        },
        'surface-raised': {
          DEFAULT: '#f9f9f9',
          dark: '#111111',
        },
        border: {
          DEFAULT: '#e5e5e5',
          dark: '#2a2a2a',
        },
        'text-primary': {
          DEFAULT: '#0a0a0a',
          dark: '#fafafa',
        },
        'text-secondary': {
          DEFAULT: '#525252',
          dark: '#a3a3a3',
        },
        'text-tertiary': {
          DEFAULT: '#a3a3a3',
          dark: '#525252',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

export default config

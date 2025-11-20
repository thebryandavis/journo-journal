import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          lighter: '#404040',
        },
        newsprint: {
          DEFAULT: '#F5F1E8',
          dark: '#E8E4DB',
          darker: '#DBD7CE',
        },
        highlight: {
          amber: '#FFB800',
          red: '#FF6B35',
        },
        editorial: {
          green: '#2ECC71',
          blue: '#3498DB',
          purple: '#9B59B6',
        },
      },
      fontFamily: {
        newsreader: ['var(--font-newsreader)', 'serif'],
        crimson: ['var(--font-crimson)', 'serif'],
        source: ['var(--font-source-serif)', 'serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'typewriter': 'typewriter 0.3s steps(20)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

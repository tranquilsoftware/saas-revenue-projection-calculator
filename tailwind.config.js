module.exports = {
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
theme: {
    extend: {
      colors: {
        background: "rgb(15, 23, 42)",
        foreground: "rgb(241, 245, 249)",
        primary: {
          DEFAULT: "rgb(59, 130, 246)",
          light: "rgb(96, 165, 250)",
        },
        secondary: {
          DEFAULT: "rgb(30, 41, 59)",
          light: "rgb(71, 85, 105)",
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}
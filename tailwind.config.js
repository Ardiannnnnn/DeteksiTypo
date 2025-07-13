module.exports = {
  content: ["./templates/**/*.html", "./static/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        'primary': '#667eea',
        'secondary': '#764ba2',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
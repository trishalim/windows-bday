export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        chrome: '#f4dced',
        chromeDark: '#8a6b7c',
        ink: '#3a1c2c',
        hotpink: '#ff2fa0',
        bubblegum: '#ff7ec9',
        cotton: '#ffd9f0',
        lilac: '#c9a7ff',
        sky: '#bfe4ff',
        lemon: '#fff6a8',
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'monospace'],
        crt: ['VT323', 'monospace'],
        bubble: ['Sniglet', '"Comic Sans MS"', 'cursive'],
        ui: ['Tahoma', 'Verdana', 'sans-serif'],
      },
    },
  },
}

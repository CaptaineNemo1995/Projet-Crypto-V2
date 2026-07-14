/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#EFECE3',   // page background
        paper2: '#F7F5EE',  // ballot card background
        ink: '#191713',     // primary text / sidebar bg / dark buttons
        accent: '#B3341F',  // rust/brick red
        t1: '#55524A',      // secondary text
        t2: '#84806F',      // muted labels
        t3: '#A29D8D',      // faint
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

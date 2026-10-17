/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg0: 'var(--bg-0)',
        bg1: 'var(--bg-1)',
        bg2: 'var(--bg-2)',
        bg3: 'var(--bg-3)',
        hover: 'var(--bg-hover)',
        line: 'var(--border)',
        'line-strong': 'var(--border-strong)',
        ink: 'var(--text-0)',
        'ink-1': 'var(--text-1)',
        'ink-2': 'var(--text-2)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-soft': 'var(--accent-soft)',
        'accent-ink': 'var(--accent-ink)',
        danger: 'var(--danger)',
        success: 'var(--success)',
      },
      fontFamily: {
        sans: ['var(--font-work-sans)', 'Work Sans', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        mono: [
          'var(--font-ibm-plex-mono)',
          'IBM Plex Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      letterSpacing: {
        eyebrow: '0.25em',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '6px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        lg: 'var(--shadow-lg)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease both',
        'fade-in': 'fade-in 0.3s ease both',
      },
    },
  },
  plugins: [],
};

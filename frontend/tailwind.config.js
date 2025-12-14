/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
  			'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
  			'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
  			'gradient-success': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  			'gradient-warm': 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
  			'gradient-cool': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  			'hero-pattern': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(221, 83%, 53%, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(270, 67%, 58%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(172, 66%, 50%, 0.2) 0px, transparent 50%)',
  		},
  		boxShadow: {
  			'glow': '0 0 20px rgba(59, 130, 246, 0.35)',
  			'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
  			'glow-purple': '0 0 20px rgba(139, 92, 246, 0.35)',
  			'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.35)',
  			'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 4px 20px -5px rgba(0, 0, 0, 0.05)',
  			'elevated-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  			'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.1)',
  			'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.05)',
  			'card-hover': '0 20px 40px -15px rgba(59, 130, 246, 0.2), 0 10px 20px -10px rgba(0, 0, 0, 0.1)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-in': {
  				from: { opacity: '0', transform: 'translateY(10px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'fade-in-up': {
  				from: { opacity: '0', transform: 'translateY(20px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'slide-in-right': {
  				from: { opacity: '0', transform: 'translateX(20px)' },
  				to: { opacity: '1', transform: 'translateX(0)' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.95)' },
  				to: { opacity: '1', transform: 'scale(1)' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
  				'50%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.8), 0 0 50px rgba(139, 92, 246, 0.4)' }
  			},
  			'gradient-x': {
  				'0%, 100%': { 'background-position': '0% 50%' },
  				'50%': { 'background-position': '100% 50%' }
  			},
  			'shimmer': {
  				'0%': { 'background-position': '-1000px 0' },
  				'100%': { 'background-position': '1000px 0' }
  			},
  			'bounce-subtle': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' }
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'slide-in-right': 'slide-in-right 0.5s ease-out',
  			'scale-in': 'scale-in 0.3s ease-out',
  			'float': 'float 6s ease-in-out infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'gradient-x': 'gradient-x 4s ease infinite',
  			'shimmer': 'shimmer 2s infinite linear',
  			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
  		},
  		backgroundImage: {
  			'grid-white': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(255 255 255 / 0.05)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")',
  			'grid-black': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(0 0 0 / 0.1)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")',
  			'grid-small-white': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' width=\'16\' height=\'16\' fill=\'none\' stroke=\'rgb(255 255 255 / 0.05)\'%3e%3cpath d=\'M0 .5H15.5V16\'/%3e%3c/svg%3e")',
  			'grid-small-black': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' width=\'16\' height=\'16\' fill=\'none\' stroke=\'rgb(0 0 0 / 0.1)\'%3e%3cpath d=\'M0 .5H15.5V16\'/%3e%3c/svg%3e")',
  			'dot-white': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'16\' height=\'16\' fill=\'none\'%3e%3ccircle fill=\'rgb(255 255 255 / 0.1)\' cx=\'10\' cy=\'10\' r=\'1.625\'/%3e%3c/svg%3e")',
  			'dot-black': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'16\' height=\'16\' fill=\'none\'%3e%3ccircle fill=\'rgb(0 0 0 / 0.1)\' cx=\'10\' cy=\'10\' r=\'1.625\'/%3e%3c/svg%3e")',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
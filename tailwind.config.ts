import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: ["Poppins", "Inter", "sans-serif"],
				serif: ["Playfair Display", "Georgia", "serif"],
				display: ["Montserrat", "sans-serif"],
			},
			spacing: {
				// Premium luxury whitespace scale
				'lux-xs': '1.25rem',   // 20px
				'lux-sm': '2rem',      // 32px
				'lux-md': '3.5rem',    // 56px
				'lux-lg': '5.5rem',    // 88px
				'lux-xl': '8rem',      // 128px
				'lux-2xl': '12rem',    // 192px
				// Finer granular units
				'18': '4.5rem',
				'22': '5.5rem',
				'26': '6.5rem',
				'30': '7.5rem',
				'36': '9rem',
				'44': '11rem',
				'52': '13rem',
				'62': '15.5rem',
				'78': '19.5rem',
				'98': '24.5rem',
				'118': '29.5rem',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'luxury-sm': '0.375rem',
				'luxury-md': '0.75rem',
				'luxury-lg': '1.25rem',
				'luxury-xl': '2rem',
				'luxury-full': '9999px',
			},
			boxShadow: {
				'luxury-sm': '0 4px 20px -2px rgba(199, 157, 76, 0.06)',
				'luxury-md': '0 10px 30px -5px rgba(199, 157, 76, 0.10)',
				'luxury-lg': '0 20px 50px -10px rgba(199, 157, 76, 0.12)',
				'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
				'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
				'glass-lg': '0 12px 40px 0 rgba(0, 0, 0, 0.10)',
				'premium': '0 20px 40px -15px rgba(10, 17, 40, 0.08)',
			},
			transitionTimingFunction: {
				'luxury-ease': 'cubic-bezier(0.16, 1, 0.3, 1)', // out-expo
				'luxury-in-out': 'cubic-bezier(0.76, 0, 0.24, 1)',
			},
			transitionDuration: {
				'luxury-slow': '600ms',
				'luxury-medium': '400ms',
				'luxury-fast': '200ms',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'gradient-x': {
					'0%, 100%': {
						'background-size': '200% 200%',
						'background-position': 'left center'
					},
					'50%': {
						'background-size': '200% 200%',
						'background-position': 'right center'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(-10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gradient-x': 'gradient-x 3s ease infinite',
				'fade-in': 'fade-in 0.8s ease-out forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

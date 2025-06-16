import tailwindcss from 'tailwindcss';

export default tailwindcss({
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		{
			raw: `
				bg-green-500 border-green-400 
				bg-gray-500 border-gray-400 text-gray-300
				bg-gray-600 bg-gray-700 border-gray-600
				hover:bg-gray-600 hover:scale-105
				md:px-2 md:py-1 md:text-sm md:w-9 md:h-9 md:text-base
				bg-game-bg bg-container-bg bg-border-color text-accent-blue text-accent-red
			`,
			extension: 'html'
		}
	],
	theme: {
		colors: {
			// Base colors
			black: '#000000',
			white: '#ffffff',
			transparent: 'transparent',
			
			// Gray scale
			gray: {
				100: '#f7fafc',
				200: '#edf2f7',
				300: '#e2e8f0',
				400: '#cbd5e0',
				500: '#a0aec0',
				600: '#718096',
				700: '#4a5568',
				800: '#2d3748',
				900: '#1a202c',
			},
			
			// Colors
			red: {
				400: '#fc8181',
				500: '#f56565',
			},
			green: {
				400: '#68d391',
				500: '#48bb78',
			},
			blue: {
				400: '#63b3ed',
				500: '#4299e1',
			},
			
			// Game-specific colors
			'game-bg': '#1a1a1a',
			'container-bg': '#2a2a2a',
			'border-color': '#3a3a3a',
			'accent-blue': '#4ecdc4',
			'accent-red': '#ff6b6b',
		},
		extend: {
			animation: {
				shake: 'shake 0.3s ease-in-out',
			},
			keyframes: {
				shake: {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-5px)' },
					'75%': { transform: 'translateX(5px)' },
				},
			},
		},
	},
});
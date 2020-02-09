const values = {
	script: 'Justlove, serif',
	serif: 'NYTStymie, sans-serif'
}

export const print = (...vars) => {
	
	// Simply prints the given values.
	// => string

	return vars.map(varName => values[varName] || varName).join(' ')
}
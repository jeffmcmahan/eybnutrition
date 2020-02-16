const colors = {
	foreground: [64, 159, 118],
	accent: [150, 115, 150]
}

export const color = (colorName, luminosity = '0%', alpha = '100%') => {

	/// Creates a color of the given shade/tint and opacity.
	/// => string

	let [r, g, b] = (colors[colorName] || [])
	luminosity = (parseFloat(luminosity.slice(0, -1)) / 100)
	if (luminosity > 0) {
		r += ((255 - r) * luminosity)
		g += ((255 - g) * luminosity)
		b += ((255 - b) * luminosity)
	} else if (luminosity < 0) {
		r += (r * luminosity)
		g += (g * luminosity)
		b += (b * luminosity)
	}

	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
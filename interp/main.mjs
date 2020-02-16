import {color} from './color.mjs'
import {include} from './include.mjs'
import {print} from './print.mjs'

const functions = {color, include, print} // Runtime functions.

const parseExpression = src => {

	/// Parses the given src into an object representing a function call.
	/// => Object

	src = src.slice(2, -2)
	const functionName = src.split(':')[0].trim()
	const parameters = src.split(':').pop().split(',').map(s => s.trim())
	return {functionName, parameters}
}

export const interp = async src => {

	/// Interpolates variables into text files of all kinds.
	/// => string

	let pos = 0
	const expressions = []
	while (pos < src.length) {
		if (src.slice(pos, pos + 2) == '((') {
			const onset = pos
			const offset = (pos + src.slice(pos).indexOf('))') + 2)
			if (offset < onset) {
				throw new Error('Unclosed interpolation.')
			}
			expressions.push({onset, offset})
			pos = offset
		} else {
			pos++
		}
	}

	const ops = expressions.map(async expr => {
		expr.raw = src.slice(expr.onset, expr.offset)
		let {functionName, parameters} = parseExpression(expr.raw)
		if (functionName === 'nonce') {
			functionName = 'print'
			parameters = [('x' + String(Math.random()).slice(2))]
		}
		if (!functions[functionName]) {
			throw new Error(`${functionName} is not defined.`)
		}
		expr.value = await functions[functionName](...parameters)
	})

	await Promise.all(ops)

	expressions.forEach(expr => {
		src = src.split(expr.raw).join(expr.value)
	})

	return src
}
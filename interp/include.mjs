import {promises as fs} from 'fs'
import {dirname, join} from 'path'
import {interp} from './main.mjs'

const dir = dirname(dirname(import.meta.url.slice(7)))

export const include = async fname => {
	
	/// Reads the file, interpolates it, and returns the content.
	/// => string

	const src = await fs.readFile(join(dir, 'content', fname), 'utf8')
	return await interp(src)
}
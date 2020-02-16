import {createServer} from 'http'
import {promises as fs} from 'fs'
import {extname, join, dirname} from 'path'
import {interp} from './interp/main.mjs'

const root = dirname(import.meta.url.slice(7))

const mimeTypes = {
	'.js': 'application/javascript',
	'.pdf': 'application/pdf',
	'.css': 'text/css',
	'.html': 'text/html',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.svg': 'image/svg+xml'
}

const fname = uri => {

	/// Produces a safe fname string (cannot leave content dir).
	/// => string

	const contentDir = join(root, 'content')
	uri = join(contentDir, uri)
	if (!uri.startsWith(contentDir)) {
		throw new Error('Ha!')
	}
	return uri
}

createServer(async (req, res) => {

	/// The webserver...
	/// => undefined

	let data = ''
	let uri = req.url.slice(1)
	
	if (!uri.includes('.')) {
		uri = (uri || 'home')
		uri += '/content.html'
		const html = await fs.readFile(fname(uri), 'utf8').catch(e => e)
		data = await interp(html).catch(e => e)
	} else if (uri.match(/\.(jpg)|(png)|(ico)|(pdf)$/)) {
		data = await fs.readFile(fname(uri)).catch(e => e)
	} else {
		data = await fs.readFile(fname(uri), 'utf8').catch(e => e)
		data = await interp(data)
	}

	if (data instanceof Error) {
		console.log(data)
		res.statusCode = 404
		res.end('Not Found')
	} else {
		const mime = (mimeTypes[extname(uri).toLowerCase()] || 'text/plain')
		res.setHeader('Content-Type', mime)
		res.setHeader('Cache-Control', 'max-age=3600')
		res.end(data)
	}
}).listen(3000)
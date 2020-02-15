import {createServer} from 'http'
import {promises as fs} from 'fs'
import {extname} from 'path'
import {interp} from './interp/main.mjs'

const getHtmlDoc = async uri => {

	/// Find the file with the matching canonical URL and return its content.
	/// => string

	if (uri.includes('..')) {
		throw new Error('Could not resolve URI string to path.')
	}
	return await fs.readFile(uri, 'utf8')
}

const mime = uri => {

	/// Gets the correct MIME type for the given URI, if any.
	/// => string

	const mimeType = {
		'.js': 'application/javascript',
		'.css': 'text/css',
		'.html': 'text/html',
		'.jpg': 'image/jpeg',
		'.png': 'image/png',
		'.ico': 'image/x-icon',
		'.svg': 'image/svg+xml'
	}[extname(uri).toLowerCase()]

	return (mimeType || 'text/plain')
}

createServer(async (req, res) => {
	let uri = req.url.slice(1)
	let data = ''
	if (!uri.includes('.')) {
		uri = (uri || 'home')
		uri += '/content.html'
		const html = await getHtmlDoc(uri).catch(e => e)
		data = await interp(html).catch(e => e)
	} else if (uri.match(/\.(jpg)|(png)|(ico)$/)) {
		data = await fs.readFile(uri).catch(e => e)
	} else {
		data = await fs.readFile(uri, 'utf8').catch(e => e)
		if (data) {
			data = await interp(data)
		}
	}
	if (data instanceof Error) {
		console.log(data)
		res.statusCode = 404
		res.end('Not Found')
	} else {
		res.setHeader('Cache-Control', 'max-age=3600')
		res.setHeader('Content-Type', mime(uri))
		res.end(data)
	}
}).listen(3000)
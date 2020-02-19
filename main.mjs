import {createServer} from 'http'
import {promises as fs} from 'fs'
import {createReadStream} from 'fs'
import {extname, join, dirname} from 'path'
import {interp} from './interp/main.mjs'
import {URL} from 'url'

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
	const contentDir = join(root, 'content')
	uri = join(contentDir, uri)
	if (!uri.startsWith(contentDir)) {
		throw new Error('Ha!')
	}
	return uri
}

const serveStatic = async (uri, res) => {
	const mime = (mimeTypes[extname(uri).toLowerCase()] || 'text/plain')
	res.setHeader('Content-Type', mime)
	res.setHeader('Cache-Control', 'max-age=3600')
	if (uri.match(/\.(jpg)|(png)|(ico)|(pdf)$/)) {
		createReadStream(fname(uri)).pipe(res)
	} else {
		const raw = await fs.readFile(fname(uri), 'utf8').catch(e => e)
		const html = await interp(raw)
		res.end(html)
	}
}

createServer(async (req, res) => {
	let data = ''
	let uri = new URL(req.url, 'http://eybnutrition.com').pathname.slice(1)
	if (uri.includes('.')) {
		serveStatic(uri, res)
	} else {
		uri = (uri || 'home')
		uri += '/content.html'
		const html = await fs.readFile(fname(uri), 'utf8').catch(e => e)
		data = await interp(html).catch(e => e)
		if (data instanceof Error) {
			console.log(data)
			res.statusCode = 404
			res.end('Not Found')
		}
		res.setHeader('Content-Type', 'text/html')
		res.setHeader('Cache-Control', 'max-age=3600')
		res.end(data)
	}
}).listen(3000)
import { io } from 'socket.io-client'

export function initSocket() {
	let host = window.location.hostname
	let siteName = window.site_name || host
	// socketio_port is injected by Frappe bench via common_site_config.json;
	// fall back to 9000 (Frappe default) when running standalone without a bench.
	let socketio_port = window.socketio_port || 9000
	let port = window.location.port ? `:${socketio_port}` : ''
	let protocol = port ? 'http' : 'https'
	let url = `${protocol}://${host}${port}/${siteName}`

	// In dev mode without a Frappe backend, avoid flooding the console
	// with ERR_CONNECTION_REFUSED by not retrying the connection.
	const isDev = import.meta.env.DEV
	let socket = io(url, {
		withCredentials: true,
		reconnectionAttempts: isDev ? 0 : 5,
	})
	return socket
}


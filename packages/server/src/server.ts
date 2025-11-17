import app from './app'

const port = process.env.PORT ? parseInt(process.env.PORT) : 3002

app.listen(port, '0.0.0.0')

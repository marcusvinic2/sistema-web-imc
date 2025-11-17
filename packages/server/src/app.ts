import express from 'express'
import cors from 'cors'
import './database'
import routes from './routes'
import bodyParser from 'body-parser'

class App {
  public app: express.Application

  constructor() {
    this.app = express()
    this.app.use(cors())
    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.json({ limit: '8mb' }))
    this.app.use(bodyParser.urlencoded({ extended: false }))
  }

  routes() {
    this.app.use(routes)
  }
}

export default new App().app

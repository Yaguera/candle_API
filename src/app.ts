import express from 'express'
import logger from 'morgan'
import cors from 'cors'

export const app = express()
app.use(cors())
app.use(express.json())
app.use(logger('dev'))

import dotenv from 'dotenv'
dotenv.config()
import './workers/execute.worker'

console.log('Worker started')
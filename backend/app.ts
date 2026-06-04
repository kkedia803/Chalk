import express from 'express';
const app = express();
app.use(express.json())

import router from './routes/execute.route';

app.get('/health',(req,res)=>{
    res.status(200).json({message:'Server working fine'})
})

app.use('/', router)

export default app;
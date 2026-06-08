import { Request, Response } from "express";

import { addJob } from "../workers/execute.worker";

export const executeController = async(req:Request,res:Response) =>{
    const {language, code} = req.body;
    
    const output = await addJob(language, code)

    res.status(200).json({message:output})
}

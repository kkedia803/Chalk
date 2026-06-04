import { Request, Response } from "express";

import { executeService } from "../services/execute.service";

export const executeController = async(req:Request,res:Response) =>{
    const {language, code} = req.body;
    
    const output = await executeService(language, code)

    res.status(200).json({message:output})
}

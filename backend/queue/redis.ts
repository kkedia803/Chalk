import IOredis from "ioredis";

export const connection = new IOredis(process.env.REDIS_URL!,{
    maxRetriesPerRequest:null
})
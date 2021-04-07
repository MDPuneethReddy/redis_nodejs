import * as express from "express"
import * as cors from "cors"
import * as redis from "redis"
import * as util from "util"
import axios from "axios"
const app=express()
app.use(cors())
//create a redisClient
const redisClient=redis.createClient({
    host:"127.0.0.1",
    port:6379
})
// add promises for get and set requests of redisclient
const getAsync = util.promisify(redisClient.get).bind(redisClient);

app.get("/",(req:express.Request,res:express.Response)=>{
    res.send("welcome to API")
})
//add middlware
export const catchedData=async (req:express.Request,res:express.Response,next:express.NextFunction)=>{
    try{
        const cacheddata=await getAsync("users")
        if(cacheddata!==null){
        console.log("cacheddata")
        res.send({payload:JSON.parse(cacheddata)})
        }
        else{
            next()
        }
        
    }
    catch(error){
        res.send(error)
    }
    
}
app.get("/users",catchedData,async (req:express.Request,res:express.Response)=>{
    try{
        console.log("getting catched")
        const response= await axios.get("https://jsonplaceholder.typicode.com/users")
        redisClient.setex("users",10000,JSON.stringify(response.data))
        res.send({payload:response.data})
    }catch(err){
        console.log(err)
    }
})
app.listen(3000,()=>{
    console.log("running")
})
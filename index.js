const http = require("http");
const fs = require("fs");
const path = require("path");
const {MongoClient} = require("mongodb");

//Port number that server listens to
const PORT = 1597;

const getEventsData = async (client) =>{
 //Fetches records from given database
 const cursor = await client.db("EventsDatabase").collection("Events").find({});
 const results = cursor.toArray();
 return results;
}

http.createServer(async (req,res)=>{
    if(req.url === "/api"){
        const URL = "mongodb+srv://nallanikuladeepsai9999:Kuladeepsai@eventplannercluster.2sj3w.mongodb.net/?retryWrites=true&w=majority&appName=EventPlannerCluster";
        //Creating a new client for mongo database
        const client = new MongoClient(URL);

        try{
            //Connects to database
            await client.connect();
            console.log("Database connected successfully");
            const eventsData = await getEventsData(client);
            //Handling CORS error
            res.setHeader("Access-Control-Allow-Origin", '*');
            res.writeHead(200,{"content-type":"application/json"});
            console.log(JSON.stringify(eventsData));
            res.end(JSON.stringify(eventsData));
        }
        catch(error){
            console.log("Error connecting to database",error)
        }
        finally{
             //Closing connection to database
             await client.close();
             console.log("Database connection is closed");
        }
    }
    else{
        let contentType;
        const filePath = path.join(__dirname,"public",req.url==="/"?"index.html":req.url.slice(1));
        //Assigning content type based on file extension
        if(filePath.endsWith(".png")) contentType = "image/png";
        else if(filePath.endsWith(".jpeg") || filePath.endsWith(".jpg")) contentType = "image/jpeg";
        else contentType = "text/html";
        //Reads the given file from given location
        fs.readFile(filePath,(err,content)=>{
            if(err){
                if (err.code === "ENOENT") {
                    res.writeHead(404,{"content-type":"text/html"});
                    res.end("<h1>404 Page Not Found!</h1>");
                } else {
                    // Handle other errors
                    res.writeHead(500,{"content-type":"text/plain"});
                    res.end("Internal Server error");
                }
            }
            else{
                res.writeHead(200,{"content-type":contentType});
                res.end(content,"utf8");
            }
        })
    }
}).listen(PORT,()=>console.log(`Server is running on ${PORT}`))

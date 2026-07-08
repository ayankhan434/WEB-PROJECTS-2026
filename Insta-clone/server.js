require("dotenv").config();
const app=require("./src/app.js");
const connectToDataBase=require("./src/config/database.js");

connectToDataBase();

app.listen(3000,()=>{
    console.log("server is running on port 3000");
});
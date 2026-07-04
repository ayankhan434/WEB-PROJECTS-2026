require("dotenv").config();
const express=require("express");
const cors=require("cors");

const connectDB=require("./config/db.js");

console.log(process.env.MONGO_URI);
console.log(process.env.PORT);
console.log(process.env.MONGODB_URI);
connectDB();

const app=express();
app.use(cors());

app.get("/",(req,res)=>{
    res.send("API is running");
});

app.use('api/auth',require('./routes/authRoutes'));

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
});

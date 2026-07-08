const mongoose= require("mongoose");

async function connectToDataBase(){
    await mongoose.connect(process.env.MONGO_URI)

    console.log("connected to database");
}

module.exports=connectToDataBase;
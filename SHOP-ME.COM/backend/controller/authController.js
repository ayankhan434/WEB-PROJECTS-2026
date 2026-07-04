const user=require('../model/user.js');


// Register a new user

const registerUser=async(req,res)=>{
    const {name,email,password,role}=req.body;
    try{
        const existingUser=await user.findOne({email});
        if(existingUser){
            res.status(400).json({message:"User already exists"});
        }
       else {
            const newUser=await user.create({name,email,password,role});
            res.status(201).json({message:"User created successfully",user:newUser});
        }
    } catch (error) {
        res.status(500).json({message:"Error creating user",error});
    }
}
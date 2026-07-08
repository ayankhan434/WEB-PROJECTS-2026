const userModel=require("../models/user.model.js");
const crypto=require("crypto");
const jwt=require("jsonwebtoken");

 async function registerController(req,res){
    const {username,email,password,bio,profileImage}=req.body;

    const isUserAlreadyExist=await userModel.findOne({$or:[{username:username},{email:email}]});

    if(isUserAlreadyExist){
        return res.status(409).json({message:"user already exists"});
    }

    const hash =crypto.createHash("sha256").update(password).digest("hex");

    const user=await userModel.create({
        username:username,
        email:email,
        password:hash,
        bio:bio,
        profileImage:profileImage
    });

    const token=jwt.sign({
        id:user._id},
        process.env.JWT_SECRET,
        {expiresIn:"1h"});

        res.cookie("token",token)

           res.status(201).json({
            message:"user registered successfully",
            user:{
                username:user.username,
                email:user.email,
                bio:user.bio,
                profileImage:user.profileImage
            }
        })

    
}

async function loginController(req,res){
    const { username ,email,password}=req.body
     
    /** 
     * username
     * password
     * 
     * email
     * password
     * 
     */

    const user=await userModel.findOne({
        $or:[
            {
               //condition for username and password
               username:username,

            },
            {
               //condition for email and password
               email:email,
            }
        ]
    })

    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }

    const hash=crypto.createHash("sha256").update(password).digest("hex");
    const isPasswordMatch=hash===user.password;

    if(!isPasswordMatch){
        return res.status(401).json({
            message:"invalid password"
        })
    }

    const token=jwt.sign({
        id:user._id},
        process.env.JWT_SECRET,
        {expiresIn:"1h"

        });
    
    res.cookie("token",token)

    res.status(200).json({
        message:"user logged in successfully",
        user:{
            username:user.username,
            email:user.email,
            bio:user.bio,
            profileImage:user.profileImage
        }
    })
}


module.exports={
    registerController,
    loginController
}
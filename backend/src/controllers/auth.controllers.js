import User from '../models/users.models.js'
import bcrypt from 'bcryptjs'
import generateToken from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'

export const signup =  async (req,res)=>{
    const {fullName,password,email} = req.body
    if (!fullName || !password ||!email) {
     return res.status(400).json({message: "Veuillez remplir tous les champs"})   
    }
    try {
        if (password.length<6) {
            return res.status(400).json({message: "Le mot de passe doit comporter au moins 6 caractères"})
        }
        // confirming email
        const user = await User.findOne({email})

        if (user) { return res.status(400).json({message:"Cette adresse e-mail existe déjà, veuillez réessayer"})    
        }
    // password hashing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
    // creating a new user with hashed password
        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if (newUser) {
    //generate jwt webtoken 
            generateToken(newUser._id,res)
            await newUser.save()
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            })
            
        }else{
            res.status(400).json({message: 'Données utilisateur invalides'})
        }

    } catch (error) {
        console.log('error in signup controler',error.message);
        res.status(500).json({message:'internal server error'})
    }
}


export const login = async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        return res.status(400).json({message: "Veuillez remplir tous les champs"})
    }
    try {
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message:"Identifiants invalides"})
        }
        const isPasswordMatch = await bcrypt.compare(password,user.password)
        if (!isPasswordMatch) {
            res.status(400).json({message:"Identifiants invalides"})
        }
        generateToken(user._id,res)
        return res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        }) 

        
    } catch (error) {
        res.status(500).json({message:"internal server error",error})
    }
}


export const logout =  (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"L'utilisateur a été déconnecté avec succès"})
    } catch (error) {
       res.status(400).json({message:"error at logout controller",error}) 
    }
}


export const updateProfile = async(req,res)=>{
    try {
        const {profilePic}= req.body
        const userId = req.user._id
        if (!profilePic) {
            return res.status(404).json({message:'Une photo de profil est obligatoire'})
            
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(userId,{
            profilePic:uploadResponse.secure_url},
            {new:true}
        )
        res.status(200).json(updateUser)
    } catch (error) {
        console.log('error on the update profile controller');
        res.status(500).json({message:'internal server error'})
        
    }
}

export const checkAuth = (req,res) =>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log('error in check controller',error.message);
        res.status(500).json({message:'internal server error'})
        
    }
}


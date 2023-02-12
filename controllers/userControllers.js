import User  from "../models/userModel.js"
import bcrypt  from "bcrypt"
import  { confirmationAccount, sendForgotPassword } from "../middlewares/nodemailer.js";
import jwt  from "jsonwebtoken"
import { config } from 'dotenv'
import dayjs from "dayjs";

config()

export const addUser =  (req, res, next) => {
    const charactersPass = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatePassword = '';
    for (let i= 0; i < 6; i++) {
        generatePassword += charactersPass.charAt(Math.floor(Math.random() * charactersPass.length))
    }
    const plainPassword = generatePassword;
    bcrypt.hash(plainPassword, 10)
            .then(hash => {
                let user = new User({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName, 
                    email : req.body.email, 
                    password: hash,
                    role : req.body.role, 
                    building : req.body.building,
                    phone : req.body.phone, 
                    avatar : req.body.avatar
                })
                user.save()
                    .then(() => {
                        res.status(201).json({ message: 'User Created ' })
                        confirmationAccount(user.email, plainPassword)
                    })
                    .catch(error => res.status(400).json({ error }))
            })
            .catch(error => res.status(500).json({ error }))
}

export const login = (req, res, next) => {
    User.findOne({ email: req.body.email }) 
    .then(user => { 
        if (!user) { 
            return res.status(404).json({ error: 'User not found !' }); 
        } 
        if(user.isActive === false) {
            return res.status(401).json({ error: "You can't login ! You are disabled ! "}); 
        }
       bcrypt.compare(req.body.password, user.password) 
        .then(reslt => { 
            if (!reslt) { 
               return res.status(401).json({  error: 'Incorrect password !'});    
            }
            let debutContrat = user.createdAt
            let localDate = dayjs(new Date())
            let diifNowDebut = localDate.diff(debutContrat, 'months')
            let newSoldDays = 2 * diifNowDebut
            user.soldeDays = newSoldDays
            user.save()
            res.status(200).json({ 
                userId: user._id, 
                token: jwt.sign( 
                    { userId: user._id , role: user.role}, 
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '23h' }), 
                refreshToken: jwt.sign(
                    { userId: user._id , role: user.role}, 
                    process.env.REFRESH_TOKEN,
                    { expiresIn: '24h' }
                )   
            });  
            if(user.allDaysOff === 24) {
                console.log("you have finished your leave balance !")
                
            }     
        }) 
        .catch(error => res.status(400).json({ error }));       
    })
    .catch(error => res.status(500).json({ error }));   
}

export const forgotPassword =  async ( req, res) => {
    const {email} = req.body;
    try {
        const oldUser = await User.findOne({email})
        if (!oldUser) {
            return res.status(404).send("User not exist")
        }
        const secret = process.env.ACCESS_TOKEN + oldUser.password
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id}, secret,
            { expiresIn: '24h' });
        sendForgotPassword(oldUser.email, oldUser._id, token)
        res.status(200).json({ message: 'Please check your email for reset your password!'})
    } catch (error) {
        res.status(500).json({ error }); 
    }
}

export const resetPassword = async (req, res) => {
    const {id, token} = req.params;
    const {password} = req.body;
    const oldUser = await User.findOne({_id: id})
    if(!oldUser) {
        return res.status(404).json({error: 'User not found'})
    }
    const secret = process.env.ACCESS_TOKEN + oldUser.password
    try {
        const verify = jwt.verify(token , secret);
        const encryptedPassword = await bcrypt.hash(password, 10)
        await User.updateOne(
            {_id: id},
            {$set : {
                password: encryptedPassword
                }
            }
        )
        res.status(200).json({message: "password updated"})
    } catch (error) {
        res.status(500).json({message: "somthing went wrong!"})
        }
}

export const disableUser = async (req, res, next) => {
    const { id } = req.params
    User.findOne({ _id: id })
        .then(user => {
            if(!user) return res.status(400).json({ error: 'Code is wrong ! ' });
            user.isActive = false;
            user.save();
            res.status(200).json({ message: 'The account is successfully disactivated' });
        })
        .catch(error => res.status(403).json({ error: 'acces denieted !' }));
}


export const getUsers = (req, res, next) => {
    User.find({}, '-password' , (err, results) => {
        err ? res.send(err) : res.send(results)
    });
}


export const getUserById = (req, res) => {
    User.find({ _id: req.params.id }, '-password' ,(err, result) => {
        if (!err) {
            res.send(result);
        }
    });
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: `${user.lastName} ${user.firstName} is succussffully deleted` });
    }
    catch (err) {
        res.status(404).send({ error: `error deleting user ${err} . Not found !` })
        }
   
}

export const deleteAllUsers = async (req, res) => {
    try {
        const users = await User.deleteMany( {'role': {$nin:["Super Admin"]}});
        res.status(200).send({ message: `succussffully deleted exepted the super admin` });
    }
    catch (err) {
        res.status(400).send({ error: `error deleting users ${err}` })
        }
}

export const updateUser = async (req, res) => { 
    try{ 
        const token = req.headers.authorization.split(' ')[1]; 
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET'); 
        if(decodedToken.role !== "Super Admin"){
        const user= await User.findByIdAndUpdate(req.params.id,{
        firstName : req.body.firstName,
        LastName : req.body.LastName,
        phone : req.body.phone 
        }) 
        await user.save();
        res.status(200).send(user);
        }
        else {
        const user= await User.findByIdAndUpdate(req.params.id, req.body)
        await user.save();
        res.status(200).send(user);
        }
    }
    catch (err) {    
     res.status(404).send(err)
    }
     
  }
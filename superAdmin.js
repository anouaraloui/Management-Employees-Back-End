import { connectDB } from "./configuration/connectMongodb.js";
import User from "./models/userModel.js";
import bcrypt from "bcrypt";
import { confirmationAccount } from "./middlewares/nodemailer.js";
import data from './superAdmin.json' assert { type: "json" }

connectDB ()

const charactersPass = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatePassword = '';
    for (let i= 0; i < 6; i++) {
        generatePassword += charactersPass.charAt(Math.floor(Math.random() * charactersPass.length))
    }
const plainPassword = generatePassword;

const query = User.findOne({ 'role' : 'Super Admin' });
query.select('role')
query.exec( (err, res, next) => {
    if(err) res.status(500).json({ err })
    else {
        if (res) {
            console.log('Super admin is already exist!');
            return process.exit()
        } else {
            bcrypt.hash(plainPassword, 10)
            .then((hashedPassword) => {
                const user = new User({...data, password: hashedPassword})
                user.isActive = true
                user.save()
                confirmationAccount(user.email, plainPassword)
                console.log('Super Admin is created');
            })
            .catch((err) => console.log(err))
        }
    }
})


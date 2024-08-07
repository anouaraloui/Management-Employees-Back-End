import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { confirmationAccount, sendForgotPassword, resetPasswordEmail } from "../middlewares/nodemailer.js";
import jwt from "jsonwebtoken";
import { config } from 'dotenv';
config();


export const addUser = (req, res, next) => {
    const charactersPass = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let generatePassword = '';
    for (let i = 0; i < 6; i++) {
        generatePassword += charactersPass.charAt(Math.floor(Math.random() * charactersPass.length))
    };
    const plainPassword = generatePassword;
    const {firstName, lastName, email,  role, building, phone, profile} = req.body
    bcrypt.hash(plainPassword, 10)
        .then(hash => {
            let user = new User({
                firstName,
                lastName,
                email,
                password: hash,
                role,
                building,
                phone,
                profile: profile || '',
            })
            user.save()
                .then(() => {
                    res.status(201).json({ message: 'User Created ', user })
                    confirmationAccount(user.email, plainPassword)
                })
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};

export const login = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'User not found !' });
            };
            if (user.isActive === false) {
                return res.status(401).json({ error: "You can't login ! You are disabled ! " });
            };
            bcrypt.compare(req.body.password, user.password)
                .then(reslt => {
                    if (!reslt) {
                        return res.status(401).json({ error: 'Incorrect password !' });
                    };
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id, role: user.role },
                            process.env.ACCESS_TOKEN,
                            { expiresIn: '23h' }),
                        refreshToken: jwt.sign(
                            { userId: user._id, role: user.role },
                            process.env.REFRESH_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                    if (user.allDaysOff === 24) {
                        console.log("you have finished your leave balance !")

                    };
                })
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const oldUser = await User.findOne({ email })
        if (!oldUser) {
            return res.status(404).json({ error: "User not exist" })
        }
        const secret = process.env.ACCESS_TOKEN + oldUser.password
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret,
            { expiresIn: '24h' });
        sendForgotPassword(oldUser.email, oldUser._id, token)
        res.status(200).json({ message: 'Please check your email for reset your password!' })
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const resetPassword = async (req, res) => {
    const { password, token } = req.body;
    try {
        const decodedToken = jwt.decode(token)
        const userId = decodedToken.id
        const oldUser = await User.findOne({ _id: userId })
        if (!oldUser) {
            return res.status(404).json({ error: 'User not found' })
        }
        const encryptedPassword = await bcrypt.hash(password, 10)
        await User.updateOne(
            { _id: userId },
            {
                $set: {
                    password: encryptedPassword
                }
            }
        )
        resetPasswordEmail(oldUser.email, password)
        res.status(200).json({ message: "Password updated" })
    } catch (error) {
        res.status(500).json({ message: "Somthing went wrong!" })
    }
};

export const toggleEnableUser = async (req, res, next) => {
    const { id } = req.params
    User.findOne({ _id: id })
        .then(user => {
            if (!user) return res.status(400).json({ error: 'Code is wrong ! ' });
            user.isActive ? user.isActive = false : user.isActive = true
            user.save();
            res.status(200).json({ message: 'Successful operation' });
        })
        .catch(error => res.status(403).json({ message: 'acces denieted !' }));
};


export const getUsers = async (req, res) => {
    let { page, limit, sortBy, createdAt, createdAtBefore, createdAtAfter } = req.query
    if (!page) return page = 1
    if (!limit) return limit = 30
    const skip = (page - 1) * limit    
    const users = await User.find()
        .sort({ [sortBy]: createdAt })
        .skip(skip)
        .limit(limit)
        .where('createdAt').lt(createdAtBefore).gt(createdAtAfter)
        .select('-password')
    const count = await User.count()
    if (users) return res.status(201).json({ page: page, limit: limit, totalUsers: count, users: users })
    else  return res.status(404).json({message : "Users not found !"})   
};


export const getUserById = (req, res) => {
    User.find({ _id: req.params.id }, (err, result) => {
        if (!err) {
            res.status(201).json(result);
        } else return res.status(400).json({ message: 'Bad request' })
    }).select('-password');
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: `${user.lastName} ${user.firstName} is successfully deleted` });
    }
    catch (err) {
        res.status(404).json({ error: `error deleting user ${err} . Not found !` })
    }
};


export const updateUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
        if (decodedToken.role !== "Super Admin") {
            const user = await User.findByIdAndUpdate(req.params.id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                profile: req.body.profile || ''
            })
            await user.save();
            return res.status(200).json({ message: 'User Updated ', user });            
        }
        else {
            const user = await User.findByIdAndUpdate(req.params.id, req.body)
            await user.save();
            return res.status(200).json({ message: 'User Updated ', user });
        }
    }
    catch (err) {
        res.status(400).json(err)
    }
};
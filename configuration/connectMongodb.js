import mongoose from 'mongoose';

const urlCompass = "mongodb://localhost:27017/employeesManagement"
mongoose.set('strictQuery', true)
export const connectDB = () => {
mongoose.connect(urlCompass)
    .then(() =>
        console.log("successful connexion DB"));    
};

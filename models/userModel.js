import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { config } from "dotenv";
config()

const Schema = mongoose.Schema;

let userSchema = new Schema(
    {
        firstName: { 
        type: String,
        required: true
        },
        lastName: { 
        type: String,
        required: true
        },
        email: { 
            type: String,
            required: true,
            unique: true        
        },
        password: { 
            type: String,
            required: true
        },
        role: { 
            type: String, 
            enum:['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Engineer'],
            default: 'Software Engineer',
            required: true
        },
        building: { 
            type: [String], 
            enum:['Front-End','Back-End','Full-Stack'], 
            default: null, 
            required: true
        },
        phone: { 
            type: String, 
            default: "0000",
            required: true 
        },
        profile: { 
            type: String,
            required: false ,
            
        },
        isActive: { 
            type: Boolean, 
            default: true
        },
        activationCode: String,
        balanceDays : { 
            type: Number, 
            default: process.env.balanceDaysByMonth
        },
        allDaysOff : { 
            type: Number, 
            default: 0
        },
        daysOffSick : { 
            type: Number, 
            default: 0
        }
        

    }, {
        timestamps: { currentTime: () => Date.now() },versionKey: false }
);

userSchema.plugin(uniqueValidator)

let User = mongoose.model("users", userSchema);


export default User;
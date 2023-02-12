import mongoose from 'mongoose';
import validator from 'validator';
import uniqueValidator from 'mongoose-unique-validator';
import { config } from "dotenv";
config()

const Schema = mongoose.Schema;

let userSchema = new Schema(
    {
        firstName: { 
        type: String,
        required: true,
        validate: {
            validator: function (val) {
              return validator.isLength(val, { min: 3, max: 25 });
            }
        },
        trim: true, 
        text: true
        },
        lastName: { 
        type: String,
        required: true,
        validate: {
            validator: function (val) {
              return validator.isLength(val, { min: 3, max: 25 });
            }
        },
        trim: true,
        text: true
         },
        email: { 
            type: String,
            required: true,
            unique: true,
            trim: true,
            text: true,
            lowercase: true,
            validate: validator.isEmail,
            validate: {
                validator: function (val) {
                  return validator.isLength(val, { min: 3, max: 30 });
                }
            },        
        },
        password: { 
            type: String,
            required: true,
            minlength: 8,
            validate: validator.isStrongPassword
        },
        role: { 
            type: String, 
            enum:['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Engineer'],
            default: 'Software Engineer',
            required: true,
            trim: true,
            text: true
        },
        building: { 
            type: [String], 
            enum:['Front-End','Back-End','Full-Stack'], 
            default: null, 
            required: true,
            text: true
        },
        phone: { 
            type: String, 
            default: "0000",
            required: true 
        },
        avatar: { 
            type: String, 
            required: false 
        },
        isActive: { 
            type: Boolean, 
            default: true 
        },
        activationCode: String,
        soldeDays : { 
            type: Number, 
            default: process.env.soldeDaysByMonth
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
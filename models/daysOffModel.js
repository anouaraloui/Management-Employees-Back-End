import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import validator from 'validator';

const Schema = mongoose.Schema;

let daysOffSchema = new Schema(
    {
        userId: {
                type: mongoose.Schema.Types.ObjectId, 
                ref:'User', required: true
            },
        startDay : {
                    type: Date,
                    required: true,
                    validate : validator.isDate 
                },
        endDay : {
                type: Date,
                required: true,
                validate : validator.isDate
            },
        type: {
                type: String,
                enum:["Paid", "Unpaid","Sick"],
                required: true,
                trim: true,
                Text: true
            },
            decisionDirector: {
                userIdDir: { type: mongoose.Schema.Types.ObjectId, ref:'User'},
                Status: {type: Boolean, default: null},
                JustificationDir: {type: String , default: null}
                },
            decisionManager:{
                userIdMan: {type: mongoose.Schema.Types.ObjectId,ref:'User'}, 
                Status: {type: Boolean, default: null},
                JustificationMan: {type: String , default: null}
                },
        statusReq: {
            type: Boolean,
            default:false
        },
        statusDecision: {
            type: Boolean,
            default:false
        },
        reqDayOff : { 
            type: Number, 
            default: 0
        },
        JustificationSick : {
            type: String 
        }

    }, {timestamps: { currentTime: () => Date.now() },versionKey: false }
);

daysOffSchema.plugin(uniqueValidator)

let daysOff = mongoose.model("daysOff", daysOffSchema);


export default daysOff;
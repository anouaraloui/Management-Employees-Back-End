import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const Schema = mongoose.Schema;

let daysOffSchema = new Schema(
    {
        userId: {
                type: mongoose.Schema.Types.ObjectId, 
                ref:'User', 
                required: true
            },
        startDay : {
                    type: Date,
                    required: true
                },
        endDay : {
                type: Date,
                required: true
            },
        type: {
                type: String,
                enum:["Paid", "Unpaid","Sick"],
                required: true
            },
            decisionDirector: {
                userIdDir: { type: mongoose.Schema.Types.ObjectId, ref:'User'},
                status: {type: Boolean, default: null},
                justification: {type: String , default: null}
                },
            decisionManager:{
                userIdMan: {type: mongoose.Schema.Types.ObjectId,ref:'User'}, 
                status: {type: Boolean, default: null},
                justification: {type: String , default: null}
                },
        statusReq: {
            type: Boolean,
            default: null
        },
        statusDecision: {
            type: Boolean,
            default: false
        },
        reqDayOff : { 
            type: Number, 
            default: 0
        },
        justificationSick : {
            type: String 
        }

    }, {timestamps: { currentTime: () => Date.now() },versionKey: false }
);

daysOffSchema.plugin(uniqueValidator)

let daysOff = mongoose.model("daysOff", daysOffSchema);


export default daysOff;
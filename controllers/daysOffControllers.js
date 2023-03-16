import User from "../models/userModel.js"
import daysOff from "../models/daysOffModel.js"
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { config } from "dotenv";
config()


// Add new request
export const addDaysOff = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId
    try {
        let newDaysOff = new daysOff({
            userId: userId,
            startDay: req.body.startDay,
            endDay: req.body.endDay,
            type: req.body.type,
            justificationSick: req.body.justificationSick
        });
        let startDay = dayjs(newDaysOff.startDay)
        let endDay = dayjs(newDaysOff.endDay)
        let reqDay = endDay.diff(startDay, 'days')
        if (reqDay > process.env.maxDaysByMonth) {
            return res.status(400).json({ message: "maximum 10 days" })
        }
        newDaysOff.reqDayOff = reqDay
        await newDaysOff.save();
        return res.status(200).json({ message: `your request is succussffully added and the id of it ${newDaysOff._id} `, newDaysOff });
    }
    catch (err) {
        res.status(401).json({ error: `error adding new Days Off ${err}` })
    }
}

// Display all request
export const getDaysOff = async (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userReqId = decodedToken.userId;
    const verifyUser = daysOff.userId = userReqId

    let { page, limit, sortBy, createdAt, createdAtBefore, createdAtAfter } = req.query
    if (!page) page = 1
    if (!limit) limit = 30
    const skip = (page - 1) * limit
    const daysOffList = await daysOff.find({ userId: verifyUser })
        .sort({ [sortBy]: createdAt })
        .skip(skip)
        .limit(limit)
        .where('createdAt').lt(createdAtBefore).gt(createdAtAfter)
    const count = await daysOff.count()
    res.send({ page: page, limit: limit, totalDaysOff: count, daysOff: daysOffList })
}

// Display one request
export const getDaysOffById = (req, res) => {
    daysOff.find({ _id: req.params.id }, (err, result) => {
        if (!err) {
            res.send(result);
        }
    });
}

// Delete one request
export const deleteDaysOff = async (req, res) => {
    const { id } = req.params;
    try {
        const dayoff = await daysOff.findOne({ _id: id })
        if (!dayoff) {
            return res.status(404).json({ error: `Request not found or you are disabled now! ` })
        }
        if (dayoff.statusDecision === true) {
            return res.status(400).json({ error: `you can not remove this request!` })
        }
        const dayoffDel = await daysOff.findOneAndDelete({ _id: req.params.id })
        res.status(200).json({ message: `${dayoffDel.id} is succussffully deleted` })
    }
    catch (err) {
        res.status(500).json({ message: "error deleting!" })
    }
};

// Delete all request
export const deleteAllDaysOff = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
        const userReqId = decodedToken.userId;
        const verifyUser = daysOff.userId = userReqId
        const dayoff = daysOff.find({ userId: verifyUser })
        if (!dayoff) {
            return res.status(404).json({ error: `Requests not found or you are disabled now! ` })
        }
        if (dayoff.statusDecision === true) {
            return res.status(401).json({ error: "you can not remove all request!" })
        }
        else {
            await daysOff.deleteMany(dayoff)
        }
        return res.status(200).json({ message: " All daysOff are succussffully deleted" })
    }
    catch (err) {
        res.status(500).json({ message: "error deleting!" })
    }
};

// Update request
export const updateDaysOff = async (req, res) => {
    if (!req.body) {
        return res.status(503).json({ message: `Day off can not update, be empty!` })
    }
    const { id } = req.params;
    daysOff.findOne({ _id: id })
        .then(dayoff => {
            if (!dayoff) {
                return res.status(404).json({ error: 'Request not found !' });
            }

            if (dayoff.statusDecision === true) {
                return res.status(503).json({ error: `you can't update this request` })
            }
        });

    try {
        const daysOffs = await daysOff.findByIdAndUpdate(req.params.id, req.body);
        let startDay = dayjs(daysOffs.startDay)
        let endDay = dayjs(daysOffs.endDay)
        let reqDay = endDay.diff(startDay, 'days')
        if (reqDay > process.env.maxDaysByMonth) {
            return res.status(201).json({ message: "maximum 10 days" })
        }
        daysOffs.reqDayOff = reqDay
        await daysOffs.save()
        res.status(200).json({ message: `${daysOffs.id} is succussffully updated` });
    }
    catch (error) {
        res.status(500).json({ err: `err` });
    }

}

// Decision of request 
export const daysOffDecision = async (req, res, next) => {
    const { id } = req.params
    const idReq = await daysOff.findOne({ _id: id })
    if (!idReq) {
        return res.status(404).json({ error: 'Request not found' })
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
        const userId = decodedToken.userId;
        if (decodedToken.role === "Director") {
            await daysOff.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        "decisionDirector.userIdDir": userId,
                        "decisionDirector.status": req.body.status,
                        "decisionDirector.justification": req.body.justification
                    }
                }
            )
        }
        if (decodedToken.role === "Team Manager") {
            await daysOff.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        "decisionManager.userIdMan": userId,
                        "decisionManager.status": req.body.status,
                        "decisionManager.justification": req.body.justification
                    }
                }
            )
        }
        await daysOff.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    "statusDecision": true
                }
            }
        )
        res.status(200).json({ message: `user with id = ${userId} ,your answer is succussffully send` });
        next()
    }
    catch (err) {
        return res.status(503).json({ error: `error send answer of this Days Off ${err}` })
    }
}


//the status of request Accepted or Declined
export const statusReq = async (req, res) => {
    const { id } = req.params
    const idReq = await daysOff.findOne({ _id: id })
    const idUser = idReq.userId
    let user = await User.findOne({ _id: idUser })
    let oldSoldDays = user.soldeDays
    let statusMan = idReq.decisionManager.status
    let statusDir = idReq.decisionDirector.status
    let reqDays = idReq.reqDayOff
    let oldSoldSick = user.daysOffSick
    if (statusDir && statusMan === true) {
        await daysOff.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    "statusReq": true
                }
            }
        )
        if (idReq.justificationSick != null && user.daysOffSick < process.env.soldDaysOffSick) {
            await daysOff.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        "type": `Sick`
                    }
                }
            )
            await User.findByIdAndUpdate(
                { _id: idUser },
                {
                    $set: {
                        "daysOffSick": oldSoldSick + reqDays

                    }
                }
            )
        }
        let allDaysOff = user.allDaysOff + reqDays
        let diffSick = idReq.type
        if ((allDaysOff > process.env.soldDaysByYear) && (diffSick != 'Sick')) {
            await daysOff.findByIdAndUpdate(
                { _id: id },
                {
                    $set: {
                        "type": `Unpaid`,
                        "allDaysOff": allDaysOff
                    }
                }
            )
        }
        
        let newSoldDays = oldSoldDays - reqDays
        await User.findByIdAndUpdate(
            { _id: idUser },
            {
                $set: {
                    "soldeDays": newSoldDays
                }
            }
        )
    }
}
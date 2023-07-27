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
            return res.status(400).json({ error: "maximum 10 days" })
        }
        newDaysOff.reqDayOff = reqDay
        await newDaysOff.save();
        return res.status(200).json({ message: 'your request is succussffully added ', newDaysOff });
    }
    catch (err) {
        res.status(401).json({ error: `error adding new Days Off ${err}` })
    }
}

// Display all request
export const getDaysOff = async (req, res, next) => {



    let { page, limit, sortBy, createdAt, createdAtBefore, createdAtAfter } = req.query
    if (!page) page = 1
    if (!limit) limit = 30
    const skip = (page - 1) * limit
    const daysOffList = await daysOff.find()
        .sort({ [sortBy]: createdAt })
        .skip(skip)
        .limit(limit)
        .where('createdAt').lt(createdAtBefore).gt(createdAtAfter)
    const count = await daysOff.count()
    res.send({ page: page, limit: limit, totalDaysOff: count, daysOff: daysOffList })
}

// Display one request
export const getDaysOffById = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userReqId = decodedToken.userId;
    const verifyUser = daysOff.userId = userReqId
    daysOff.find({ userId: verifyUser }, (err, result) => {
        if (!err) {
            res.status(201).json(result);
        } else return res.status(400).json({ message: 'Bad request' })
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
        else if (dayoff.statusDecision && !dayoff.statusReq) return res.status(400).json({ error: `you can not remove this request!` })
        else if (!dayoff.statusDecision || dayoff.statusDecision && dayoff.statusReq != null) {
            await daysOff.findByIdAndDelete({ _id: id })
                .then(() => {
                    return res.status(200).json({ message: " The Request are succussffully deleted" })
                })
        }
        
    }
    catch (err) {
        res.status(500).json({ err: "error deleting!" })
    }
};

// Delete all request
export const deleteAllDaysOff = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
        const userReqId = decodedToken.userId;
        const verifyUser = daysOff.userId = userReqId
        const dayoff = await daysOff.find({ userId: verifyUser })
        if (!dayoff) {
            return res.status(404).json({ error: `Requests not found or you are disabled now! ` })
        }
        const statusDec = dayoff.map((statusDec) => statusDec.statusDecision);
        const statusReq = dayoff.map((statusReq) => statusReq.statusReq);
        const decision = true
        if (!statusDec.includes(decision)) {
            await daysOff.deleteMany({ userId: verifyUser })
            return res.status(200).json({ message: " All Request are succussffully deleted" })

        }
        else if (statusDec.includes(decision)) {
            if (statusReq.includes(null)) return res.status(400).json({ message: 'Can not delete all request' })
            else {
                await daysOff.deleteMany({ userId: verifyUser })
                return res.status(200).json({ message: " All Request are succussffully deleted" })
            }

        }
    }
    catch (err) {
        return res.status(500).json({ message: "error deleting!" })
    }
};

// Update request
export const updateDaysOff = async (req, res) => {
    if (!req.body) {
        return res.status(403).json({ message: `Day off can not update, be empty!` })
    }
    const { id } = req.params;
    daysOff.findOne({ _id: id })
        .then(async (dayoff) => {
            if (!dayoff) {
                return res.status(404).json({ error: 'Request not found !' });
            }

            if (dayoff.statusDecision === true) {
                return res.status(403).json({ error: `you can't update this request` })
            }
            else try {
                await daysOff.findById(req.params.id)
                    .then(async (dayoffs) => {
                        let startDay = dayjs(req.body.startDay)
                        let endDay = dayjs(req.body.endDay)
                        let reqDay = endDay.diff(startDay, 'days')
                        if (reqDay > process.env.maxDaysByMonth) {
                            return res.status(201).json({ message: "maximum 10 days" })
                        }
                        else {
                            await daysOff.findByIdAndUpdate({
                                _id: req.params.id
                            }, {
                                $set: {
                                    "startDay": req.body.startDay,
                                    "endDay": req.body.endDay,
                                    "justificationSick": req.body.justificationSick,
                                    "type": req.body.type,
                                    "reqDayOff": reqDay
                                },
                            })
                            await dayoffs.save()
                            return res.status(200).json({ message: `${dayoffs.id} is succussffully updated` });
                        }
                    })
            }
            catch (error) {
                return res.status(403).json({ error: `err` });
            }
        });
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
        res.status(200).json({ message: `Your answer is succussffully send` });
        return next()
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
        if (idReq.justificationSick != null) {
            const daysSick = oldSoldSick + reqDays
            if (daysSick <= process.env.soldDaysOffSick) {
                await User.findByIdAndUpdate(
                    { _id: idUser },
                    {
                        $set: {
                            "daysOffSick": oldSoldSick + reqDays

                        }
                    }
                )
                await daysOff.findByIdAndUpdate(
                    { _id: id },
                    {
                        $set: {
                            "type": `Sick`
                        }
                    }
                )

            } else {
                await daysOff.findByIdAndUpdate(
                    { _id: id },
                    {
                        $set: {
                            "type": `Unpaid`
                        }
                    }
                )
                await User.findByIdAndUpdate(
                    { _id: idUser },
                    {
                        $set: {
                            "allDaysOff": daysSick - process.env.soldDaysOffSick,

                        }
                    }
                )

            }

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
                    "soldeDays": newSoldDays,
                    'allDaysOff': allDaysOff
                }
            }
        )
    }

    else if ((statusDir === false && statusMan === false) || (statusDir === true && statusMan === false) || (statusDir === false && statusMan === true)) {
        await daysOff.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    "statusReq": false
                }
            }
        )
    }
}
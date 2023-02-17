import  express  from "express";
import { addDaysOff, daysOffDecision, deleteAllDaysOff, deleteDaysOff, getDaysOff, getDaysOffById, statusReq, updateDaysOff } from "../controllers/daysOffControllers.js";
import { isAuth } from "../middlewares/auth.js"
import { checkRole } from "../middlewares/checkRole.js";
import  validorId  from "../middlewares/validatorId.js"
import { validateRequestDaysOff, validateRequestDecision } from "../middlewares/validatorRequest.js";

const router = express.Router();

// Route for added a new request days off
router.post("/daysOff", isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next),
validateRequestDaysOff, addDaysOff)

// Route for the display all request of days off
router.get('/daysOff', isAuth, (req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next),
getDaysOff)

// route for displaying the information of a request of days off whose identifier is known
router.get('/daysOff/:id', isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next),
validorId ,getDaysOffById)

// Route for deletion of a well-defined request of days off
router.delete("/delete/:id", isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next),
validorId ,deleteDaysOff)

// Route for delete all request of days off
router.delete("/deleteAll", isAuth,(req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next),
deleteAllDaysOff)

// Updating a request of days off for which the identifier is known
router.put("/daysOff/:id", isAuth, (req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next),
validorId ,updateDaysOff)

// Route for decision of days off
router.put('/daysOff/decision/:id', isAuth,(req, res, next)=> checkRole(['Director','Team Manager'], req, res, next), 
validorId, validateRequestDecision, daysOffDecision, statusReq)


export default router;

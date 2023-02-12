import  express  from "express";
import  {addUser, deleteAllUsers, deleteUser, disableUser, forgotPassword, getUserById, getUsers, login, resetPassword, updateUser}  from "../controllers/userControllers.js"
import {isAuth} from "../middlewares/auth.js"
import { checkRole } from "../middlewares/checkRole.js";
import validorId from "../middlewares/validatorId.js"
const router = express.Router();


// Route for login
router.post('/users/login', login)

// Route for forgot password
router.post('/users/forgetPassword', forgotPassword)

// Route for reset the password
router.post('/users/requestPasswordReset/:id/:token' , validorId, resetPassword)

// Route for added a new user
router.post('/users/createNewUser', isAuth, (req, res, next)=> checkRole(["Super Admin"], req, res, next),
addUser) 

// Disable User
router.post( '/disableUser/:id',isAuth,(req, res, next)=> checkRole(['Super Admin'], req, res, next), 
validorId, disableUser );

// Route for the display all users
router.get('/users', isAuth, (req, res, next)=> checkRole(["Super Admin"], req, res, next), 
getUsers)

// route for displaying the information of a user whose identifier is known
router.get('/users/:id', isAuth, (req, res, next)=> checkRole(["Super Admin"], req, res, next), 
validorId, getUserById)                      

// Route for deletion of a well-defined user
router.delete('/users/delete/:id',isAuth,(req, res, next)=> checkRole(["Super Admin"], req, res, next),
validorId, deleteUser)

// Route for delete all users
router.delete('/users/deleteAll', isAuth,(req, res, next)=> checkRole(["Super Admin"], req, res, next),
deleteAllUsers)

// Updating a user for which the identifier is known
router.put('/users/update/:id', isAuth, (req, res, next)=> checkRole(['Super Admin','Director', 'Administration Director', 'Administration Assistant', 'Team Manager', 'Software Enginner'], req, res, next), 
validorId,updateUser)


export default router;
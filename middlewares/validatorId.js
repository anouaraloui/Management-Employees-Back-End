import mongoose from 'mongoose'

 const validatorId = (req,res,next) =>{
   if (!mongoose.Types.ObjectId.isValid(req.params.id)) { //isvalid function for checking if id is an object id or not
    return res.status(400).json({ message:"invalid id" })
   }
   next();
}

export default validatorId;
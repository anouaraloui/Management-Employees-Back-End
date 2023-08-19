import express, { json } from 'express'
import { config } from 'dotenv'
import { connectDB } from "./configuration/connectMongodb.js"
import userRoutes from "./routes/userRoutes.js"
import dayOffRoutes from "./routes/daysOffRoutes.js"
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "./swagger.json" assert { type: "json" }
import cors from 'cors'
import User from './models/userModel.js'
import dayjs from 'dayjs'

const app = express()

app.use(express.json({ limit: '9999999mb' }))
app.use(express.urlencoded({ limit: '9999999mb', extended: true }))
app.use(json())

app.use(cors())

config()
connectDB()
app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(userRoutes)
app.use(dayOffRoutes)

const balanceOffDays = async () => {
  await User.find({}).then(created => created.forEach(async (user) => {
    let localDate = dayjs(new Date())
    let diffMonths = localDate.diff(user.createdAt, 'months');
    let newBalance = diffMonths * 2;
    const id = user._id
    await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          "balanceDays": newBalance
        }
      }
    )
  }))
}
balanceOffDays()

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`server is running on: http://localhost:${port}`))
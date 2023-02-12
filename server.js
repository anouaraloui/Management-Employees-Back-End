import express, { json } from 'express'
import { config } from 'dotenv'
import { connectDB } from "./configuration/connectMongodb.js"
import  userRoutes  from "./routes/userRoutes.js"
import dayOffRoutes from "./routes/daysOffRoutes.js"
import  swaggerUi  from "swagger-ui-express"
import swaggerDocument from "./swagger.json" assert { type: "json" }
const app = express()
app.use(json())
config()
connectDB()

app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(userRoutes)
app.use(dayOffRoutes)


const port = process.env.PORT || 5000
app.listen(port, () => console.log(`server is running on: http://localhost:${port}`))
import express, { json } from 'express'
import { config } from 'dotenv'
import { connectDB } from "./configuration/connectMongodb.js"
import  userRoutes  from "./routes/userRoutes.js"
import dayOffRoutes from "./routes/daysOffRoutes.js"
import  swaggerUi  from "swagger-ui-express"
import swaggerDocument from "./swagger.json" assert { type: "json" }
import cors from 'cors'
import bodyParser from 'body-parser'
const app = express()

// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json({limit: '9999999mb'}))
app.use(express.urlencoded({limit: '9999999mb', extended: true}))
app.use(json())

app.use(cors())

config()
connectDB()
app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(userRoutes)
app.use(dayOffRoutes)


const port = process.env.PORT || 5000
app.listen(port, () => console.log(`server is running on: http://localhost:${port}`))
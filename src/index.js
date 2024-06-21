const express = require('express')
const app = express()
const { PORT, CLIENT_URL } = require('./constants')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const cors = require('cors')

//import passport middleware
require('./middlewares/passport-middleware')

// Middleware to serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));


//initialize middlewares
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://projectx-rho-ashen.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(passport.initialize())

//import routes
const authRoutes = require('./routes/auth')
const carRoutes = require('./routes/car');
const bookingRoutes = require('./routes/booking');
const packageRoutes = require('./routes/subpackages');
const userSubRoutes = require('./routes/userSubscription');
const financialRoutes = require('./routes/financial');
const incidentRoutes = require('./routes/incidentReport');
const tollRoutes = require('./routes/tollReport');
const journeyRoutes = require('./routes/journeyUpdate');



//initialize routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/car', carRoutes)
app.use('/api/v1/booking', bookingRoutes)
app.use('/api/v1/packages', packageRoutes)
app.use('/api/v1/userSub', userSubRoutes)
app.use('/api/v1/financial', financialRoutes)
app.use('/api/v1/incident', incidentRoutes)
app.use('/api/v1/toll', tollRoutes)
app.use('/api/v1/journey', journeyRoutes)

//app start
const appStart = () => {
  try {
    app.listen(PORT, () => {
      console.log(`The app is running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.log(`Error: ${error.message}`)
  }
}

appStart()

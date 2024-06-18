const express = require('express')
const app = express()
const { PORT, CLIENT_URL } = require('./constants')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const cors = require('cors')

//import passport middleware
require('./src/middlewares/passport-middleware')

// Middleware to serve static files from the uploads directory
app.use('./src/uploads', express.static('uploads'));


//initialize middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(passport.initialize())

//import routes
const authRoutes = require('./src/routes/auth')
const carRoutes = require('./src/routes/car');
const bookingRoutes = require('./src/routes/booking');
const packageRoutes = require('./src/routes/subpackages');
const userSubRoutes = require('./src/routes/userSubscription');
const financialRoutes = require('./src/routes/financial');
const incidentRoutes = require('./src/routes/incidentReport');
const tollRoutes = require('./src/routes/tollReport');
const journeyRoutes = require('./src/routes/journeyUpdate');



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

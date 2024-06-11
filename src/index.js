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
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(passport.initialize())

//import routes
const authRoutes = require('./routes/auth')
const fileRoutes = require('./routes/test');
const carRoutes = require('./routes/car');
const bookingRoutes = require('./routes/booking');



//initialize routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/file', fileRoutes)
app.use('/api/v1/car', carRoutes)
app.use('/api/v1/booking', bookingRoutes)

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

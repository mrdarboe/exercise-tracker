const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/**
 * Connect DB
 * Create Schemas & Models for
 *  User
 *    username
 *    id
 *  Exercise
 *    User.username
 *    description
 *    duration
 *    date toDateString()
 *    id
 *    
 *  POST /api/users
 *    create new User username
 *    res.json({username, id})
 * 
 *  GET /api/users
 *    res.json([{all_users}])
 * 
 *  POST /api/users/:_id/exercises
 *    create new Exercise
 *      description
 *      duration
 *      date ? date : current date
 *      create save() new Log **LOGIC
 *      res.json({user, exercise})
 * 
 *  GET /api/users/:_id/logs
 *    req.params.from yyyy-mm-dd
 *    req.params.to yyyy-mm-dd
 *    req.params.limit 1
 * 
 *    const full_log = findOne(Logs.username = username)
 *    res.json({full_log})
 *      User.name
 *      count array.length + 1
 *      id
 *      log: [{
 *        Exercise.description
 *        Exercise.duration
 *        Exercise.date  
 *      }]
 *  
 *  
 */



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

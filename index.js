const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

//Connect DB
mongoose.connect(process.env.MONGO_URI);

app.use(bodyParser.urlencoded({ extended: false }))

//Schemas
const userSchema = new mongoose.Schema({
  username: String
})
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
})

//Models
const User = new mongoose.model('User', userSchema);
const Exercise = new mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async function(req, res){
  const username = req.body.username;

  try {
    const new_user = await new User({username})
    await new_user.save()
    return res.json({new_user})
  } catch(err) {
    return res.send(err)
  }
})

app.get('/api/users', async function(req, res){
  const all_users = await User.find()
  return res.json(all_users)
})
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

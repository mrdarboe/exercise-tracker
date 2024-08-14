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
  username: {
    type: String,
    required: true,
    unique: true
  }
})
const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
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
    return res.json({username: new_user.username, _id: new_user._id})
  } catch(err) {
    return res.send(err)
  }
})

app.get('/api/users', async function(req, res){
  const all_users = await User.find()
  return res.json(all_users)
})

app.post('/api/users/:_id/exercises', async function(req, res){
  const toId = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);

  let date;
  if (req.body.date) {
    date = new Date(req.body.date);
  } else {
    date = Date.now();
  }
  
  //const parsedDate = date.toDateString();

  try {
    const found_user = await User.findById(toId);
    const update_user = found_user.username;
    const update_id = found_user._id;
    try{
      const new_exercise = await new Exercise({username: update_user, description, duration, date})
      await new_exercise.save();
      return res.json({"_id": update_id, "username": update_user, "date": new_exercise.date.toDateString(), "duration": duration,  "description": new_exercise.description})
    }
    catch(err) {
      return res.json({'error': err})
    }
  } catch(err) {
    return res.json({'err': 'user does not exist', err})
  }
  
})

app.get('/api/users/:_id/logs', async function(req, res){
  const toId = req.params._id;
  //Get earliest && latest dates or use from && to req queries
  let from_query;
  let to_query;

  try {
    const earliest_entry = await Exercise.findOne().sort({date: 1}).limit(1);
    const latest_entry = await Exercise.findOne().sort({date: -1}).limit(1);

    const fromNaNTest = !isNaN(Date.parse(req.query.from));
    const toNaNTest = !isNaN(Date.parse(req.query.to));

    from_query = fromNaNTest ? new Date(req.query.from) : earliest_entry.date;
    to_query = toNaNTest ? new Date(req.query.to) : latest_entry.date;

    // if (isNaN(from_query) || isNaN(to_query)) {
    //   return res.status(400).json({ error: 'Invalid date format. Dates must be in yyyy-mm-dd format.' });
    // }
  } catch(err) {
    return res.json(err)
  }
  

  try {
    const found_user = await User.findById(toId);
    const update_id = found_user._id;
    const update_user = found_user.username;
    try{
      //Get results with date queried
      let pre_log = Exercise.find({username: update_user, date: {$gte: from_query, $lte: to_query}}).select('-_id description duration date').sort({date: -1});
      //Assign pre_log based on provision of limit
      try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        if (limit && limit > 0){
          pre_log = await pre_log.limit(limit)
        } else {
          pre_log = await pre_log
        }
      } catch(err) {
        return res.json(err)
      }
      
      //FORMAT DATE LOGS
      const log = pre_log.map(logs => ({
        _id: logs._id,
        description: logs.description,
        duration: logs.duration,
        date: logs.date.toDateString()
      }))
      const from = !isNaN(Date.parse(req.query.from)) ? new Date(req.query.from).toDateString() : undefined;
      const to = !isNaN(Date.parse(req.query.to)) ? new Date(req.query.to).toDateString() : undefined;
      const count = log.length;
      return res.json({'_id': update_id, 'username': update_user, from, to, 'count': count, log})
    }
    catch(err) {
      return res.json(err)
    }
    
  } catch(err) {
    return res.json(err)
  }
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
 *    get all logs
 *    show logs .where(date)
 *      is greater than (from||earliest date in all logs)
 *      &&
 *      less than (to||latest date in all logs)
 *    .limit results to (limit||all)
 *    
 *    const log = findOne(Logs.username = username)
 *    res.json({log})
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

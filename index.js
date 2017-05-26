//loading environment variables
const dotenv = require('dotenv');
dotenv.load();

//dependencies
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const {BotSessionsDelegate} = require('wit-messenger-bot')
const ThisBot = require('./ThisBot');
const {EntitiesError} = require('./EntitiesError');
const CONF_THRESHOLD = 0.5



//bot actions
const actions = {}


//WitMessengerBot instance
let bot = new ThisBot({
  token: process.env.PAGE_ACCESS_TOKEN,
  verify: process.env.VERIFY_TOKEN
},{
  accessToken: process.env.WIT_ACCESS_TOKEN,
  actions: actions
}, new BotSessionsDelegate())


//handling errors
bot.on('error', (err) => {
    console.log("botError: "+err.message)
})

//handling messages
bot.on('message', (payload, reply) => {
    let text = payload.message.text
    let senderId = payload.sender.id
    let {sessionId, sessionData} = bot.findOrCreateSession(senderId)
    let context = JSON.parse(sessionData)


    //some interaction..
    bot.actHuman(senderId)

    //run NLP
    bot.runActions(sessionId, text, context, (context) => {
      //conversation context logic
      context = {}

      //delete if(empty object), else update.
      if (Object.keys(context).length === 0 && context.constructor === Object){
        bot.deleteSession(sessionId)
      }
      else bot.writeSession(sessionId, JSON.stringify(context))

    }).catch(function(error){
			if(error instanceof EntitiesError){
        bot.sendMessage(senderId, {text: "Sorry, I didn't understand that."})
        bot.deleteSession(sessionId)
      }
		})
})

bot.on('postback', function(payload, reply, actions){
  let senderId = payload.sender.id
  bot.actHuman(senderId)
  var payload = payload['postback']['payload']
  if(payload == "GET_STARTED_PAYLOAD"){
    var onboardingMsgs = require('./JSON-data/onboarding.json')
    reply(onboardingMsgs['msg1'])
    bot.actHuman(senderId)
    reply(onboardingMsgs['msg2'])
  }
})


//initing express app
let app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

//Configing the way the server handles requests
app.get('/', (req, res) => {
    //when facebook hits this webhook with a GET, return verify token specified in bot instance.
    return bot._verify(req, res)
})

app.post('/', (req, res) => {
    bot._handleMessage(req.body)
    res.end(JSON.stringify({
        status: 'ok'
    }))
})

//creating server
http.createServer(app).listen(process.env.PORT)

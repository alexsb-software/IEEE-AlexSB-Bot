const CONF_THRESHOLD = 0.5
const {WitMessengerBot} = require('wit-messenger-bot')
const {EntitiesError} = require('./EntitiesError');


class ThisBot extends WitMessengerBot {
  send(request, response){
    const{sessionId,context,entities} = request
    //TODO: more error checking
    if(Object.keys(entities).length === 0 && entities.constructor === Object){
      return new Promise(function(resolve, reject){
        return reject(new EntitiesError(0, "No entities detected, What the hell is this guy saying?"))
      })
    }
    var maxConfidence = 0
    for (var entity in entities) {
      if(entities.hasOwnProperty(entity)){
        for (var i = 0; i < entities[entity].length; i++) {
          var value = entities[entity][i]
          if(value["confidence"] > maxConfidence){
            maxConfidence = value["confidence"]
          }
        }
      }
    }
    if(maxConfidence < CONF_THRESHOLD){
      return new Promise(function(resolve, reject){
        return reject(new EntitiesError(1, "Entities with low confidence, unsure what to do"))
      })
    }
    super.send(request, response)
  }
}

module.exports = ThisBot

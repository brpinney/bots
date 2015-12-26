var Wit = require('node-wit')

module.exports = function (witToken) {
  return new Intents(witToken)
}

function Intents (witToken) {
  var self = this
  self._intents = {}
  self._witToken = witToken

  self.hears = function (name, confidence, fn) {
    var registration = {
      confidence: confidence,
      fn: fn
    }
    if (!self._intents[name]) {
      self._intents[name] = [registration]
    } else {
      self._intents[name].push(registration)
    }
  }

// process text with Wit.ai.
// 1st argument is the text of the message
// Remaining arguments will be passed as the first arguments of each registered callback
  self.process = function (text) {
    var args = Array.prototype.slice.call(arguments)
    args.shift()
    Wit.captureTextIntent(self._witToken, text, function (err, res) {
      if (err) return console.error('Wit.ai Error: ', err)

      // only consider the 1st outcome
      if (res.outcomes && res.outcomes.length > 0) {
        var outcome = res.outcomes[0]
        var intent = outcome.intent
        args.push(outcome)
        if (self._intents[intent]) {
          self._intents[intent].forEach(function (registration) {
            if (outcome.confidence >= registration.confidence) {
              registration.fn.apply(undefined, args)
            }
          })
        }
      }
    })
  }
}

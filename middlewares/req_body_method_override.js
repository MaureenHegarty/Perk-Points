const methodOverride = require('method-override')

const reqBodyMethodOverride = methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {

    var method = req.body._method
    delete req.body._method
    return method
  }
})

module.exports = reqBodyMethodOverride
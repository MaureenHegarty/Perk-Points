

function requestLogger(req, res, next) {
    console.log(`${new Date().toLocaleDateString()} ${req.method} ${req.path} `)
    next()

}

module.exports = requestLogger
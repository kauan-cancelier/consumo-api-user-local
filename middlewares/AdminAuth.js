const jwt = require("jsonwebtoken")

var secret = "insira qualquer coisa aqui"

module.exports = function(request, response, next) {
    const authToken = request.headers["authorization"]

    if (authToken == undefined) {
        return response.status(403).send("Você não tem permissão para acessar essá página. ")
    }
    const bearer = authToken.split(' ')
    var token = bearer[1]

    try {
        var decoded = jwt.verify(token, secret)
        if (decoded.role == 1) {
            next()
        } else {
            return response.status(403).send("Você não tem permissão para acessar essá página. ")
        }
    } catch (error) {
        return response.status(403).send("Você não tem permissão para acessar essá página. ")
    }

}

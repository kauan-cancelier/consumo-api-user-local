const User = require("../models/User")
const PasswordToken= require("../models/PasswordToken")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

var secret = "insira qualquer coisa aqui"



const BAD_REQUEST = 400
const NOT_FOUND = 404
const NOT_ACCEPTABLE = 406
const INTERNAL_ERROR = 500
const OK = 200

class UsersController {

    async index(request, response) {
        var users = await User.findAll()
        response.json(users)
    }

    async show(request, response) {
        var user = await User.findBy(request.params.id)
        if (user == undefined || user.length < 1) {
            return response.status(NOT_FOUND)
                    .send("Não foi encontrado nenhum usuário para o id informado. ")
        }
        return response.json(user)
    }

    async create(request, response) {

        var {name, password, email} = request.body

        if (email == undefined ) {
            return response.status(BAD_REQUEST).send("O email é obrigatório")
        }

        if (await User.findEmail(email) > 0) {
            return response.status(BAD_REQUEST).send("O email informado já está cadastrado no banco de dados. ")
        }

        if (name == undefined || name.length < 3) {
            return response.status(BAD_REQUEST).send("O nome é obrigatório e deve conter no ao menos 3 caracteres. ")
        }

        if (password == undefined || name.length < 3) {
            return response.status(BAD_REQUEST).send("A senha é obrigatória e deve conter ao menos 3 caracteres.")
        }

        var user = { name, password, email }
        User.create(user)

        return response.status(OK).send(user)

    }

    async edit(request, response) {
        try {
            var user = {
              id: request.body.id,
              name: request.body.name,
              role: request.body.role,
              email: request.body.email
            }

            var result = await User.update(user)

            if (!result.status) {
              return response.status(NOT_ACCEPTABLE).send(result.err)
            }
            return response.status(OK).send(user)
          } catch (error) {
            return response.status(INTERNAL_ERROR).send("Erro interno do servidor")
          }
    }

    async delete(request, response) {
        var result = await User.deleteBy(request.params.id)
        if (result.status == false ) {
            return response.status(NOT_ACCEPTABLE).send(result.err)
        }
        return response.status(OK).send(result)
    }

    async recoverPassword(request, response) {
        var email = request.body.email

        var result = await PasswordToken.create(email)

        if (!result.status) {
            return response.status(406).send(result.err)
        }
        return response.status(200).send(`${result.token}`)
    }

    async changePassword(request, response) {
        try {
            var token = request.body.token
            var password = request.body.password

            const isTokenValid = await PasswordToken.validate(token)

            if (!isTokenValid.status) {
                return response.status(406).json({ error: "Token inválido" })
            }

            console.log(isTokenValid.token)

            await User.changePassword(
                password,
                isTokenValid.token.id_user,
                isTokenValid.token.token
            )
            return response.status(200).json({ message: "Senha alterada com sucesso" })
        } catch (error) {
            return response.status(500).json({ error: "Ocorreu um erro interno ao processar a solicitação" })
        }
    }

    async login(request, response) {

        var { email, password } = request.body

        var user = await User.findUserBy(email)

        if (user == undefined) {
            return response.status(406).send("Não foi encontrado nenhum usuário pelo email informado. ")
        }

        var isPasswordEquals = await bcrypt.compare(password, user.password)

        if (!isPasswordEquals) {
            return response.status(406).send("senha incorreta. ")
        }

        var token = jwt.sign({ email: user.email, role: user.role }, secret)
        return response.status(200).json({token: token})

    }

}

module.exports = new UsersController()

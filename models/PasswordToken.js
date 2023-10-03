const knex = require("../database/connection")
const User = require("./User")

class PasswordToken {

    async create(email) {
        try {
            var user = await User.findUserBy(email)

            var token = Date.now() //change to UUID

            if (user == undefined) {
                return { status: false, err: "O email passado não existe. "}
            }

            await knex.insert({
                id_user: user.id,
                used: 0,
                token: token
            }).table("password_tokens")
            return { status: true, token: token }
        } catch (error) {
            console.log(error)
            return { status: false, err: "Ocorreu um erro ao inserir por email. "}
        }

    }

    async validate(token) {
        try {
            const result = await knex.select("*").where({ token: token }).table("password_tokens")

            if (result.length === 0) {
                return { status: false, error: "Token não encontrado." }
            }

            const tk = result[0]

            if (tk.used === 1) {
                return { status: false, error: "O token já foi usado." }
            }

            return { status: true, token: tk }
        } catch (error) {
            console.error("Erro ao validar o token:", error)
            return { status: false, error: "Ocorreu um erro ao validar o token." }
        }
    }

    async setUsedBy(token) {
        await knex.update({ used: 1 }).where({ token: token }).table("password_tokens")
    }

}

module.exports = new PasswordToken()

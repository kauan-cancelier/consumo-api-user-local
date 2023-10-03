const knex = require("../database/connection")
var bcrypt = require("bcrypt")
const PasswordToken = require("./PasswordToken")

class User {

    async create(user) {
        try {
            user.password = await bcrypt.hash(user.password, 10)
            user.role = 1
            await knex.insert(user).table("users")
        } catch (error) {
            console.log(error)
        }
    }

    async update(user) {

        var findedUser = await this.findBy(user.id)

        if (!findedUser) {
            return { status: false, err: "Usuário não existe." }
        }

        if (!user.email) {
            return { status: false, err: "O email informado está vazio ou o usuário não existe." }
        }

        if (!user.name) {
            return { status: false, err: "O nome é obrigatório." }
        }

        if (user.role < 0 || user.role == undefined) {
         return { status: false, err: "A função (role) é obrigatória." }
        }

        try {
            await knex.update(user).where({ id: user.id }).table("users")
        } catch (error) {
            return { status: false, err: error }
        }

        return { status: true, err: false }
    }

    async deleteBy(id) {
        var user = this.findBy(id)
        if (!user) {
            return { status: false, err: "Usuário não existe." }
        }
        try {
            await knex.delete(user).where({id: id}).table("users")
            return { status: true, err: "ok" }
        } catch (error) {
            console.log("entrou aqui")
            return { status: false, err: "Ocorreu um erro durante a exclusão do usuário. " }
        }
    }

    async findEmail(email) {
        try {
            const countResult = await knex('users').count('id as count').where({ email })
            return countResult[0].count
        } catch (error) {
            console.log(error)
        }
    }

    async findUserBy(email) {
        try {
            const result = await knex.select(["id", "email", "role", "name", "password"]).table("users").where({ email: email })
            return result.length > 0 ? result[0] : null
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    async findAll() {
        try {
            return await knex.select(["id", "email", "role"]).table("users")
        } catch (error) {
            console.log(error)
            return []
        }
    }

    async findBy(id) {
        try {
            const result = await knex.select(["id", "email", "role", "name"]).table("users").where({ id: id })
            return result.length > 0 ? result[0] : null
        } catch (error) {
            console.log(error)
            return undefined
        }
    }

    async changePassword(newPassword, id, token) {
        var hash = await bcrypt.hash(newPassword, 10)
        await knex.update({ password: hash }).where({id: id}).table("users")
        await PasswordToken.setUsedBy(token)
    }

}

module.exports = new User()

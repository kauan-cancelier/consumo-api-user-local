var express = require("express")
var router = express.Router()
var AdminAuth = require("../middlewares/AdminAuth")

var UsersController = require("../controllers/UsersController")

router.get("/users", AdminAuth, UsersController.index)
router.get("/user/:id", AdminAuth, UsersController.show)
router.post("/user", AdminAuth, UsersController.create)
router.put("/user", AdminAuth, UsersController.edit)
router.delete("/user/:id", AdminAuth, UsersController.delete)
router.post("/recoverpassword", UsersController.recoverPassword)
router.post("/changepassword", UsersController.changePassword)
router.post("/login", UsersController.login)

module.exports = router

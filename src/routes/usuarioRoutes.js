const {authenticate} = require("../middlewares/authToken");
const {Router} = require("express");
const routes =  new Router();
const usuario = require('../controller/usuarioController.js');

routes.get('/usuarios',authenticate,usuario.listAll);
routes.get('/usuario-busca',authenticate,usuario.findOne);
routes.post('/usuario-login',usuario.login);
routes.post('/usuario',usuario.createOne);

module.exports =  routes ;
import express from "express";
import * as userController from "../controller/userController.js"
const router = express.Router();
//router is an mini instance of express which can handle routes and also it can have its own logic.But for app.js router act like middleware
//also in router object all the routes are internally stored in array form like:
// router.stack = [
//   { method: 'GET', path: '/register', handler: [Function] },
//   { method: 'POST', path: '/login', handler: [Function] }
// ];
//whenever a request comes to router object , express check router.stack to find a matching route

//auth routes
router.get('/SignUp',userController.getSignUp)
router.post('/SignUp',userController.postSignUp);
router.get('/login',userController.getLogin);
router.post('/login',userController.postLogin);

//home route
router.get('/',userController.getHome);


export default router;
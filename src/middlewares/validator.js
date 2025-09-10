import {body} from "express-validator";
//express-validator adds a middleware to our route
//these middleware check and validate the user input beforei  reaches the controller
// flow : Client → Router → Validation Middleware (express-validator) → Controller → View / Response


//we import body function from express-validator package
//body function returns a middleware that checks fields in req.body

const validator = [
  body('email')
  .escape() //santitize input (Escapes HTML characters like <, >, &, etc., to prevent injection attacks.)
  .isEmail().withMessage('Invalid Email Format')
  .isLength({max:254}).withMessage('"Please enter a valid email address"')
  .not().contains(' ').withMessage('Email cannot contain spaces')
  .matches(/^[^\s@]+@[^\s@]+$/).withMessage("Please Enter a valid email address")
  .custom(email=>{
     // Check for consecutive dots
     if(/\.{2,}/.test(email)){
      throw new Error('Invalid email format')
     }

     const local = email.split('@')[0];
     if(/(\..*\.) | (^\.)| (\.$)/.test(local)){
      throw new Error ('Invalid dots in email name')
     }
     return true;
  }),

  body('')

]




























// const { body } = require('express-validator');

// This:
// body('email').isEmail().withMessage('Invalid email');

// ...returns this:
// (req, res, next) => {
//internally checks req.body.email and sets errors if any
//   next();
// }

//body('email')
//Targets the email field in the request body (req.body.email).
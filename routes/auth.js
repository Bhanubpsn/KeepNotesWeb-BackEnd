const express = require('express');
const User = require('../models/User');
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'thisismyfirstjwttokenkey';

//Creating POST request for a user Sign Up  /api/auth/createuser
router.post('/createuser',[
    body('email', 'Email length should be 5 to 30 characters').isEmail().isLength({ min: 5, max: 30 }),
    body('name', 'Name length should be 3 to 20 characters').isLength({ min: 3, max: 20 }),
    body('password', 'Password length should be 5 to 10 characters').isLength({ min: 5, max: 10 })
],async (req,res)=>{
    let success = false;
    const erros = validationResult(req);
    if(!erros.isEmpty()){
        res.statusCode = 400;
        return res.send({success, errors: erros.array() });
    }
    try{
        let user = await User.findOne({email: req.body.email});
        if(user){
            res.statusCode = 400;
            return res.json({success, error: "An email exists already"});
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })
        
        // console.log(user);
        
        // .then(user => res.json(user)).
        // catch(err => {console.log(err)
        // res.json({error: 'Please enter a unique value for email',message: err.message})})
        const data = {
            user:{
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        console.log(authtoken);

        // res.json(user);
        success = true;
        res.json({success, authtoken});
    }catch(err){
        console.log(err);
        res.statusCode = 500;
        res.send("Some Error Occured");
    }
    

})


//Authentication of a user login, /api/auth/login

router.post('/login',[
    body('email', 'Email length should be 5 to 30 characters').isEmail().isLength({ min: 5, max: 30 }),
    body('password', 'Password can\'t be blank').exists(),
],async (req,res)=>{
    let success = false;
    const erros = validationResult(req);
    if(!erros.isEmpty()){
        res.statusCode = 400;
        return res.send({ errors: erros.array() });
    }

    const {email, password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            res.statusCode = 400;
            return res.json({errors: "Please enter valid credentials"});
        }

        const passwordCompare = await bcrypt.compare(password, user.password); 

        if(!passwordCompare){
            res.statusCode = 400;
            success = false;
            return res.json({success, errors: "Please enter valid credentials"});
        }

        const data = {
            user:{
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        console.log(authtoken);
        success = true;
        res.json({success, authtoken});

    }catch(err){
        console.log(err);
        res.statusCode = 500;
        res.send("Some Errorrrrrrrr");
    }

})


//Get User Detail using POST /api/auth/getuser
router.post('/getuser',fetchuser,async (req,res)=>{

    try {
        let userId  = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error);
        res.statusCode = 500;
        res.send("Some Errorrrrrr");
    }
})

module.exports = router
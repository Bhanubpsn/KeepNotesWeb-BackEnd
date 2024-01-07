const jwt = require('jsonwebtoken');
const JWT_SECRET = 'thisismyfirstjwttokenkey';
const fetchuser = (req,res,next)=>{
    //Gett user from jwt token and add id to req obj
    const token = req.header('auth-token');
    if(!token){
        res.status = 401;
        res.send({error: "Not a valid Token"});
    }
    const data = jwt.verify(token,JWT_SECRET);
    req.user = data.user;
    next();
}


module.exports = fetchuser;

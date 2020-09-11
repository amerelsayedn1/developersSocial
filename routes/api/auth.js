const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route     GET api/auth
//@desc      Test Route
//@access    public
router.get('/',auth, async (req,res)=>{

  try {
    const user=await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json('server error');
  }

  res.send("AUTH");
});


//@route     POST api/auth
//@desc      Autentication user &  get Token
//@access    public
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check(
    'password',
    'Password is required'
  ).exists()
],async (req,res)=>{

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({email});

    if (user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch=bcrypt.compare(password,user.password);

    if(!isMatch){

      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    
  //return jsonwebToken
  const payload={
      user:{
          id:user.id
      }
  }

  jwt.sign(
      payload,
      config.get('jwtSecrtKey'),
      {expiresIn:360000},
      (err,token)=>{
          if(err) throw err;
          else res.json({token});
      }
  );

} catch (err) {
  console.error(err.message);
}

  

});

module.exports=router;
const express=require("express");
const routes=express.Router();


//@route     GET api/posts
//@desc      Test Route
//@access    public
routes.get('/',(req,res)=>res.send("Posts Route"));

module.exports=routes
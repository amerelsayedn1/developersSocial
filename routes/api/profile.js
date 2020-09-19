const express=require("express");
const routes=express.Router();

const auth=require('../../middleware/auth');
const Profile=require('../../models/Profile');
const user=require('../../models/User');
const normalize = require('normalize-url');

const { check, validationResult } = require('express-validator');
const e = require("express");



//@route     GET api/profile/me
//@desc      Get current user's profile
//@access    Private
routes.get('/me',auth,async (req,res)=>{

    try {
        const profile= await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            res.status(400).json({msg:'There is no profile for this user'});
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }

});


//@route     POST api/profile
//@desc      Create Profile
//@access    Private
routes.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook
    } = req.body;

    const profileFields = {
      user: req.user.id,
      company,
      location,
      website: website && website !== '' ? normalize(website, { forceHttps: true }) : '',
      bio,
      skills: Array.isArray(skills)? skills: skills.split(',').map(skill => ' ' + skill.trim()),
      status,
      githubusername
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


//@route     POST api/profile
//@desc      Get All Profiles
//@access    public
routes.get("/",async (req,res)=>{

    try {
      const profiles=await Profile.find().populate('user',['name','avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }

})

//@route     POST api/profile/user/:user_id
//@desc      Get Specific user profile
//@access    public
routes.post("/user/:user_id",async (req,res)=>{

  try {
    const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
    if(!profile){
      res.status(400).json({msg:'There is no profile for this user'});
  }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    
    if(err.kind=="ObjectId"){
      return res.status(400).json({msg:'profile not found'});
    }

    res.status(500).json("Server Error");
  }

})


//@route     DELETE api/profile
//@desc      Delete Profile & user & Posts
//@access    private
routes.delete("/",auth,async (req,res)=>{

  try {

    //@TODO remove posts

    //Remove profile
    await Profile.findOneAndRemove({user:req.user.id});

    //Remove user
    await user.findOneAndRemove({_id:req.user.id});

    res.json({msg:'Deleted SuccessFully'});
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }

})


//@route     PUT api/profile
//@desc      update experience
//@access    private
routes.put("/experience",[auth,[
  check("title","Title is required").not().isEmpty(),
  check("company","Company is required").not().isEmpty(),
  check("from","From is required").not().isEmpty()
]],async (req,res)=>{

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExperience={
      title:title,
      company:company,
      location:location,
      from:from,
      to:to,
      current:current,
      description:description
    }

    try {
      const profile=await Profile.findOne({user:req.user.id});  
      profile.experience.unshift(newExperience); 
      await profile.save();
      res.json(profile); 
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }

    res.send("done");
})


//@route     DELETE api/profile/experience/:exp_id
//@desc      update experience
//@access    private
routes.delete("/experience/:exp_id",auth,async (req,res)=>{
  try {
    const profile =await Profile.findOne({user:req.user.id});  

    //Get Removed Index
    const removeIndex=profile.experience
          .map(item  =>item.id)
          .indexOf(req.params.exp_id);

    if(removeIndex==-1){
      res.status(400).json({msg:'The experience id is wrong'}); 
    }else{
      profile.experience.splice(removeIndex,1);
      await profile.save();
      res.json(profile); 
    }
    
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
})

//@route     PUT api/profile
//@desc      update education
//@access    private
routes.put("/education",[auth,[
  check("school","School is required").not().isEmpty(),
  check("degree","Degree is required").not().isEmpty(),
  check("fieldofstudy","FieldOfStudy is required").not().isEmpty(),
  check("from","From is required").not().isEmpty()
]],async (req,res)=>{

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEducation={
      school:school,
      degree:degree,
      fieldofstudy:fieldofstudy,
      from:from,
      to:to,
      current:current,
      description:description
    }

    try {
      const profile=await Profile.findOne({user:req.user.id});  
      profile.education.unshift(newEducation); 
      await profile.save();
      res.json(profile); 
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
})


//@route     DELETE api/profile/experience/:exp_id
//@desc      update experience
//@access    private
routes.delete("/education/:education_id",auth,async (req,res)=>{
  try {
    const profile =await Profile.findOne({user:req.user.id});  

    //Get Removed Index
    const removeIndex=profile.education
          .map(item  =>item.id)
          .indexOf(req.params.education_id);

    if(removeIndex==-1){
      res.status(400).json({msg:'The education id is wrong'}); 
    }else{
      profile.education.splice(removeIndex,1);
      await profile.save();
      res.json(profile); 
    }
    
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
})

module.exports=routes
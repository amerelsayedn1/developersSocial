const mongoose=require("mongoose");
const config=require("config");
const db=config.get("mongoURI");


const connectDB=async()=>{
    try {
        await mongoose.connect(db,{useNewUrlParser:true,
        useCreateIndex:true});
        console.log('Db connected ...');
    } catch (error) {
        console.error(error);
        //process exit with failure
        process.exit(1);
    }  
}

module.exports=connectDB;
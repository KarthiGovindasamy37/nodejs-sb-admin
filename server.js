const express=require("express")
const app=express()
const cors=require("cors")
const mongodb=require("mongodb")
const mongoClient=mongodb.MongoClient
const dotenv=require("dotenv").config()
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
let DB="users_products"
let URL=process.env.URL

let users=[];

app.use(express.json());
app.use(cors({
   origin:"http://localhost:3001"
}))

let authenticate=(req,res,next)=>{
if(req.headers.authorization){
  try {
    let decode=jwt.verify(req.headers.authorization,process.env.SECRET)
    if(decode){
      next()
    }
  } catch (error) {
    res.status(401).json({message:"unauthorised"})
  }
 
}else{
  res.status(401).json({message:"unauthorised"})
}
}

app.get("/home",authenticate,function(req,res){
    res.json({"message":"You're home..."})
})

app.post("/user",authenticate,async function(req,res){

 try {
  let connection= await mongoClient.connect(URL)

  let db=connection.db(DB)

  await db.collection("user").insertOne(req.body)

  await connection.close()

  res.json({message:"user created"})
 } catch (error) {
  res.status(500).json({message:"something wrong"})
 }
//     req.body.id=users.length+1;
// users.push(req.body);
// res.send("Created")

})

app.get("/users",authenticate,async function(req,res){

 try {
  let connection=await mongoClient.connect(URL)

  let db=connection.db(DB)

  let users=await db.collection("user").find().toArray()

  await  connection.close()

  res.json(users)
 } catch (error) {
  res.status(500).send("something wrong")
 }
  //   let qparams=req.query
  //   let resUsers=[]
  //   for(let i=0;i<+req.query.limit;i++){
  //     if(users[i]!= null){
  //     resUsers.push(users[i])

  //   }
  // }
  //   res.json(resUsers)
  
})

app.get("/user/:id",authenticate,async function(req,res){

  try {
  let connection=await mongoClient.connect(URL);

  let db=connection.db(DB);

  let user=await db.collection("user").findOne({_id:mongodb.ObjectId(req.params.id)});

  await connection.close();

  res.json(user);
  } catch (error) {
    res.status(500).json({message:"something wrong"});
  }
  // let userId=req.params.id;
  // let user=users.find(ele=>ele.id==userId)
  // if(user){
  //   res.json(user)
  // }else{
  //   res.send("id not exists")
  // }
})

app.put("/user/:id",authenticate,async function(req,res){

  try {
    let connection= await mongoClient.connect(URL);

  let db=connection.db(DB);

  await db.collection("user").findOneAndUpdate({_id:mongodb.ObjectId(req.params.id)},{$set:req.body});

  await connection.close();

  res.send("user updated");
  } catch (error) {
    res.status(500).json({message:"something wrong"})
  }
    // let userId=req.params.id;
    // let index=users.findIndex(ele=>ele.id==userId)

    // *let user=users.find(ele=>ele.id==userId)
    // Object.keys(req.body).forEach(ele=>user[ele]=req.body[ele])*
    // if(index!=-1){
    //   let user= Object.keys(req.body).forEach(ele=>users[index][ele]=req.body[ele])
    //     res.json(user)
    // }else{
    //     res.send("Id not exists")
    // }
})

app.delete("/user/:id",authenticate,async function(req,res){

  try {
  let connection=await mongoClient.connect(URL);

  let db=connection.db(DB);

  await db.collection("user").findOneAndDelete({_id:mongodb.ObjectId(req.params.id)});

  await connection.close();

  res.send("User Deleted");
  } catch (error) {
    res.status(500).json({message:"something wrong"});
  }
  // let userId=+req.params.id
  // let userIndex=users.findIndex(ele=>ele.id===userId)
  // if(userIndex!=-1){
  // users.splice(userIndex,1)
  // res.send("User Deleted")
  // }else{
  //   res.send("User not exists")
  // }
})

app.post("/register",async function(req,res){

  try {
    let connection= await mongoClient.connect(URL);

  let db=connection.db(DB);

  let salt=await bcrypt.genSalt(10);

  let hash=await bcrypt.hash(req.body.password,salt);

  req.body.password=hash;

  await db.collection("Auth users").insertOne(req.body);

  await connection.close();                       

  res.send("registered")
  } catch (error) { 
    console.log(error);                                            
    res.status(500).send("something wrong")
  } 
})

app.post("/login",async function(req,res){

 try {
  let connection=await mongoClient.connect(URL);

  let db=connection.db(DB);

  let user=await db.collection("Auth users").findOne({email:req.body.email});
  
  if(user){
  let compare=await bcrypt.compare(req.body.password,user.password);

  if(compare){
   let token=jwt.sign({_id:user._id},process.env.SECRET,{expiresIn:"1m"})
   res.json({token})
  }else{
    res.send("email or Password incorrect");
  }
  }else{
    res.status(401).json({message:"email or password incorrect"});
  }
 } catch (error) {
  res.status(500).json({message:"something wrong"})
 }
})


app.listen(process.env.PORT || 3000)
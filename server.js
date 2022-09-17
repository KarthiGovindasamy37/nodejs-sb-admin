const express=require("express")
const app=express()
const cors=require("cors")

let users=[];

app.use(express.json());
app.use(cors({
   origin:"http://localhost:3000"
}))

app.get("/home",function(req,res){
    res.json({"message":"You're home..."})
})

app.post("/user",function(req,res){
    req.body.id=users.length+1;
users.push(req.body);
res.send("Created")

})

app.get("/users",function(req,res){
    let qparams=req.query
    let resUsers=[]
    for(let i=0;i<+req.query.limit;i++){
      if(users[i]!= null){
      resUsers.push(users[i])

    }
  }
    res.json(resUsers)
  
})

app.get("/user/:id",function(req,res){
  let userId=req.params.id;
  let user=users.find(ele=>ele.id==userId)
  if(user){
    res.json(user)
  }else{
    res.send("id not exists")
  }
})

app.put("/user/:id",function(req,res){
    let userId=req.params.id;
    let index=users.findIndex(ele=>ele.id==userId)

    // let user=users.find(ele=>ele.id==userId)
    // Object.keys(req.body).forEach(ele=>user[ele]=req.body[ele])
    if(index!=-1){
      let user= Object.keys(req.body).forEach(ele=>users[index][ele]=req.body[ele])
        res.json(user)
    }else{
        res.send("Id not exists")
    }
})

app.delete("/user/:id",function(req,res){
  let userId=+req.params.id
  let userIndex=users.findIndex(ele=>ele.id===userId)
  if(userIndex!=-1){
  users.splice(userIndex,1)
  res.send("User Deleted")
  }else{
    res.send("User not exists")
  }
})



app.listen(process.env.PORT || 3000)
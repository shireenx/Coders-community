import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRounds=10;

const db = new pg.Client({
    user: "",
    host: "localhost",
    database: "project2",
    password: "",
    port: 5432,
  });
  db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async(req,res)=>{
    res.render("index.ejs")
});

app.get("/recruiter",async(req,res)=>{
    res.render("rsignin.ejs");
});

app.get("/collaborator",async(req,res)=>{
    res.render("csignin.ejs");
});

app.post("/rsign-up",async(req,res)=>{
    console.log(req.body.username);
    var user_type=req.body.user_type;
    if(user_type=="Recruiter"){
        const username=req.body.username;
        const password=req.body.password;
        try{
            const checkResult = await db.query("SELECT * FROM recruiters WHERE username = $1", [
                username,
              ]);
              if (checkResult.rows.length > 0) {
                res.send("user already exists. Try logging in.");
              } else {
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                  if (err) {
                    console.error("Error hashing password:", err);
                  } else {
                    console.log("Hashed Password:", hash);
                    await db.query(
                      "INSERT INTO recruiters (username, password) VALUES ($1, $2)",
                      [username, hash]
                    );
                       res.render("rprofile.ejs",{un:username});
                  }
                });
              }
        }
    catch (err) {
    console.log(err);
  }

    }
    else{
        const username=req.body.username;
        const password=req.body.password;
        try{
            const checkResult = await db.query("SELECT * FROM collaborators WHERE username = $1", [
                username,
              ]);
              if (checkResult.rows.length > 0) {
                res.send("user already exists. Try logging in.");
              } else {
                bcrypt.hash(password, saltRounds, async (err, hash) => {
                  if (err) {
                    console.error("Error hashing password:", err);
                  } else {
                    console.log("Hashed Password:", hash);
                    await db.query(
                      "INSERT INTO collaborators (username, password) VALUES ($1, $2)",
                      [username, hash]
                    );
                        res.render("cprofile.ejs",{un:username});
                  }
                });
              }
        }
    catch (err) {
    console.log(err);
   }}

});

app.get("/signup",async(req,res)=>{
    res.render("signup.ejs");
});

app.post("/profsubmit/:un", async(req,res)=>{
  const un=req.params.un;
  console.log(un)
    const rec_type=req.body.rec_type;
    const pay=req.body.paying;
    const abtu=req.body.Aboutyou;
    const categ=req.body.work_categ;
    const work_exp=req.body.work_experience;
    const prev_proj=req.body.previousprojects;
    const curr_proj=req.body.currprojects;
    const socials=req.body.Sociallinks;
    
    try{
              const result=await db.query("SELECT id FROM recruiters WHERE recruiters.username=$1",[un]);          
              const id=result.rows[0].id;
                await db.query(
                  "INSERT INTO rec_props (id,paying, type, info, catg, work_exp, prev_work, curr_project, socials) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)",
                  [ id,pay, rec_type, abtu,categ, work_exp, prev_proj, curr_proj, socials ]
                );
                const proj_info=await db.query("SELECT proj_name, proj_pay, proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id");
                const info=proj_info.rows;
                const application_results=await db.query("SELECT proj_name,col_name FROM recruiters JOIN applications ON recruiters.id = application_id WHERE recruiters.username=$1",[un]);
                const applications=application_results.rows;
                res.render("rmain.ejs",{un:un,info:info,key:'not_del',applications:applications});
               
    }

catch (err) {
console.log(err);
}
});

app.post("/rsignin",async(req,res)=>{
  const un = req.body.username;
  const pw = req.body.password;
  
  try {
    const result = await db.query("SELECT * FROM recruiters WHERE username = $1", [
      un,]);
      const proj_info=await db.query("SELECT proj_name, proj_pay, proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id");
            const info=proj_info.rows;
      
      const application_results=await db.query("SELECT proj_name,col_name FROM recruiters JOIN applications ON recruiters.id = application_id WHERE recruiters.username=$1",[un]);
      const applications=application_results.rows;
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      bcrypt.compare(pw, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {

              res.render("rmain.ejs",{un:un,info:info,key:'not_del',applications:applications});
          } else {
            res.render("rsignin.ejs", {errmsg:"incorrect password"});
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
                
});

app.get("/main/:un",async(req,res)=>{
  const un=req.params.un;
  try {
    const proj_info=await db.query("SELECT proj_name, proj_pay, proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id");
            const info=proj_info.rows;
      
      const application_results=await db.query("SELECT proj_name,col_name FROM recruiters JOIN applications ON recruiters.id = application_id WHERE recruiters.username=$1",[un]);
      const applications=application_results.rows;
      res.render("rmain.ejs",{un:un,info:info,key:'not_del',applications:applications});
  } catch (error) {
    console.log(error);
  }

})

app.post("/profcsubmit/:un",async(req,res)=>{
  const un=req.params.un;
  const name=req.body.name;
    const email=req.body.email;
    const education=req.body.Education;
    const workexp=req.body.workexp;
    const tr=req.body.tr;
    const projects=req.body.projects;
    const skills=req.body.skills;
    const pw=req.body.pw;
    
    try{
      const result=await db.query("SELECT id FROM collaborators WHERE collaborators.username=$1",[un]);          
      const id=result.rows[0].id;
          await db.query(
                  "INSERT INTO col_props (id,name, email, education, workexp, tc, projects, skills, pw) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)",
                  [ id,name, email, education,workexp, tr, projects, skills, pw ]
                );
                const notifications_results=await db.query("SELECT * FROM project_posts JOIN workforce ON project_posts.id = workforce_id WHERE workforce.name=$1",[un]);
                const notifications=notifications_results.rows;
                const proj_info=await db.query("SELECT proj_name, proj_pay, proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id");
            const info=proj_info.rows;
                res.render("cmain.ejs",{un:un,info:info,key:'not_del',notifications:notifications});
        }

catch (err) {
console.log(err);
}
});

app.post("/csignin",async(req,res)=>{
  const un = req.body.username;
  const pw = req.body.password;
  

  try {
    const result = await db.query("SELECT * FROM collaborators WHERE username = $1", [
      un,
    ]);
    const notifications_results=await db.query("SELECT * FROM project_posts JOIN workforce ON project_posts.id = workforce_id WHERE workforce.name=$1",[un]);
                const notifications=notifications_results.rows;
    const proj_info=await db.query("SELECT proj_name, proj_pay, proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id");
            const info=proj_info.rows;
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
     
      bcrypt.compare(pw, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
              res.render("cmain.ejs",{un:un,info:info,key:'not_del',notifications:notifications});
          } else {
            res.render("csignin.ejs", {errmsg:"incorrect password"});
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
                
});


var obj=[];
app.get("/rprofiledisp/:un",(req,res)=>{
  const un=req.params.un;
  db.query("SELECT * FROM recruiters JOIN rec_props ON recruiters.id=rec_props.id WHERE recruiters.username=$1",[un], (error, result)=>{
    if(error){
      throw error;
    }
    else{
      obj.push(result.rows[0]);
      res.render("rpdisplay.ejs",{obj: obj});
    }
  })
})


var objc=[];
app.get("/cprofiledisp/:un",(req,res)=>{
  const un=req.params.un;
  db.query("SELECT * FROM collaborators JOIN col_props ON collaborators.id=col_props.id WHERE collaborators.username=$1",[un], (error, result)=>{
    if(error){
      throw error;
    }
    else{
      objc.push(result.rows[0]);
      res.render("cpdisplay.ejs",{objc: objc});
    }
  })
})



app.get("/newpost/:un",(req,res)=>{
      const un=req.params.un;
      res.render("createpost.ejs",{un:un});
});

 app.post("/postskill",(req,res)=>{
  const skill=req.body.one;
  
  res.render('ccreateposts.ejs',{skill:skill});
 })

app.post("/dessubmit/:un",async(req,res)=>{
  const un=req.params.un;
  const name=req.body.proj_name;
  const des=req.body.proj_des;
  const pay=req.body.proj_pay;
  const dur=req.body.proj_dur;
  const data={name:name,des:des,pay:pay,dur:dur};

  try{
   const result= await db.query("SELECT id FROM recruiters WHERE recruiters.username=$1",[un]);
   const id=result.rows[0].id;
   await db.query(
            "INSERT INTO project_posts (proj_name, proj_des, proj_pay, proj_dur,project_id) VALUES ($1, $2, $3, $4,$5)",
            [ name, des, pay,dur,id ]
          );
          const pkrows=await db.query("SELECT id FROM project_posts WHERE project_posts.proj_name=$1",[name]);
          const pk=pkrows.rows[0].id;
          console.log(pk)
          res.render("addskill.ejs",{pk:pk,un:un});
  }

catch (err) {
console.log(err);
}
});

app.post("/addskill1/:pk/:un",async(req,res)=>{
  const pk=req.params.pk;
  const skill=req.body.skill;
  const un=req.params.un;
  
  try{
     await db.query(
            "INSERT INTO project_skills (skill,skill_id) VALUES ($1, $2)",
             [ skill,pk ]
           );
      const result= await db.query("SELECT skill FROM project_skills WHERE project_skills.skill_id=$1",[pk]);
      const skills=result.rows;
           res.render("addskill2.ejs",{skills:skills,pk:pk,un:un});
   }
 
 catch (err) {
 console.log(err);
 }
  
})


app.get("/mypost/:un",async(req,res)=>{
  var o=[];
  const un=req.params.un;
  
  try{
    const result= await db.query("SELECT id FROM recruiters WHERE recruiters.username=$1",[un]);
   const id=result.rows[0];
   o.push(id);
   if(o[0]){
   var pid=o[0].id
   }

   
  const proj_info=await db.query("SELECT proj_name, proj_pay, proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id WHERE project_posts.project_id=$1",[pid]);
  const info=proj_info.rows;
  const application_results=await db.query("SELECT proj_name,col_name FROM recruiters JOIN applications ON recruiters.id = application_id WHERE recruiters.username=$1",[un]);
      const applications=application_results.rows;
  
  res.render("rmain.ejs",{un:un,info:info,key:"del",applications:applications})
  }
  catch(err){
    console.log(err);
  }
})


app.post("/viewmore/:proj_name/:key/:un",async(req,res)=>{
  const proj_name=req.params.proj_name;
  const un=req.params.un;

  const key=req.params.key;
  try {
    const result_proj_posts=await db.query("SELECT project_posts.id, username, proj_name,proj_des, proj_pay,proj_dur FROM recruiters JOIN project_posts ON recruiters.id=project_id WHERE project_posts.proj_name=$1",[proj_name]);
    const proj_info=result_proj_posts.rows;
    const result_proj_skills=await db.query("SELECT skill FROM project_posts JOIN project_skills ON project_posts.id=skill_id WHERE project_posts.proj_name=$1",[proj_name]);
    const skills=result_proj_skills.rows;
    

    res.render("viewmore.ejs",{proj_info:proj_info,skills:skills,key:key,un:un,err_msg:[]})

  } catch (error) {
    console.log(error);
  }
})

app.post("/del/:proj_name",async(req,res)=>{
  const proj_name=req.params.proj_name;
  

  try {
    const result_projectid=await db.query("SELECT id FROM project_posts WHERE project_posts.proj_name=$1 ",[proj_name]);
    const project_postID=result_projectid.rows[0].id;
    await db.query("DELETE FROM project_skills WHERE project_skills.skill_id=$1",[project_postID]);
    await db.query("DELETE FROM project_posts WHERE project_posts.id=$1 ",[project_postID]);
   
    
  } catch (error) {
    console.log(error);
  }
})


app.get('/apply/:proj_name/:un',async(req,res)=>{
  const proj_name=req.params.proj_name;
  const col_name=req.params.un;
  console.log(proj_name,col_name);
  try {
    const result_recID=await db.query("SELECT recruiters.id FROM recruiters JOIN project_posts ON recruiters.id = project_id WHERE project_posts.proj_name=$1",[proj_name]);
    const rec_id=result_recID.rows[0].id;
    await db.query("INSERT INTO applications (proj_name,col_name,application_id) VALUES ($1, $2, $3)",[proj_name,col_name,rec_id])
  } catch (error) {
    console.log(error);
    res.send('ALREADY APPLIED')
  }

})


app.get("/del/:proj_name/:col_name",async(req,res)=>{
  const proj_name=req.params.proj_name;
  const col_name=req.params.col_name;
  

  try {
  
    await db.query("DELETE FROM applications WHERE applications.proj_name=$1 AND applications.col_name=$2",[proj_name,col_name]);
  
    
  } catch (error) {
    console.log(error);
  }
});

app.post("/:un/filter_skill",async(req,res)=>{
  const skill=req.body.skill;
  const un=req.params.un;
  console.log(skill.replace(/ /g,''));
  try {
    const result_posts=await db.query("SELECT proj_name,proj_pay,proj_dur,skill FROM project_posts JOIN project_skills ON project_posts.id = skill_id WHERE LOWER(skill) LIKE '%' || $1 || '%'",[skill.toLowerCase().replace(/ /g,'')])
    
    const notifications_results=await db.query("SELECT * FROM project_posts JOIN workforce ON project_posts.id = workforce_id WHERE workforce.name=$1",[un]);
                const notifications=notifications_results.rows;
    const info=result_posts.rows;
    res.render("cmain.ejs",{un:un,info:info,key:'not_del',notifications:notifications})
    
    
  } catch (error) {
    console.log(error);
  }
});

app.get("/approve/:name/:proj_name",async(req,res)=>{
  let id;
  const name=req.params.name;
  const proj_name=req.params.proj_name;
  console.log(name,proj_name)
  try {
    const result_id=await db.query("SELECT id FROM project_posts WHERE project_posts.proj_name LIKE '%' || $1 || '%'",[proj_name]);
    id=result_id.rows[0].id;
    console.log(id);
    await db.query("INSERT INTO workforce (name,workforce_id) VALUES ($1,$2)",[name,id]);
    await db.query("DELETE FROM applications WHERE applications.proj_name LIKE '%' || $1 || '%' AND applications.col_name=$2",[proj_name,name]);
  } catch (error) {
    console.log(error);

  }

});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
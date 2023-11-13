const express = require('express');
const bodyParser=require('body-parser');
const app=express();
const urlencoderParser=bodyParser.urlencoded({extended:false});
const exphbs=require('express-handlebars');
const { MongoClient, ServerApiVersion } = require('mongodb');

let logado = false;

const uri = "mongodb+srv://claudiom:9ol8ik7uj@cluster0.umdkzva.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




const PORT = process.env.PORT || 80;

//Template engine
app.engine("handlebars",exphbs.engine({defaultLayout:'main'}));
app.set('view engine','handlebars');


app.get('/', function (req,res) {
  res.render('landingpage');
});

app.get('/loginpage', function (req, res){
  res.render('login');

});

app.get('/criarusuario', function (req,res){
  res.render('criarusuario');
});

app.post('/criar',urlencoderParser, async function (req,res) {
  let usuario = {login:req.body.usuario,senha:req.body.senha};
  try{
    await client.connect();
    if(await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").findOne({login:usuario.login})==null){
      await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").insertOne(usuario);
      res.redirect("/loginpage");
    } else {
      let mensagem = "Usuario ja existe!!!";
      res.render('criarusuario',{mensagem:mensagem});
    }
  } catch(ex){
    console.log(ex)
  } finally {
    await client.close();
  }
});

app.post('/login',urlencoderParser, async function (req,res){
  try{
    let usuario = {login:req.body.usuario,senha:req.body.senha};
    await client.connect();
    if(await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").findOne({login:usuario.login})!=null){
      let usuario2 = await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").findOne({login:usuario.login});
      if(usuario.senha == usuario2.senha){
        logado = true;
        console.log(logado);
        res.redirect('/listagem');
      } else {
        let mensagem = "Senha incorreta";
        res.render("login",{mensagem:mensagem});
      }
    } else {
      let mensagem = "Usuario inexistente!!"
      res.render("login",{mensagem:mensagem});
    }
  } catch(err){
    console.log(err);
  } finally{
    await client.close();
  }

});

app.get('/listagem',urlencoderParser, async function(req,res){
  try{
    await client.connect();
    if(logado){
      let resultados = await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").find({},{projection:{_id:0,login:1}}).toArray();
      res.render('listagem',{data:resultados});
    } else {
      console.log('Voce precisa estar logado');
      await client.close();
    }

  }catch(err){
    console.log(err);
  }


});

app.get('/deletar/:lg',urlencoderParser, async function(req,res){

  try{
    await client.connect();
    if(logado){
      await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").deleteOne({login:req.params.lg});
      res.redirect('back');
    } else {
      console.log("Voce precisa estar logado");
    }
  } catch(err){
    console.log(err);
  } finally{
    await client.close();
  }
});

app.get("/alterar/:lg",urlencoderParser, async function(req, res){
  try{
    await client.connect();
    if(logado){
      let resultado = await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").findOne({login:req.params.lg});
      res.render("alterar", {data:resultado});
    }
  }catch(err){
    console.log(err);
  } finally{
    await client.close();
  }

});

app.post("/alterar/update",urlencoderParser, async function(req,res){
  try{
    await client.connect();
    if (logado) {
      await client.db("trabalho_desenvolvimento_web").collection("listagem_alunos").findOneAndUpdate(
        {login:req.body.login},
        {$set:{senha:req.body.novasenha}},
        {returnOriginal:false}
      );
    }
  } catch(err){
    console.log(err);
  } finally{
    await client.close();
  }

});


app.listen(PORT);
console.log('Escutando na porta: ' + PORT);

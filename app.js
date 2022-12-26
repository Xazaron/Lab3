//Dmytro Hordienko SMP Lab3
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient
("mongodb://localhost:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));

// підключення до бази даних 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("seriessdb")
    .collection("seriess");
    app.listen(3000, function(){
        console.log("Сервер чекає на підключення...");
    });
});

// для отримання seriess
app.get("/api/seriess", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, seriess){
         
        if(err) return console.log(err);
        res.send(seriess)
    });
     
});
// для отримання series
app.get("/api/seriess/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, series){
               
        if(err) return console.log(err);
        res.send(series);
    });
});

// для додавання series в базу даних
app.post("/api/seriess", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const seriesName = req.body.name;
    const seriesDirector = req.body.director;
    const seriesGenre = req.body.genre;
    const seriesDate = req.body.date; 
    const series = {name: seriesName, director: seriesDirector, 
        genre: seriesGenre, date: seriesDate};
       
    const collection = req.app.locals.collection;
    collection.insertOne(series, function(err, result){
               
        if(err) return console.log(err);
        res.send(series);
    });
});

// для вилучення series із бази даних
app.delete("/api/seriess/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let series = result.value;
        res.send(series);
    });
});

// для оновлення інформації про series
app.put("/api/seriess", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const seriesName = req.body.name;
    const seriesDirector = req.body.director;
    const seriesGenre = req.body.genre;
    const seriesDate = req.body.date; 
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {name: seriesName, 
        director: seriesDirector, genre: seriesGenre, date: seriesDate}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const series = result.value;
        res.send(series);
    });
});
 
// цей фрагмент очікує на завершення роботи (Ctrl+C) 
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});

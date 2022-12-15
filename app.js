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
    app.locals.collection = client.db("songsdb")
    .collection("songs");
    app.listen(3000, function(){
        console.log("Сервер чекає на підключення...");
    });
});

// для отримання книг
app.get("/api/songs", function(req, res){
        
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, tracks){
         
        if(err) return console.log(err);
        res.send(tracks)
    });
     
});
// для отримання книги
app.get("/api/songs/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, track){
               
        if(err) return console.log(err);
        res.send(track);
    });
});

// для додавання книги в базу даних
app.post("/api/songs", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const trackName = req.body.name;
    const trackAuthor = req.body.author;
    const trackGenre = req.body.genre;
    const trackDate = req.body.date; 
    const track = {name: trackName, author: trackAuthor, 
        genre: trackGenre, date: trackDate};
       
    const collection = req.app.locals.collection;
    collection.insertOne(track, function(err, result){
               
        if(err) return console.log(err);
        res.send(track);
    });
});

// для вилучення книги із бази даних
app.delete("/api/songs/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let track = result.value;
        res.send(track);
    });
});

// для оновлення інформації про книгу
app.put("/api/songs", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const trackName = req.body.name;
    const trackAuthor = req.body.author;
    const trackGenre = req.body.genre;
    const trackDate = req.body.date; 
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {name: trackName, 
        author: trackAuthor, genre: trackGenre, date: trackDate}},
         {returnOriginal: false },function(err, result){
               
        if(err) return console.log(err);     
        const track = result.value;
        res.send(track);
    });
});
 
// цей фрагмент очікує на завершення роботи (Ctrl+C) 
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
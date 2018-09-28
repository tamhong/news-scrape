//Require NPM Packages

const express = require ("express");
const bodyParser = require ("body-parser");
const exphbs = require("express-handlebars");
const mongoose = require ("mongoose");
const cheerio = require ("cheerio");
const request = require ("request");

//Require Mongoose Models

var db = require("./models");

const PORT = 3000;

//Initialize Express

const app = express();

//Body Parser for Form Submissions

app.use(bodyParser.urlencoded({ extended: true}));

//Set express static folder to public

app.use(express.static("public"));

app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);

app.set("view engine", "handlebars");

//Connect to MongoDB

mongoose.connect("mongodb://localhost/news_scraper_db", { useNewUrlParser: true});

app.get("/scrape", function (req, res) {
    request("https://www.nytimes.com/", function(error, response, html){
        const $ = cheerio.load(html);

        $("div .css-k8gosa").each(function(i, element) {
            const result = {};

            result.title = $(element)
                .children(".css-8uvv5f")
                .text();
            result.link = $(element)
                .parent("a")
                .attr("href");
        
            // if (result.title) {console.log(result)};

            db.Article.create(result)
                .then (function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch (function (err) {
                    return res.json(err);
                });

        });

        res.send("Scrape Complete");
    });
});

app.get("/", function (req, res) {
    db.Article.find({}).sort({ scrapeDate: -1 })
        .then(function(dbArticle) {
            // res.json(dbArticle);
            var hbsObject = {
                articles: dbArticle
            };

            console.log(hbsObject);

            res.render("index", hbsObject);
            
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/notes", function (req, res) {
    db.Note.find({})
        .then(function(dbNote) {
            res.json(dbNote);
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
    .then(function(dbNote) {
        return db.Article
            .findOneAndUpdate(
                { _id: req.params.id },
                { note: dbNote._id },
                { new: true}
            );
    })
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.put("/articles/:id", function (req, res) {
    var id = req.params.id;

    db.Article.findOneAndUpdate (
        { _id: id },
        { $set: {saved: req.body.saved}},
        { new: true}
    ).then(function(dbArticle) {
        res.json(dbArticle)
    });
});

app.get("/saved", function (req, res) {
    db.Article.find({ saved: true }).sort({ scrapeDate: -1 })
        .populate("note")
        .then(function(dbArticle) {
            // res.json(dbArticle);
            var hbsObject = {
                articles: dbArticle
            };

            console.log(hbsObject);

            res.render("saved", hbsObject);
            
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.delete ("/notes/:id", function (req, res) {
    db.Note.deleteOne({ _id: req.params.id })
    .then(function (dbNote) {
        res.json(dbNote);
    });
});


app.listen(PORT, function() {
    console.log(`App running on port ${PORT}!`)
});


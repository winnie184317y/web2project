var bodyParser = require('body-parser');
var db = require('./services/dataservice.js');
var crypto = require('crypto');
db.connect();

var routes = function () {
    var router = require('express').Router();

    router.use(bodyParser.urlencoded({
        extended: true
    }));
    router.use(function(req,res,next){
        //only check for token if it is PUT, DELETE methods or it is POSTING to events
        if(req.method=="PUT" || req.method=="DELETE"
            || (req.method=="POST" && req.url.includes("/api"))) {
            var token = req.query.token;
            if (token == undefined) {
                res.status(401).send("No tokens are provided. You are not allowed to perform this action.");
            } else {
                db.checkToken(token, function (err, organizer) {
                    if (err || organizer == null) {
                        res.status(401).send("[Invalid token] You are not allowed to perform this action.");
                    } else {
                        //means proceed on with the request.
                        next();
                    }
                });
            }
        } else {    //all other routes will pass
            next();
        }
    })    
    router.get('/', function (req, res) {
        res.sendFile(__dirname + "/views/index.html");
    });
    router.get('/css/*', function(req, res)  {
        res.sendFile(__dirname+"/views/"+req.originalUrl);
    });
    router.get('/js/*', function(req, res)  {
        res.sendFile(__dirname+"/views/"+req.originalUrl);
    });
    router.post('/register', function (req, res) {
        var data = req.body;
        db.addPatients(data.firstName,data.lastName, data.gender, data.dob, data.contactNo, data.height, data.weight, data.username, data.password, function (err, patient) {
            if (err) {
                res.status(500).send("Unable to register a new patient");
            } else {
                res.status(200).send("Patient has been registered!");
            }
        })
    })
    router.get('/login', function (req, res) {
        res.sendFile(__dirname + "/views/login.html");
    });
    router.post('/login', function (req, res) {
        var data = req.body;
        db.login(data.username, data.password, function (err, user) {
            if (err) {
                res.status(401).send("Login unsucessful. Please try again later");
            } else {
                if (user == null) {
                    res.status(401).send("Login unsucessful. Please try again later");
                } else {
                    var strToHash = user.username + Date.now();
                    var token = crypto.createHash('md5').update(strToHash).digest('hex');
                    db.updateToken(user._id, token, function (err, user) {
                        res.status(200).json({ 'message': 'Login successful.', 'token': token });
                    });
                }
            }
        })
    });
    router.get("/logout", function (req, res) {
        var token = req.query.token;
        if (token == undefined) {
            res.status(401).send("No tokens are provided");
        } else {
            db.checkToken(token, function (err, user) {
                if (err || user == null) {
                    res.status(401).send("Invalid token provided");
                } else {
                    db.removeToken(user._id, function (err, user) { 
                        res.status(200).send("Logout successfully")
                    });
                }
            })
        }
    });
    router.get('/api/wards', function (req, res) {
        db.getWards(function(err,wards){
            if(err){
                res.status(500).send("Unable to get all wards");
            }else{
                res.status(200).send(wards);
            }
        });
    });
    router.get('/api/patients', function (req, res) {
        db.getPatients(function(err,patients){
            if(err){
                res.status(500).send("Unable to get all patients");
            }else{
                res.status(200).send(patients);
            }
        });
    });
    router.get('/api/doctors', function (req, res) {
        db.getDoctors(function(err,doctors){
            if(err){
                res.status(500).send("Unable to get all doctors");
            }else{
                res.status(200).send(doctors);
            }
        });
    });
    router.get('/api/appointments', function (req, res) {
        db.getAppointments(function(err,appointments){
            if(err){
                res.status(500).send("Unable to get all appointments");
            }else{
                res.status(200).send(appointments);
            }
        });
    });
    router.get('/api/patientsrecords', function (req, res) {
        db.getPatientsRecords(function(err,patientsrecords){
            if(err){
                res.status(500).send("Unable to get all patients records");
            }else{
                res.status(200).send(patientsrecords);
            }
        });
    });

    return router;
};

module.exports = routes();
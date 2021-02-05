var bodyParser = require('body-parser');
var db = require('./services/dataservice.js');
var crypto = require('crypto');
const e = require('express');
db.connect();

var routes = function () {
    var router = require('express').Router();

    router.use(bodyParser.urlencoded({
        extended: true
    }));
    router.use(function (req, res, next) {
        //only check for token if it is PUT, DELETE methods or it is POSTING to events
        if (req.method == "PUT" || req.method == "DELETE"
            || (req.method == "POST" && req.url.includes("/doctors"))
            || (req.method == "POST" && req.url.includes("/patients"))
            || (req.method == "POST" && req.url.includes("/appointments"))
            || (req.method == "POST" && req.url.includes("/patientsrecords"))
            || (req.method == "GET" && req.url.includes("/appointments/patients"))
            || (req.method == "GET" && req.url.includes("/api/patients"))
            || (req.method == "GET" && req.url.includes("/patientsrecords/patients"))) {
            var token = req.query.token;
            if (token == undefined) {
                res.status(401).send("No tokens are provided. You are not allowed to perform this action.");
            } else {
                db.checkToken(token, function (err, user) {
                    if (err || user == null) {
                        res.status(401).send("[Invalid token] You are not allowed to perform this action.");
                    } else {
                        //set a local variable to be used for the next route
                        res.locals.user = user;
                        //means proceed on with the request.
                        next();
                    }
                });
            }
        } else {
            //all other routes will pass
            next();
        }
    })
    router.get('/', function (req, res) {
        res.sendFile(__dirname + "/views/index.html");
    });
    router.get('/css/*', function (req, res) {
        res.sendFile(__dirname + "/views/" + req.originalUrl);
    });
    router.get('/js/*', function (req, res) {
        res.sendFile(__dirname + "/views/" + req.originalUrl);
    });
    router.get('/edit', function (req, res) {
        res.sendFile(__dirname + "/views/editApppointment.html");
    });
    router.get('/profile', function (req, res) {
        res.sendFile(__dirname + "/views/patientProfile.html");
    });
    //login, register, logout
    router.get('/register', function (req, res) {
        res.sendFile(__dirname + "/views/register.html");
    });
    router.post('/register', function (req, res) {
        var data = req.body;
        db.addPatients(data.firstName, data.lastName, data.gender, data.dob, data.contactNo, data.height, data.weight, data.username, data.password, function (err, patient) {
            if (err) {
                res.status(500).send("Unable to register a new patient");
            } else {
                res.status(200).send("Patient has been registered!");
            }
        })
    });
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
                    var token = crypto.createHash('sha256').update(strToHash).digest('hex');
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
                        res.status(200).send("Logout successfully");
                        res.sendFile(__dirname + "/views/index.html");
                    });
                }
            })
        }
    });
    //wards
    router.get('/api/wards', function (req, res) {
        db.getWards(function (err, wards) {
            if (err) {
                res.status(500).send("Unable to get all wards");
            } else {
                res.status(200).send(wards);
            }
        });
    });
    router.put('/api/wards', function (req, res) {
        var data = req.body;
        db.updateWards(data.id, data.numOfBeds, data.status, function (err, wards) {
            if (err) {
                res.status(500).send("Unable to update wards");
            } else {
                if (wards == null) {
                    res.status(200).send("No wards were updated");
                } else {
                    res.status(200).send("Ward updated");
                }
            }
        });
    });
    //patients
    router.get('/api/patients', function (req, res) {
        var patientId = res.locals.user._id;
        db.getPatients(patientId, function (err, patients) {
            if (err) {
                res.status(500).send("Unable to get all patients");
            } else {
                res.status(200).send(patients);
            }
        });
    });
    router.put('/api/patients', function (req, res) {
        var data = req.body;
        var patientId = res.locals.user._id;
        db.updatePatientsDetails(patientId, data.firstName, data.lastName, data.contactNo, data.height, data.weight, data.username, data.password, function (err, patient) {
            if (err) {
                res.status(500).send("Unable to update patients particular");
            } else {
                res.status(200).send("Patient particular updated");
            }
        });
    });
    //doctors
    router.get('/api/doctors', function (req, res) {
        db.getDoctors(function (err, doctors) {
            if (err) {
                res.status(500).send("Unable to get all doctors");
            } else {
                res.status(200).send(doctors);
            }
        });
    });
    //appointments
    router.get('/api/appointments', function (req, res) {
        db.getAllAppointments(function (err, appointments) {
            if (err) {
                res.status(500).send("Unable to get all appointments");
            } else {
                res.status(200).send(appointments);
            }
        });
    });
    router.get('/api/appointments/patients', function (req, res) {
        var patientId = res.locals.user._id;
        db.getAllAppointmentsByPatientsId(patientId, function (err, appointments) {
            if (err) {
                res.status(500).send("Unable to get appointments");
            } else {
                if (appointments == null) {
                    res.status(200).send("No Appointments booked");
                } else {
                    res.status(200).send(appointments);
                }
            }
        });
    });
    router.get('/api/appointments/:id', function (req, res) {
        var id = req.params.id;
        db.getAllAppointmentsById(id, function (err, appointments) {
            if (err) {
                res.status(500).send("Unable to get appointments");
            } else {
                res.status(200).send(appointments);
            }
        });
    });
    router.post('/api/appointments', function (req, res) {
        var data = req.body;
        var patientId = res.locals.user._id;
        db.addAppointment(patientId, data.startTime, data.endTime, function (err, appointments) {
            if (err) {
                res.status(500).send("Unable to add appointment");
            } else {
                res.status(200).send("Appointment made");
            }
        });
    });
    router.put('/api/appointments', function (req, res) {
        var data = req.body;
        db.updateAppointmentsById(data.id, data.startTime, data.endTime, data.totalTimeTaken, data.totalFees, data.govtSubsidy, data.netFees, function (err, appointments) {
            if (err) {
                res.status(500).send("Unable to update appointment");
            } else {
                res.status(200).send("Appointment updated");
            }
        });
    })
    //patientsrecords
    router.get('/api/patientsrecords', function (req, res) {
        db.getAllPatientsRecords(function (err, patientsrecords) {
            if (err) {
                res.status(500).send("Unable to get all patients records");
            } else {
                res.status(200).send(patientsrecords);
            }
        });
    });
    router.get('/api/patientsrecords/patients', function(req, res){
        var patientId = res.locals.user._id;
        db.getPatientsRecordsByPatientsId(patientId, function(err, patients){
            if(err){
                res.status(500).send("Unable to get patient records");
            }else{
                res.status(200).send(patients);
            }
        });
    });
    router.post('/api/patientsrecords', function(req, res){
        var data = req.body;
        var patientId = res.locals.user._id;
        db.addPatientsRecords(patientId, data.medicalCondition, data.admissionDate, data.updatedBy, function(err, patientsRecords){
            if(err){
                res.status(500).send("Unable to add patients records");
            }else{
                res.status(200).send("Patients records added");
            }
        });
    });
    router.put('/api/patientsrecords', function(req, res){
        var data = req.body;
        db.updatePatientsRecordsById(data.id, data.medicalCondition, data.admissionDate, data.updatedBy, function(err, patientrecords){
            if(err){
                res.status(500).send("Unable to update patients records");
            }else{
                res.status(200).send("Patients records updated");
            }
        });
    });

    return router;
};

module.exports = routes();
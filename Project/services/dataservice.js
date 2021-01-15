var mongoose = require('mongoose');
var schema = mongoose.Schema;
var wardsScema = {};
var patientsScema = {};
var doctorsSchema = {};
var appointmentsScema = {};
var patientrecordsSchema = {};
var wardsModel, patientsModel, doctorsModel, appointmentsModel, patientrecordsModel;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('debug', true);

var database = {
    connect: function(){
        mongoose.connect('mongodb://localhost:27017/healthDB', function(err){
            if(err==null){
                console.log("Connected to Mongo DB");
                //initialize values
                var connection = mongoose.connection;
                //wards
                wardsScema = schema({
                    wardClass:String,
                    numofBeds:String,
                    status:Array
                });
                wardsModel = connection.model('wards', wardsScema);
                //patients
                patientsScema = schema({
                    _apptid:String,
                    firstName:String,
                    lastName:String,
                    gender:String,
                    dob:String,
                    contactNo:String,
                    height:String,
                    weight:String,
                    wardNo:String,
                    username:String,
                    password:String,
                    token: String
                });
                patientsModel = connection.model('patients', patientsScema);
                //doctors
                doctorsSchema = schema({
                    firstName:String,
                    lastName:String,
                    gender:String,
                    specialisation:String,
                    qualification:String,
                    email:String,
                    designation:String,
                    onDutyRoomNo:String
                });
                doctorsModel = connection.model('doctors', doctorsSchema);
                //appointments
                appointmentsScema = schema({
                    _docid:String,
                    _patientid:String,
                    startTime:String,
                    endTime:String,
                    totalTimeTaken:Number,
                    totalFees:Number,
                    govtSubsidy:String,
                    netFees:Number
                });
                appointmentsModel = connection.model('appointments', appointmentsScema);
                //patientrecords
                patientrecordsSchema = schema({
                    _patientid:String,
                    medicalCondition:String,
                    admissionDate:String,
                    updatedBy:String
                });
                patientrecordsModel = connection.model('patients_records', patientrecordsSchema);
            }else{
                console.log("Error connecting to Mongo DB");
            }
        })
    },
    login: function (u, p, callback) {
        patientsModel.findOne({ username: u, password: p }, callback);
    },
    updateToken: function (id, token, callback) {
        patientsModel.findByIdAndUpdate(id, { token: token }, callback);
    },
    checkToken: function(token,callback) {
        patientsModel.findOne({token:token},callback);
    },
    removeToken: function(id,callback) {
        patientsModel.findByIdAndUpdate(id, {$unset: {token: 1}},callback);
    },
    //wards
    getWards: function(callback){
        wardsModel.find({}, callback);
    },
    updateWards: function(id, nb, s, callback){
        var updatedWards = {
            numofBeds:nb,
            status:s
        };
        wardsModel.findByIdAndUpdate(id, updatedWards, callback);
    },
    //patients
    getPatients: function(callback){
        patientsModel.find({}, callback);
    },
    addPatients: function(fn, ln, g, d, c, h, w, u, p, callback){
        var newPatient = new patientsModel({
            firstName:fn,
            lastName:ln,
            gender:g,
            dob:d,
            contactNo:c,
            height:h,
            weight:w,
            username:u,
            password:p,
        });
        newPatient.save(callback);
    },
    updatePatientsDetails: function(id, aid, fn, ln, c, h, w, wn, callback){
        var updatedPatientsDetails = {
            _apptid:aid,
            firstName:fn,
            lastName:ln,
            contactNo:c,
            height:h,
            weight:w,
            wardNo:wn
        };
        wardsModel.findByIdAndUpdate(id, updatedPatientsDetails, callback);
    },
    //doctors
    getDoctors: function(callback){
        doctorsModel.find({}, callback);
    },
    updateDoctorsDetails: function(id, fn, ln, s, q, e, d, odrn, callback){
        var updatedDoctorsDetails = {
            firstName:fn,
            lastName:ln,
            specialisation:s,
            qualification:q,
            email:e,
            designation:d,
            onDutyRoomNo:odrn
        };
        wardsModel.findByIdAndUpdate(id, updatedDoctorsDetails, callback);
    },
    //appointments
    getAllAppointments: function(callback){
        appointmentsModel.find({}, callback);
    },
    getAllAppointmentsById: function(id, callback){
        appointmentsModel.findById(id, callback);
    },
    addAppointment: function(did, pid, st, et, ttt, tf, gs, nf, callback){
        var addAppintment = new appointmentsModel({
            _docid:did,
            _patientid:pid,
            startTime:st,
            endTime:et,
            totalTimeTaken:ttt,
            totalFees:tf,
            govtSubsidy:gs,
            netFees:nf
        });
        addAppintment.save(callback);
    },
    updateAppointmentsById: function(id, did, pid, st, et, ttt, tf, gs, nf, callback){
        var updatedAppintment = {
            _docid:did,
            _patientid:pid,
            startTime:st,
            endTime:et,
            totalTimeTaken:ttt,
            totalFees:tf,
            govtSubsidy:gs,
            netFees:nf
        }
        appointmentsModel.findByIdAndUpdate(id, updatedAppintment, callback);
    },
    //patients records
    getAllPatientsRecords: function(callback){
        patientrecordsModel.find({}, callback);
    },
    getPatientsRecordsById: function(id, callback){
        patientrecordsModel.findById(id, callback);
    },
    updatePatientsRecordsById: function(id, pid, mc, ad, ub, callback){
        var updatedMedicalRecord = {
            _patientid:pid,
            medicalCondition:mc,
            admissionDate:ad,
            updatedBy:ub
        }
        patientrecordsModel.findByIdAndUpdate(id, updatedMedicalRecord, callback);
    },
};

module.exports = database;
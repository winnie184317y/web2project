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
                    numOfBeds:String,
                    status:String
                });
                wardsModel = connection.model('wards', wardsScema);
                //patients
                patientsScema = schema({
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
                    _docid:{
                        type: schema.Types.ObjectId,
                        ref: 'doctors'
                    },
                    _patientid:{
                        type: schema.Types.ObjectId,
                        ref: 'patients'
                    },
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
                    _patientid:{
                        type: schema.Types.ObjectId,
                        ref: 'patients'
                    },
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
    //logins
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
            numOfBeds:nb,
            status:s
        };
        wardsModel.findByIdAndUpdate(id, updatedWards, callback);
    },
    //patients
    getAllPatient: function(callback){
        patientsModel.find({}, callback);
    },
    getPatients: function(pid, callback){
        patientsModel.find({_id: pid}, callback);
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
    updatePatientsDetails: function(id, fn, ln, c, h, w, u, p, callback){
        var updatedPatientsDetails = {
            firstName:fn,
            lastName:ln,
            contactNo:c,
            height:h,
            weight:w,
            password: p,
            username: u
        };
        patientsModel.findByIdAndUpdate(id, updatedPatientsDetails, callback);
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
    getAllAppointmentsByPatientsId: function(pid, callback){
        // appointmentsModel.findOne({_patientid: pid}, callback);
        appointmentsModel.find({_patientid: pid}).populate('_docid', ['firstName', 'lastName']).exec(callback);
    },
    addAppointment: function(pid, st, et, callback){
        var addAppintment = new appointmentsModel({
            _patientid:pid,
            startTime:st,
            endTime:et
        });
        addAppintment.save(callback);
    },
    updateAppointmentsById: function(id, st, et, ttt, tf, gs, nf, callback){
        var updatedAppintment = {
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
    getPatientsRecordsByPatientsId: function(pid, callback){
        patientrecordsModel.findOne({_patientid: pid}).populate('_patientid', ['firstName', 'lastName']).exec(callback);
    },
    addPatientsRecords: function(pid, mc, ad, ub, callback){
        var newPatientsRecords = new patientrecordsModel({
            _patientid: pid,
            medicalCondition: mc,
            admissionDate: ad,
            updatedBy: ub
        });
        newPatientsRecords.save(callback);
    },
    updatePatientsRecordsById: function(id, mc, ad, ub, callback){
        var updatedMedicalRecord = {
            medicalCondition:mc,
            admissionDate:ad,
            updatedBy:ub
        }
        patientrecordsModel.findByIdAndUpdate(id, updatedMedicalRecord, callback);
    },
};

module.exports = database;
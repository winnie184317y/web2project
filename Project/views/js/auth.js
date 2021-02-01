$(document).ready(function(){
    // handles the clicking of the logout function
    $(".logoutLink").click(function(e){
        //prevents the browser from navigating to "#", as defined by the <a href> tag
        e.preventDefault();
        
        $.ajax({
            url: "/logout?token="+sessionStorage.authToken,
            method:"get"
        })
        .done(function(data){
            sessionStorage.removeItem("authToken");
            //go to homepage
            window.location.href="/";
        })
        .fail(function(err){
            console.log(err.responseText);
        })
    })
});
function login() {
    var credentials = {
        username: $("#username").val(),
        password: $("#password").val()
    }
    $.ajax({
        url:"/login",
        method:"post",
        data:credentials
    })
    .done(function(data){
        //$(".statusMessage").text(data.message);
        sessionStorage.authToken=data.token;
        document.location.href = '../';
    })
    .fail(function(err){
        $(".statusMessage").text(err.responseText);
    })
    return false;
}
function register() {
    var newPatient = {
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        gender: $("#gender").val(),
        dob: $("#dob").val(),
        contactNo: $("#contactNo").val(),
        height: $("#height").val(),
        weight: $("#weight").val(),
        username: $("#username").val(),
        password: $("#password").val()
    }
    $.ajax({
        url: "/register",
        method: "post",
        data: newPatient
    })
    .done(function(data){
        alert(data);
        document.location.href = '../';
    })
    .fail(function (err){
        $(".statusMessage").text(err);
    })
    return false;
}
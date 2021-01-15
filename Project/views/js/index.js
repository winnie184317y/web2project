$(document).ready(function() {
    var token = sessionStorage.authToken;
    if(token==undefined) {
        $(".protectedSection").hide();
        $(".unprotectedSection").show();
    } else {
        $(".protectedSection").show();
        $(".unprotectedSection").hide();
    }

    $(".logoutBtn").click(function(){
        $.ajax({
            url: "/logout?token="+sessionStorage.authToken,
            method:"get"
        })
        .done(function(data){
            sessionStorage.removeItem("authToken");
            location.reload();
        })
        .fail(function(err){
            console.log(err.responseText);
        })
    });    
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
        $(".statusMessage").text(data.message);
        //stores the token returned from the server, if successful login
        sessionStorage.authToken=data.token; 
        document.location.href = '../';
    })
    .fail(function(err){
        $(".statusMessage").text(err.responseText);
    })
    return false;
};
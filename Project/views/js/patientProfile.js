$(document).ready(function() {
    var token = sessionStorage.authToken;
    $.ajax({
        url: "/api/patients?token="+sessionStorage.authToken,
        method: "get"
    }).done(
        function (data) {
            console.log(data);
            for(var i = 0; i < data.length; i++){
                $('#firstName').val(data[i].firstName);
                $('#lastName').val(data[i].lastName);
                $('#contactNo').val(data[i].contactNo);
                $('#height').val(data[i].height);
                $('#weight').val(data[i].weight);
                $('#username').val(data[i].username);
                $('#password').val(data[i].password);
            }
        }
    ).fail(
        function (err) {
            console.log(err.responseText);
        }
    );
});

function Profile() {
    var patient = {
        firstName: $("#firstName").val(),
        lastName: $("#lastName").val(),
        contactNo: $("#contactNo").val(),
        height: $("#height").val(),
        weight: $("#weight").val(),
        username: $("#username").val(),
        password: $("#password").val()
    };
    $.ajax(
        {
            url: '/api/patients?token='+sessionStorage.authToken,
            method: 'put',
            data: patient
        }
    ).done(function (data) {
        alert("Profile updated!");
        document.location.href = '../';
    })
    .fail(
        function (err) {
           console.log(err.responseText);
        }
    );
    return false;
}
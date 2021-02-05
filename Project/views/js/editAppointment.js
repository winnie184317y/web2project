var appointmentId = 0;
$(document).ready(function() {
    var token = sessionStorage.authToken;
    if (token == undefined) {
        $(".logoutLink").hide();
        $(".profile").hide();
        $(".login").show();
        $(".register").show()
    } else {
        $(".logoutLink").show();
        $(".profile").show();
        $(".login").hide();
        $(".register").hide()
    }
    var urlParams = new URLSearchParams(window.location.search);
    appointmentId = urlParams.get('id');

    $.ajax({
        url: "/api/appointments/" + appointmentId,
        method: "get"
    }).done(
        function (data) {
            $('#startTime').val(data.startTime);
            $('#endTime').val(data.endTime);
        }
    ).fail(
        function (err) {
            console.log(err.responseText);
        }
    );
});

function editAppointment() {
    var appointment = {
        id: appointmentId,
        startTime: $("#startTime").val(),
        endTime: $("#endTime").val()
    };
    $.ajax(
        {
            url: '/api/appointments?token='+sessionStorage.authToken,
            method: 'put',
            data: appointment
        }
    ).done(
        function (data) {
            alert(data);
            document.location.href = '../';
        }
    ).fail(
        function (err) {
           console.log(err.responseText);
        }
    );
    return false;
}
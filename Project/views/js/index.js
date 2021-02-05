$(document).ready(function () {
    var token = sessionStorage.authToken;
    if (token == undefined) {
        $(".protectedSection").hide();
        $(".logoutLink").hide();
        $(".profile").hide();
        $(".unprotectedSection").show();
        $(".login").show();
        $(".register").show()
    } else {
        $(".protectedSection").show();
        $(".logoutLink").show();
        $(".profile").show();
        $(".unprotectedSection").hide();
        $(".login").hide();
        $(".register").hide()
    }

    $.ajax({
        url: "/api/appointments/patients?token="+sessionStorage.authToken,
        method: "get"
    })
    .done(function(data){
        // console.log(typeof(data));
        if(data == null){
            $(".statusmessage").text(data);
        }else{
            data.forEach(function(appointment) {
                // console.log(appointment);
                if(appointment.totalTimeTaken != null){
                    $(".appointments").append(`
                        <article>
                            <p>
                                <a href="/edit?id=${appointment._id}">History</a><br>
                                Doctor Time: ${appointment._docid.firstName} ${appointment._docid.lastName}<br>
                                Start Time: ${appointment.startTime}<br>
                                End Time: ${appointment.endTime}<br>
                                Total Time Taken: ${appointment.totalTimeTaken}<br>
                                Total Fees: ${appointment.totalFees}<br>
                                Govt Subsidy: ${appointment.govtSubsidy}<br>
                                Net Fees: ${appointment.netFees}<br>
                            </p>
                        </article>
                    `);
                }else{
                    $(".appointments").append(`
                        <article>
                            <p>
                                <a href="/edit?id=${appointment._id}">Upcoming Development</a><br>
                                Start Time: ${appointment.startTime}<br>
                                End Time: ${appointment.endTime}<br>
                            </p>
                        </article>
                    `)
                }
            });
        }
    })
    .fail(
        function (err) {
            console.log(err);
        }
    )
    $(".bookAppointment").click(function () {
        $(".bookNewAppointment").show();
    })
})
function bookAppointment() {
    var newAppointment = {
        startTime: $("#startTime").val(),
        endTime: $("#endTime").val()
    };

    $.ajax({
        url:"/api/appointments?token="+sessionStorage.authToken,
        method:"POST",
        data: newAppointment
    })
    .done(function(data){
        $(".statusMessage").text(data);
        setTimeout(function(){
            location.reload();
        },3000);
    })
    .fail(function(err){
        $(".statusMessage").text("Unable to add new event");
    })
    return false;
}
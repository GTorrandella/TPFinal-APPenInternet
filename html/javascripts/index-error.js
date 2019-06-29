$('.error').hide()

function make_login_query(){
    var url = "/checkLogin?"
    url = url + "email=" + $("#lEmail").val() + '&'
    url = url + "password=" + $("#lPass").val()
    return url
}

function make_registration_query(){
    var url = "/checkRegistration?"
    url = url + "email=" + $("#rEmail").val() + '&'
    url = url + "name=" + $("#rUser").val() + '&'
    url = url + "password=" + $("#rPass").val() + '&'
    url = url + "confirmation_password=" + $("#rCPass").val()
    return url
}

function manage_errors(error){
    if (this == 'register'){
        if (error.param == 'email' && error.msg == "Must be an Email"){
            $('#wrong-registration-email').show()
        }
        else if(error.param == 'email' && error.msg == "Already existing user"){
            $('#wrong-registration-user').show()
        }
        else if(error.param == 'password'){
            $('#wrong-registration-password').show()
        }
        else if(error.param == 'confirmation_password'){
            $('#no-duplicate-passwords').show()
        }
    }
    else if(this == 'login'){
        $('#wrong-log-in-email').show()
    }
}

$('#login-form').submit(
    function(event){
        $('.error').hide()
        var xml = new XMLHttpRequest()
        url = make_login_query()
        xml.open("POST", url, false)
        xml.send()

        if (xml.status == 422){
            response = JSON.parse(xml.responseText)
            response.errors.forEach(manage_errors, 'login')
            event.preventDefault()
        }
        else {return}
    }
)

$('#registration-form').submit(
    function(event){
        $('.error').hide()
        var xml = new XMLHttpRequest()
        url = make_registration_query()
        xml.open("POST", url, false)
        xml.send()

        if (xml.status == 422){
            response = JSON.parse(xml.responseText)
            response.errors.forEach(manage_errors, 'register')
            event.preventDefault()
        }
        else {return}
    }
)
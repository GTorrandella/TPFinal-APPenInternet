$("#logout").click(function (){
    var xml = new XMLHttpRequest();
    xml.open("get", "http://localhost:8080/logout", true)
    xml.send()
    window.location.replace("index.html")
})
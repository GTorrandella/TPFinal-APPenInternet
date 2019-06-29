$("#logout").click(function (){
    var xml = new XMLHttpRequest();
    xml.open("GET", "/logout", true)
    xml.send()
    window.location.replace("index.html")
})
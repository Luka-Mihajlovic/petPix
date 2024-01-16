function moveNotif(time){
    document.getElementById("notifSlot").style.top = "12%";
    setTimeout(() => {
        document.getElementById("notifSlot").style.top = "-12%";
    }, time);
}

function popUp(notifText = "Sorry, something went wrong.", time=2){
    document.getElementById("notifSlot").innerHTML = notifText;
    moveNotif(time*1000);
}
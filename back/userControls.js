//brother u gotta hack up the drobpdown to disable so much shit (grey screen inactivty set the zindex low + disable the button for new posts)
var dominantScreenIDs = ["registerHolder", "loginHolder"]

function toggleGreyOut(){
    dominantScreenIDs.forEach(elem => {
        if(!document.getElementById(elem).classList.contains("d-none")){
            document.getElementById(elem).classList.add("d-none");
        }
    });
}

function toggleMenu(target){
    toggleGreyOut()
    if(document.getElementById(target).classList.contains("d-none")){
        document.getElementById(target).classList.remove("d-none");
    }
}

var togglers = document.getElementsByClassName("dominantToggle");
for(let i=0;i<togglers.length;i++){
    togglers[i].addEventListener("click", toggleGreyOut);
}

document.getElementById("registerButton").addEventListener("click", function(){
    toggleMenu("registerHolder")
});

document.getElementById("loginButton").addEventListener("click", function(){
    toggleMenu("loginHolder")
});


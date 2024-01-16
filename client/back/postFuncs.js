const IMGPATH = "../db/imgs/"

function previewPic(){ //https://stackoverflow.com/questions/4459379/preview-an-image-before-it-is-uploaded
    var [file] = document.getElementById("imageUpload").files;
    
    if (file) {
        document.getElementById("previewPic").src = URL.createObjectURL(file);
        document.getElementById("previewPic").classList.remove("d-none");
    }
}

async function fillPostTemplate(post){

    var pContainer = document.getElementById("postsListing");

    for(let i=post.length-1;i>=0;i--){ //we go from the end ot the start because we're appending at the end
        let fUser = await axios.post("/findUserByKey", 
        {
            keyVal: post[i].posterId,
            keyName: "uid"
        });

        if(fUser.data.success){
            if(fUser.data.foundUser){ //did we even find anyone
                var ptext = post[i].pDesc.substring(0,50);
                if(ptext.length == 50){
                    ptext = ptext+"...";
                }
    
                var pt = post[i].pTitle.substring(0,25);
                if(pt.length == 25){
                    pt = pt+"...";
                }
    
                var newPost = `
                <div class="postHolder mx-auto" id="${post[i].pid}" onclick=loadPostView(this)>
                    <div class="d-flex flex-row justify-content-between mt-2">
                        <p class="mx-4">${"By: " + fUser.data.userObj.username}</p>
                        <p class="mx-4">${post[i].uploadDate}</p>
                    </div>
            
                    <div class="w-100 d-flex">
                        <img class="imagePreview" src="${IMGPATH + post[i].imageName}">
                    </div>
            
                    <div class="postDesc">
                        <div class="d-flex flex-column pictureInfoHolder">
                            <h1>${pt}</h1>
                            <p>${ptext}</p>
                        </div>
                    </div>
                </div>
                <br>
                `
        
                //https://stackoverflow.com/questions/7327056/appending-html-string-to-the-dom
                pContainer.insertAdjacentHTML("beforeend",newPost);
            }
        }else{
            popUp();
        }
    }
}

async function loadPostView(clickTarget){

    let gotPost = await axios.post("/findPostByKeys", 
    {
        keyVal:[clickTarget.id],
        keyName:["pid"]
    });

    if(gotPost.data.success){
        var postToFill = gotPost.data.postObj;

        var gotUser = await axios.post("/findUserByKey",
        {
            keyVal: postToFill.posterId,
            keyName: "uid"
        });
    
        if(gotUser.data.success){
            let delBut = document.getElementById("delPostButton");
            if(delBut != null){
                delBut.remove()
            }
            var usernameFill = gotUser.data.userObj.username;
            //fill out the temp screen's info while it's invisible
            document.getElementById("postInfoPoster").innerHTML = usernameFill;
            document.getElementById("postInfoDate").innerHTML = postToFill.uploadDate;
            document.getElementById("postInfoImg").src = (IMGPATH + postToFill.imageName);
            document.getElementById("postInfoTitle").innerHTML = postToFill.pTitle;
            document.getElementById("postInfoDesc").innerHTML = postToFill.pDesc;
            document.getElementById("postInfoLikeCount").innerHTML = postToFill.likes + " Likes";
        
            console.warn(postToFill.likedBy + ", " + localStorage.getItem("uId"));
            if(postToFill.likedBy.includes(localStorage.getItem("uId"))){
                document.getElementById("likePost").innerHTML = "UNLIKE POST";
            }else{
                document.getElementById("likePost").innerHTML = "LIKE POST";
            }
        
            document.getElementById("postInfoHolder").setAttribute("viewingId", postToFill.pid);

            if(gotUser.data.userObj.uid == localStorage.getItem("uId")){
                var delButton = `<a class="mb-2 mx-auto dominantToggle" id="delPostButton"> Delete Post </a>`;
                document.getElementById("postControlsHolder").insertAdjacentHTML("beforeend", delButton);

                document.getElementById("delPostButton").addEventListener("click", async function(){
                    let delpost = await axios.post('/delPost', 
                    {
                        sentBy: localStorage.getItem("uId"),
                        targetId: postToFill.pid 
                    });
                    if(delpost.data.success){
                        popUp("Deleted post successfully!", 3);
                        toggleGreyOut();
                        loadPosts();
                    }else{
                        popUp();
                    }
                });
            }
        
            toggleMenu("postInfoHolder");
        }else{
            popUp();
        }
    }else{
        popUp();
    }
}

function changeFiltering(newTarget){
    var dMenu = document.getElementById("dropdownMenu");

    for (let i=0;i<dMenu.querySelectorAll(".dropdown-item").length;i++){
        dMenu.querySelectorAll(".dropdown-item")[i].classList.remove("activeDropdown"); //clear all
    }

    dMenu.querySelector("#"+newTarget+"Filter").classList.add("activeDropdown"); //select the needed filter from what was clicked
    
    searchPosts();
}

function applyFilters(postList){
    var dMenu = document.getElementById("dropdownMenu");
    var selectedChild = dMenu.querySelector(".activeDropdown");

    switch(selectedChild.id){
        case("newFilter"):
            postList.sort((a, b) => { //mdn docs
                if(new Date(a.uploadDate).getTime() < new Date(b.uploadDate).getTime()){ //check the dates directly, we return a negative number since A<B
                    return -1;
                }
                if(new Date(a.uploadDate).getTime() > new Date(b.uploadDate).getTime()){ //positive number indicates A>B
                    return 1;
                }
                return 0; //equal
            });
            break;

        case("topFilter"):
            postList.sort((a, b) => { //mdn docs
                if(a.likes < b.likes){ //returning negative in a sorting function indicates that A<B
                    return -1;
                }
                if(a.likes > b.likes){ //positive number indicates A>B
                    return 1;
                }
                return 0; //equal
            });
            break;

        case("oldFilter"):
        postList.sort((a, b) => { //mdn docs
            if(new Date(a.uploadDate).getTime() < new Date(b.uploadDate).getTime()){ //check the dates directly, we return a negative number since A<B
                return 1;
            }
            if(new Date(a.uploadDate).getTime() > new Date(b.uploadDate).getTime()){ //positive number indicates A>B
                return -1;
            }
            return 0; //equal
        });
            break;

        case("likedFilter"):
            var likedArr = [];

            for(let i=0;i<postList.length;i++){
                if(postList[i].likedBy.includes(localStorage.getItem("uId"))){ //we loop through the array, if we find that it includes our username then we push it to a new array
                   likedArr.push(postList[i]); 
                }
            }

            postList = likedArr; //override postlist just because
        break;
    }

    return postList;
}

async function loadPosts(override = null){
    document.getElementById("postsListing").innerHTML = "<br>"; //reset it to what it was before, just a break
    var sortedArr;

    if(override == null){
        var pData = await axios.get('/posts');
        if(pData.data.success){
            sortedArr = applyFilters(pData.data.postslist.posts);
        }else{
            popUp();
        }
    }else{
        var pData = override;
        sortedArr = applyFilters(pData);
    }

    fillPostTemplate(sortedArr);
}

async function searchPosts(){
    var postSet = new Set(); //we make a set, we want to search for EACH key once at least, so we'll search the entire db for titles, tags, descriptions

    var pData = await axios.get('/posts');
    if(pData.data.success){
        var searchPrio = ["pTitle", "pTags", "pDesc"] //priority to make the algorithm return relevant results, posts show up if they include the term in TITLE > TAGS > DESCRIPTION

        var searchTerm = document.getElementById("postSearchBar").value;
        if(searchTerm == ""){
            loadPosts();
            return;
        }
        
        for(let i=0; i<searchPrio.length; i++){ //we loop multitple times instead of once because we want to order posts by priority, which is easiest if we add them in the proper order anyway
            for(let j=0; j<pData.data.postslist.posts.length; j++){
                if(pData.data.postslist.posts[j][searchPrio[i]].toLowerCase().includes(searchTerm.toLowerCase())){
                    postSet.add(pData.data.postslist.posts[j]);
                }
            }
        }
        
        var sortedPosts = applyFilters(Array.from(postSet)); //from mdn docs, convert to an array so it's familiar territory and easy to iterate thru

        loadPosts(sortedPosts.reverse()); //we reverse it because we've done it backwards related to regular post insertion
    }else{
        popUp();
    }
}

async function createPost(){
    var fData = new FormData();
    fData.append("postedBy", localStorage.getItem("uId"));
    fData.append("postTitle", document.getElementById("postTitle").value);
    fData.append("postDesc", document.getElementById("postDesc").value);
    fData.append("postTags", document.getElementById("postTags").value);
    fData.append("file", document.getElementById("imageUpload").files[0]);

    console.warn(fData);

    let createdPost = await axios.post('/createpost', fData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    if(createdPost.data.success){
        toggleGreyOut();
        loadPosts();
        popUp("Post successfully created!", 3);
    }else{
        popUp();
    }
}

async function addRemoveLike(){
    var likerId = localStorage.getItem("uId");

    //add like count to posts

    let gotPost = await axios.post("/findPostByKeys", 
    {
        keyVal:[document.getElementById("postInfoHolder").getAttribute("viewingId")],
        keyName:["pid"]
    });

    if(gotPost.data.success){
        if(gotPost.data.postObj.likedBy.includes(likerId)){ //if it's already liked, lets remove
            document.getElementById("likePost").innerHTML = "LIKE POST";
            gotPost.data.postObj.likedBy.pop(gotPost.data.postObj.likedBy.indexOf(likerId)); //pop the element where uId appears
    
            let editedPost = await axios.post("/editPost", {
                 targetPost: document.getElementById("postInfoHolder").getAttribute("viewingId"),
                 keyName: ["likedBy", "likes"],
                 newValue: [gotPost.data.postObj.likedBy, (gotPost.data.postObj.likes-1)]
            });
            if(editedPost.data.success){
                document.getElementById("postInfoLikeCount").innerHTML = gotPost.data.postObj.likes-1 + " Likes"
            }else{
                popUp();
            }
            
        }else{
            document.getElementById("likePost").innerHTML = "UNLIKE POST";
            gotPost.data.postObj.likedBy.push(likerId)
            let editedPost = await axios.post("/editPost", {
                 targetPost: document.getElementById("postInfoHolder").getAttribute("viewingId"),
                 keyName: ["likedBy", "likes"],
                 newValue: [gotPost.data.postObj.likedBy, (gotPost.data.postObj.likes+1)]
            });
            if(editedPost.data.success){
                document.getElementById("postInfoLikeCount").innerHTML = gotPost.data.postObj.likes+1 + " Likes"
            }else{
                popUp();
            }
        }
    }else{
        popUp();
    }
}

async function showPostBy(){
    var postId = document.getElementById("postInfoHolder").getAttribute("viewingid");
    if(postId != null){
        let gotPost = await axios.post("/findPostByKeys", 
        {
            keyVal:[postId],
            keyName:["pid"]
        });

        if(gotPost.data.success){
            if(loadProfileInfo(gotPost.data.postObj.posterId)){
                document.getElementById("postInfoHolder").classList.add("d-none");
                // document.getElementById("profileHolder").classList.remove("d-none");
                loadProfilePanel();
            }
        }else{
            popUp("Error fetching profile details.", 3);
        }
    }else{
        popUp("Error fetching profile details.", 3);
    }
}

document.getElementById("imageUpload").addEventListener("change", previewPic); 

//we create a variable tm so we can clear the timeout whenever new input is added to the search bar. if 0.7s passes, we call searchPosts since we can assume input has stopped
//average wpm is 38 - 40, looking at the lower bound, that's 1 word per ~0.63s, so we set the timeout to 0.7s as a safe assumption for when typing has stopped
var tm; 
document.getElementById("postSearchBar").addEventListener("input", ()=>{
    clearTimeout(tm); 
    tm = setTimeout(searchPosts, 700);
});

//event for pressing the enter key, instantly search posts and clear the timeout
document.getElementById("postSearchBar").addEventListener("keypress", (ev)=>{
    if(ev.key === "Enter"){ //thank you w3schools keypress event docs
        clearTimeout(tm); 
        searchPosts();
    }
});

//event for leaving the search box focus, instantly search and clear timeout
document.getElementById("postSearchBar").addEventListener("focusout", ()=>{
    clearTimeout(tm);
    searchPosts();
});


document.getElementById("createPost").addEventListener("click", createPost); 

document.getElementById("likePost").addEventListener("click", addRemoveLike); 

function loadHub(){
    loadPosts();
    document.getElementById("postSearchBar").value = "";
}

window.addEventListener("load", loadHub());

document.getElementById("newFilter").addEventListener("click", function(){
    changeFiltering("new");
}); 
document.getElementById("oldFilter").addEventListener("click", function(){
    changeFiltering("old");
}); 
document.getElementById("topFilter").addEventListener("click", function(){
    changeFiltering("top");
}); 
document.getElementById("likedFilter").addEventListener("click", function(){
    changeFiltering("liked");
}); 

document.getElementById("postInfoPoster").addEventListener("click", showPostBy);
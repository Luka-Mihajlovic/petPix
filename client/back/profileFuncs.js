/* global popUp:readonly, axios:readonly, loadPosts:readonly, logOut:readonly */
// ^ this declares any global variables and functions obtained through other javascript files, so that eslint may ignore
const addPetButton =
`
<div class="d-flex flex-row w-100 mt-5">
    <button class="btn btn-secondary mx-auto px-3 mb-2" type="button" id="addPetButton"> Add pet </button>
</div>
`

const noPetTemplate =
`
<section id="noPetStuff">
    <div class="w-100 d-flex">
        <span class="profileBig mx-auto">No pets on this profile, add some!</span>
    </div>

    <div class="d-flex flex-row w-100 mt-2">
        <button class="btn btn-secondary mx-auto px-3 mb-2" type="button" id="addPetButton"> Add pet </button>
    </div>
</section>
`

const petInputTemplate =
`
<section id="petInputSection">
    <div class="fakehr mt-2"> </div>
        <form class="d-flex flex-column w-100" id="petInputForm">
            <h1 class="mt-2 mx-auto"> Add Pet </h1>
            <input class="formInput h-50 mx-auto mt-1" type="text" placeholder="Pet name" id="petNameInput"> 
            <textarea class="formInput mx-auto mt-1" placeholder="Pet description, what are they like? How old are they?" id="petDescInput"></textarea>
            <span class="mx-auto d-none warningText" id="petInfoWarn"> Please fill out all fields.</span>
            <button class="btn btn-secondary mx-auto w-50 mt-1" type="button" onclick="addNewPet()"> Save </button>
            <a class="mt-1 mb-2 mx-auto" onclick="destroyWindow('petInputSection')"> Cancel </a>
        </form>
    <div class="fakehr mb-2"> </div>
</section>
`

const fullProfileTemplate =
`
<!-- profile info panel -->
<section>
    <div class="testContainer d-flex" id="profileHolder">
        <div class="mx-auto container my-auto d-flex flex-column justify-content-center postInfoUtility">
            <div class="d-flex flex-column postInfo mx-auto h-100">
                <div class="exitButton d-flex flex-column justify-content-center" onclick="destroyWindow('profileHolder')"> 
                    X
                </div>

                <div class="d-flex flex-row mt-2 w-90 px-5">
                    <span class="profileBig" id="profileName">Loading...</span>
                </div>

                <div class="mt-2 w-90 px-5 h-25">
                    <span class="profileBig h-25 w-100" id="postInfoPoster">Bio:</span>
                    <textarea class="w-100 h-50 profileBioContainer px-2 py-2" id="profileBio" readonly>Loading...</textarea>
                    <div class="d-flex flex-row h-25 w-100 mt-1" id="newBioHolder">
                        
                    </div>
                </div>
                <div class="fakehr my-2"></div>

                <div class="petArea w-90 h-75 flex-column">
                <div class="w-90 px-5">
                    <span class="profileBig w-100" id="postInfoPoster">Pets:</span>
                </div>
                    <div class="placeholderBlock" id="fullPetArea">
                        
                        <!--pets go here-->
                        
                    </div>
                </div>

                <div class="fakehr mt-2"></div>

                <div class="w-90 d-flex flex-row justify-content-between pb-2 mt-2" id="accControlHolder">
                    
                </div>

            </div>
        </div>
    </div>
</section>
`

function destroyWindow (target) {
  document.getElementById(target).remove()
}

async function removePet (pid) { // eslint-disable-line no-unused-vars
  let loadedProfile
  try {
    loadedProfile = await axios.get('/findUserByKey?keyVal=' + localStorage.getItem('uId') + '&keyName=uid')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  if (loadedProfile.data.success) {
    let removed = false
    for (let i = 0; i < loadedProfile.data.userObj.pets.length; i++) {
      if (loadedProfile.data.userObj.pets[i].petId === pid) {
        loadedProfile.data.userObj.pets.splice(i, 1) // remove the pet
        removed = true
      }
    }
    if (removed) {
      const newProfile = await axios.put('/users', {
        targetId: localStorage.getItem('uId'),
        newUserObj: loadedProfile.data.userObj
      })
      if (newProfile.data.success) {
        popUp('Pet successfully deleted!', 3)
        loadProfileInfo(localStorage.getItem('uId'))
      } else {
        popUp()
      }
    } else {
      popUp()
    }
  } else {
    popUp('Error deleting pet.', 3)
  }
}

async function addNewPet () { // eslint-disable-line no-unused-vars
  // make new api request: post/editUser, where we edit a certain user by index (?)
  let loadedProfile
  try {
    loadedProfile = await axios.get('/findUserByKey?keyVal=' + localStorage.getItem('uId') + '&keyName=uid')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  if (loadedProfile.data.success) {
    const id4 = await axios.get('/id') // invoke UUID4 on the client to get an ID for the pet. This isn't too secure, but we don't need security for pet data tbh
    if (id4.data.success) {
      loadedProfile.data.userObj.pets.push({
        petName: document.getElementById('petNameInput').value,
        petDesc: document.getElementById('petDescInput').value,
        petId: id4.data.idNumber
      })

      const newProfile = await axios.put('/users', {
        targetId: localStorage.getItem('uId'),
        newUserObj: loadedProfile.data.userObj
      })

      if (newProfile.data.success) {
        document.getElementById('petInputSection').remove() // delete the form since we've added a new pet
        popUp('Successfully added new pet.', 3)
        loadProfileInfo(localStorage.getItem('uId'))
      } else {
        popUp('Error adding new pet.', 3)
      }
    } else {
      popUp('Error assigning unique pet ID.', 4)
    }
  } else {
    popUp('Error updating profile.', 3)
  }
}

function addPetTemplate () {
  // click button, add acjacent html to end of the list
  // html will be a form, once form is filled remove the entire thing and re-load the profile info
  if (document.getElementById('petInputSection') === null) {
    document.getElementById('fullPetArea').insertAdjacentHTML('beforeend', petInputTemplate)
  }
}

async function loadProfileInfo (targetId) {
  let loadedProfile
  try {
    loadedProfile = await axios.get('/findUserByKey?keyVal=' + targetId + '&keyName=uid')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  if (loadedProfile.data.foundUser && loadedProfile.data.success) {
    document.getElementById('profileName').innerHTML = loadedProfile.data.userObj.username
    document.getElementById('profileBio').value = loadedProfile.data.userObj.bio

    document.getElementById('fullPetArea').innerHTML = '' // reset innerhtml of the pet area for dynamic elements, prevents all duplicates
    const isOwner = loadedProfile.data.userObj.uid === localStorage.getItem('uId')

    try { // elegant..... we try to remove anything that already exists so we don't double up on buttons
      document.getElementById('newBioButton').remove()
      document.getElementById('changePassButton').remove()
      document.getElementById('delAccButton').remove()
    } catch (err) {}
    document.getElementById('profileBio').readOnly = true

    if (loadedProfile.data.userObj.pets.length === 0) { // check the pet amount of the user, then add the required template
      if (isOwner) {
        document.getElementById('fullPetArea').insertAdjacentHTML('beforeend', noPetTemplate)
      } else {
        document.getElementById('fullPetArea').insertAdjacentHTML('beforeend',
        `
        <section id="noPetStuff">
            <div class="w-100 d-flex">
                <span class="profileBig mx-auto">No pets here...</span>
            </div>
        </section>
        `
        )
      }
    } else {
      for (let i = 0; i < loadedProfile.data.userObj.pets.length; i++) {
        document.getElementById('fullPetArea').insertAdjacentHTML('beforeend',
                `
                    <!--template for pets-->
                    <div class="petBlock d-flex flex-row h-50 w-100 mb-2 mt-2">
                        <div class="petSupport mx-auto h-100 flex-column" id="${'petTemplateMain' + i}">
                            <span class="profileBig h-25 w-100" id="postInfoPoster">${loadedProfile.data.userObj.pets[i].petName}</span>
                            <div class="profileBioContainer w-100 px-2 py-2">
                                ${loadedProfile.data.userObj.pets[i].petDesc}
                            </div>
                        </div>
                    </div>
                `)
        if (isOwner) {
          document.getElementById('petTemplateMain' + i).insertAdjacentHTML('beforeend',
                    `
                    <button class="btn btn-secondary px-3 mb-2 mt-1" type="button" onclick="removePet('${loadedProfile.data.userObj.pets[i].petId}')"> Remove pet </button>
                    `)
        }
      }
      if (isOwner) {
        document.getElementById('fullPetArea').insertAdjacentHTML('beforeend', addPetButton)
      }
    }
    if (isOwner) {
      document.getElementById('profileBio').readOnly = false
      document.getElementById('addPetButton').addEventListener('click', addPetTemplate) // no matter what we'll only have one pet button, so we can safely add it outside of the loop

      // confirming they're the owner, we add the necessary buttons for changing profile data.
      // Since this is super sensitive stuff that we don't want anyone getting their hands on (if not the acc owner), we insert them here
      // I wouldn't do this usually, since i already check if they own the account for editing DURING an api request
      // buttttt i don't want anybody being mean "for security" despite it already being secure due to the api checks, so we double-down on it being secure here
      document.getElementById('newBioHolder').insertAdjacentHTML('beforeend', // insert button to change bio
            `
            <button class="btn btn-secondary mx-auto px-3" type="button" id="newBioButton"> Save new bio </button>
            `)

      document.getElementById('accControlHolder').insertAdjacentHTML('beforeend', // insert buttons for account control
            `
                <button class="btn btn-secondary mx-auto px-3" type="button" id="changePassButton"> Change password </button>
                <button class="btn btn-secondary mx-auto px-3" type="button" id="delAccButton"> Delete account </button>
            `)

      // add necessary events
      document.getElementById('newBioButton').addEventListener('click', submitNewBio)
      document.getElementById('changePassButton').addEventListener('click', changePass)
      document.getElementById('delAccButton').addEventListener('click', deleteAccount)
    }
    return true // success
  } else {
    popUp('Error loading user data.', 3)
    return false // fail
  }
}

async function submitNewBio () {
  let loadedProfile
  try {
    loadedProfile = await axios.get('/findUserByKey?keyVal=' + localStorage.getItem('uId') + '&keyName=uid')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  if (loadedProfile.data.success) {
    loadedProfile.data.userObj.bio = document.getElementById('profileBio').value
    const newProfile = await axios.put('/users', {
      targetId: localStorage.getItem('uId'),
      newUserObj: loadedProfile.data.userObj
    })
    if (newProfile.data.success) {
      popUp('Successfully updated profile data!')
    } else {
      popUp('Error updating profile data.', 3)
    }
  } else {
    popUp()
  }
}

async function changePWRequest () { // eslint-disable-line no-unused-vars
  const oldPass = document.getElementById('oldPWChange').value
  const newPass = document.getElementById('newPWChange').value
  const confirmation = document.getElementById('PWConfirm').value

  let fUser
  try {
    fUser = await axios.get('/findUserByKeys/?keyVal=["' + localStorage.getItem('uId') + '","' + oldPass + '"]&keyName=["uid","password"]')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  if (fUser.data.success) {
    if (fUser.data.foundUser) {
      let passesAll = true

      const regTest = /'^(?=.*[^a-zA-Z:])(?=.*[a-zA-Z]).{8,}$'/.test(newPass)
      if (regTest === false) { // mix from https://regexr.com/3bfsi and online regex resources
        document.getElementById('newPassWarn').classList.remove('d-none')
        passesAll = false
      } else {
        document.getElementById('newPassWarn').classList.add('d-none')
      }

      if (newPass !== confirmation) {
        document.getElementById('PWConfirm').classList.remove('d-none')
        passesAll = false
      } else {
        document.getElementById('PWConfirm').classList.add('d-none')
      }

      if (passesAll) {
        fUser.data.userObj.password = newPass

        const newProfile = await axios.put('/users', {
          targetId: localStorage.getItem('uId'),
          newUserObj: fUser.data.userObj
        })

        if (newProfile.data.success) {
          popUp('Successfully changed password!', 3)
          destroyWindow('changePWHolder')
        }
      }
    } else {
      popUp('Invalid original password.', 3)
    }
  } else {
    popUp('Error changing password.', 3)
  }
}

function changePass () {
  document.getElementById('mainHolder').insertAdjacentHTML('beforeend',
    `
    <section>
        <div class="testContainer frontalContainer d-flex" id="changePWHolder">
            <div class="mx-auto container my-auto">
                <form class="formContainer d-flex flex-column" id="loginForm">
                    <h1 class="mt-5 mx-auto"> Change Password </h1>
                    <input class="formInput mx-auto mt-3" type="password" placeholder="Old Password" id="oldPWChange"> 
                    <input class="formInput mx-auto mt-3" type="password" placeholder="New Password" id="newPWChange"> 
                    <input class="formInput mx-auto mt-3" type="password" placeholder="Confirm Password" id="PWConfirm">
                    <span class="mx-auto d-none warningText" id="newPassWarn">New password is invalid.</span>
                    <span class="mx-auto d-none warningText" id="confirmPassWarn">Passwords do not match.</span>
                    <button class="btn btn-secondary mx-auto w-50 mt-3" type="button" onclick="changePWRequest()"> CHANGE PASSWORD </button>
                    <a class="mt-2 mb-5 mx-auto dominantToggle" onclick="destroyWindow('changePWHolder')"> Cancel </a>
                </form>
            </div>
        </div>
    </section>
    `
  )
}

async function initiateDelete (userObj) {
  let allPosts
  try {
    allPosts = await axios.get('/posts')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  const sender = localStorage.getItem('uId')
  let delSuccess = true

  for (let i = 0; i < allPosts.data.postslist.posts.length; i++) {
    if (allPosts.data.postslist.posts[i].posterId === sender) {
      const delpost = await axios.delete('/posts/?sentBy=' + sender + '&targetId=' + allPosts.data.postslist.posts[i].pid)
      if (delpost.data.success === false) {
        popUp('Error deleting posts.', 3)
        delSuccess = false
        break
      }
    }
  }

  if (delSuccess) {
    const deletedUser = await axios.delete('/users/?sentBy=' + sender + '&targetId=' + sender)
    if (deletedUser.data.success) {
      destroyWindow('delAccountHolder')
      destroyWindow('profileHolder')
      loadPosts()

      logOut()
    } else {
      popUp('Error deleting user, please try again.', 4)
    }
  }
}

async function delAccRequest () { // eslint-disable-line no-unused-vars
  const pass = document.getElementById('delPassword').value
  const confirmPass = document.getElementById('delConfirm').value

  if (pass === confirmPass) {
    document.getElementById('matchDelWarn').classList.add('d-none')
    let fUser
    try {
      fUser = await axios.get('/findUserByKeys/?keyVal=["' + localStorage.getItem('uId') + '","' + pass + '"]&keyName=["uid","password"]')
    } catch (err) {
      popUp('Error connecting with database, try again.')
      console.warn('Server error: ' + err)
    }

    if (fUser.data.success) {
      if (fUser.data.foundUser) {
        document.getElementById('wrongDelWarn').classList.add('d-none')
        initiateDelete(fUser.data.userObj)
      } else {
        document.getElementById('wrongDelWarn').classList.remove('d-none')
      }
    } else {
      popUp('Error fetching user.', 3)
    }
  } else {
    document.getElementById('matchDelWarn').classList.remove('d-none')
  }
}

function deleteAccount () {
  document.getElementById('mainHolder').insertAdjacentHTML('beforeend',
    `
        <div class="testContainer frontalContainer d-flex" id="delAccountHolder">
            <div class="mx-auto container my-auto">
                <form class="formContainer d-flex flex-column">
                    <h1 class="mt-5 mx-auto"> Delete Account </h1>
                    <input class="formInput mx-auto mt-3" type="password" placeholder="Account Password" id="delPassword">
                    <input class="formInput mx-auto mt-3" type="password" placeholder="Confirm Password" id="delConfirm">
                    <span class="mx-auto d-none warningText" id="wrongDelWarn">Password is incorrect.</span>
                    <span class="mx-auto d-none warningText" id="matchDelWarn">Passwords do not match.</span>
                    <button class="btn btn-secondary mx-auto w-50 mt-3" type="button" onclick="delAccRequest()"> DELETE ACCOUNT </button>
                    <a class="mt-2 mb-5 mx-auto dominantToggle" onclick="destroyWindow('delAccountHolder')"> Cancel </a>
                </form>
            </div>
        </div>
    `
  )
}

function loadProfilePanel () { // eslint-disable-line no-unused-vars
  document.getElementById('mainHolder').insertAdjacentHTML('beforeend', fullProfileTemplate)
}

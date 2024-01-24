/* global popUp:readonly, axios:readonly, toggleGreyOut:readonly */
// ^ this declares any global variables and functions obtained through other javascript files, so that eslint may ignore

function checkLoginStatus () {
  const loggedInContent = document.getElementsByClassName('loggedInShow')
  const loggedOutContent = document.getElementsByClassName('loggedOutShow')

  if (localStorage.getItem('uId') !== null) {
    for (let i = 0; i < loggedInContent.length; i++) {
      loggedInContent[i].classList.remove('d-none')
    }
    for (let i = 0; i < loggedOutContent.length; i++) {
      loggedOutContent[i].classList.add('d-none')
    }
  } else {
    for (let i = 0; i < loggedOutContent.length; i++) {
      loggedOutContent[i].classList.remove('d-none')
    }
    for (let i = 0; i < loggedInContent.length; i++) {
      loggedInContent[i].classList.add('d-none')
    }
  }
}

function logOut () {
  localStorage.clear()
  checkLoginStatus()
  popUp('Successfully logged out!')
}

async function createAccount () {
  const uName = document.getElementById('nameRegister').value
  const pass = document.getElementById('passRegister').value
  const passConfirm = document.getElementById('passConfirm').value

  let passVerif = true
  let fUser
  try {
    fUser = await axios.get('/findUserByKey?keyVal=' + uName + '&keyName=username')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  if (fUser.data.success) {
    if (fUser.data.foundUser || uName.length < 3 || uName.length > 20) {
      document.getElementById('nameRegisterWarn').classList.remove('d-none')
      passVerif = false
    } else {
      document.getElementById('nameRegisterWarn').classList.add('d-none')
    }

    if (!(/^(?=.*[^a-zA-Z:])(?=.*[a-zA-Z]).{8,}$/.test(pass))) { // mix from https://regexr.com/3bfsi and online regex resources
      document.getElementById('passRegisterWarn').classList.remove('d-none')
      passVerif = false
    } else {
      document.getElementById('passRegisterWarn').classList.add('d-none')
    }

    if (pass !== passConfirm) {
      document.getElementById('repeatRegisterWarn').classList.remove('d-none')
      passVerif = false
    } else {
      document.getElementById('repeatRegisterWarn').classList.add('d-none')
    }

    let postedUser
    if (passVerif) {
      try {
        postedUser = await axios.post('/users', {
          uname: uName,
          passw: pass
        })
      } catch (err) {
        popUp('Error connecting with database, try again.')
        console.warn('Server error: ' + err)
      }
      if (!postedUser.data.success) {
        popUp()
      } else {
        toggleGreyOut()
        popUp('Successfully registered! You may now log in.', 5)
      }
    }
  } else {
    popUp()
  }
}

async function logIntoAccount () {
  const uName = document.getElementById('nameLogin').value
  const pass = document.getElementById('passLogin').value
  let fUser
  try {
    fUser = await axios.get('/findUserByKeys/?keyVal=["' + uName + '","' + pass + '"]&keyName=["username","password"]')
  } catch (err) {
    popUp('Error connecting with database, try again.')
    console.warn('Server error: ' + err)
  }

  console.log(fUser.data)

  if (fUser.data.success) {
    if (fUser.data.foundUser) {
      localStorage.setItem('uId', fUser.data.userObj.uid)
      localStorage.setItem('uName', fUser.data.userObj.username)

      document.getElementById('loginWarn').classList.add('d-none')
      checkLoginStatus()
      toggleGreyOut()
      popUp('Successfully logged in!', 3)
    } else {
      document.getElementById('loginWarn').classList.remove('d-none')
    }
  } else {
    popUp()
  }
}

document.getElementById('finishRegistration').addEventListener('click', createAccount)
document.getElementById('finishLogin').addEventListener('click', logIntoAccount)
document.getElementById('logOutButton').addEventListener('click', logOut)
document.onload = checkLoginStatus()

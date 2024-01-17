/* global loadProfilePanel:readonly, loadProfileInfo:readonly */
// ^ this declares any global variables and functions obtained through other javascript files, so that eslint may ignore
const dominantScreenIDs = ['registerHolder', 'loginHolder', 'createPostHolder', 'postInfoHolder']

function toggleGreyOut () {
  dominantScreenIDs.forEach(elem => {
    if (!document.getElementById(elem).classList.contains('d-none')) {
      document.getElementById(elem).classList.add('d-none')
    }
  })
}

function toggleMenu (target) {
  toggleGreyOut()

  const foundForm = document.getElementById(target).querySelector('form')
  if (foundForm !== null) {
    foundForm.reset()
    const foundPicPreview = foundForm.querySelector('#previewPic')
    if (foundPicPreview !== null) {
      foundPicPreview.src = ''
      foundPicPreview.classList.add('d-none')
    }
  }

  if (document.getElementById(target).classList.contains('d-none')) {
    document.getElementById(target).classList.remove('d-none')
  }
}

const togglers = document.getElementsByClassName('dominantToggle')
for (let i = 0; i < togglers.length; i++) {
  togglers[i].addEventListener('click', toggleGreyOut)
}

document.getElementById('registerButton').addEventListener('click', function () {
  toggleMenu('registerHolder')
})

document.getElementById('loginButton').addEventListener('click', function () {
  toggleMenu('loginHolder')
})

document.getElementById('createPostButton').addEventListener('click', function () {
  toggleMenu('createPostHolder') // creative name
})

document.getElementById('profileButton').addEventListener('click', function () {
  // toggleMenu("profileHolder");
  loadProfilePanel()
  loadProfileInfo(localStorage.getItem('uId'))
})

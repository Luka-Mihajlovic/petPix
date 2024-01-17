function moveNotif (time) {
  document.getElementById('notifSlot').style.top = '12%'
  setTimeout(() => {
    document.getElementById('notifSlot').style.top = '-12%'
  }, time)
}

function popUp (notifText = 'Sorry, something went wrong.', time = 2) { // eslint-disable-line no-unused-vars
  document.getElementById('notifSlot').innerHTML = notifText
  moveNotif(time * 1000)
}

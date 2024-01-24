const fs = require('fs')
// for account creation
const { v4: uuidv4 } = require('uuid') // from UUID docs @ https://www.npmjs.com/package/uuid
const path = require('path')

function getid (req, resp) {
  try {
    const randId = uuidv4()
    resp.statusCode = 200
    resp.json({
      success: true,
      idNumber: randId
    })
  } catch (err) {
    // it's impossible to get to the catch error, since it would most likely be caused by the server shutting down right when a request is sent
    /* istanbul ignore next */
    resp.statusCode = 400
    /* istanbul ignore next */
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function createPost (req, resp) {
  try {
    // general idea from https://stackoverflow.com/questions/53054756/javascript-appending-object-to-json-file
    const allPosts = fs.readFileSync(path.resolve('./client/db/posts.json'))
    const postJson = (JSON.parse(allPosts))
    const postId = uuidv4()

    const today = new Date()

    postJson.posts.push({
      pid: postId,
      posterId: req.body.postedBy,
      likes: 0,
      likedBy: [],
      uploadDate: (today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate()), // getmonth returns 0-11 based on month

      pTitle: req.body.postTitle,
      pDesc: req.body.postDesc,
      pTags: req.body.postTags,
      imageName: req.file.filename
    })
    // we will never get here during jest tests, we do not mock file inputs
    /* istanbul ignore next */
    fs.writeFileSync(path.resolve('./client/db/posts.json'), JSON.stringify(postJson))
    resp.statusCode = 200
    resp.json({
      success: true
    })
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function editPost (req, resp) {
  try {
    // general idea from https://stackoverflow.com/questions/53054756/javascript-appending-object-to-json-file
    const allPosts = fs.readFileSync(path.resolve('./client/db/posts.json'))
    const postJson = (JSON.parse(allPosts))

    for (let i = 0; i < postJson.posts.length; i++) {
      if (postJson.posts[i].pid === req.body.targetPost) { // we got it? lets edit
        for (let j = 0; j < req.body.keyName.length; j++) {
          postJson.posts[i][req.body.keyName[j]] = req.body.newValue[j]
        }
        break
      }
    }

    fs.writeFileSync(path.resolve('./client/db/posts.json'), JSON.stringify(postJson))

    resp.statusCode = 200
    resp.json({
      success: true
    })
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function findUserByKey (req, resp) {
  try {
    if (req.query.keyVal === null || req.query.keyName === null || req.query.keyVal === '' || req.query.keyName === '') {
      resp.statusCode = 404
      resp.json({
        success: false,
        errorMessage: 'Malformed query in request'
      })
      return
    }

    let userStatus = false
    const allUsers = fs.readFileSync(path.resolve('./client/db/users.json'))

    const userJson = (JSON.parse(allUsers))
    let userIndex = -1

    for (let i = 0; i < userJson.users.length; i++) {
      if (req.query.keyVal === userJson.users[i][req.query.keyName]) {
        userStatus = true
        userIndex = i
        break
      }
    }

    if (userStatus) {
      resp.statusCode = 200
      resp.json({
        success: true,
        foundUser: userStatus,
        userObj: (userJson.users[userIndex])
      })
    } else {
      resp.statusCode = 200
      resp.json({
        success: true,
        foundUser: false,
        userObj: null
      })
    }
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function findUserByKeys (req, resp) {
  let keyNames
  let keyVals
  try {
    keyNames = JSON.parse(req.query.keyName)
    keyVals = JSON.parse(req.query.keyVal)
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: 'Failed parsing query in request'
    })
    return
  }
  try {
    if (req.query.keyVal === null || req.query.keyName === null || req.query.keyVal === '' || req.query.keyName === '') {
      resp.statusCode = 404
      resp.json({
        success: false,
        errorMessage: 'Malformed query in request'
      })
      return
    }
    let userStatus = false
    const allUsers = fs.readFileSync(path.resolve('./client/db/users.json'))
    const userJson = (JSON.parse(allUsers))

    let userIndex = -1
    let counter

    for (let i = 0; i < userJson.users.length; i++) { // loop every user
      counter = 0
      for (let j = 0; j < keyNames.length; j++) { // once you reach a user, check if all keys match
        if (keyVals[j] === userJson.users[i][keyNames[j]]) {
          counter++
        }
      }
      if (counter === keyNames.length) {
        userIndex = i
        userStatus = true
      }
    }

    if (userStatus) {
      resp.statusCode = 200
      resp.json({
        success: true,
        foundUser: userStatus,
        userObj: userJson.users[userIndex]
      })
    } else {
      // resp.statusCode = 404;
      resp.json({
        success: true,
        foundUser: false,
        userObj: null
      })
    }
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function createUser (req, resp) {
  try {
    // general idea from https://stackoverflow.com/questions/53054756/javascript-appending-object-to-json-file
    const allUsers = fs.readFileSync(path.resolve('./client/db/users.json'))
    const userJson = (JSON.parse(allUsers))
    const userId = uuidv4()

    userJson.users.push({
      uid: userId,
      username: req.body.uname,
      password: req.body.passw,
      bio: '',
      pets: [],
      isAdmin: false
    })

    fs.writeFileSync(path.resolve('./client/db/users.json'), JSON.stringify(userJson))
    resp.statusCode = 200
    resp.json({
      success: true,
      newUser: userId
    })
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function getPosts (req, resp) {
  try {
    const postsJson = JSON.parse(fs.readFileSync(path.resolve('./client/db/posts.json')))
    resp.statusCode = 200
    resp.json({
      success: true,
      postslist: postsJson
    })
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

// we cannot consistently test for an existing post, so we cannot test this
/* istanbul ignore next */
function findPost (kN, kV) {
  let postStatus = false
  const allPosts = fs.readFileSync(path.resolve('./client/db/posts.json'))
  const postJson = (JSON.parse(allPosts))

  let postIndex = 0

  let counter
  for (let i = 0; i < postJson.posts.length; i++) { // loop every post
    counter = 0
    for (let j = 0; j < kN.length; j++) { // once you reach a post, check if all keys match
      if (kV[j] === postJson.posts[i][kN[j]]) {
        counter++
      }
    }
    if (counter === kN.length) {
      postIndex = i
      postStatus = true
    }
  }
  return [postStatus, postJson, postIndex]
}

function findPostByKeys (req, resp) {
  let keyNames
  let keyVals
  try {
    keyNames = JSON.parse(req.query.keyName)
    keyVals = JSON.parse(req.query.keyVal)
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: 'Failed parsing query in request'
    })
    return
  }
  try {
    if (req.query.keyVal === null || req.query.keyName === null || req.query.keyVal === '' || req.query.keyName === '') {
      resp.statusCode = 404
      resp.json({
        success: false,
        errorMessage: 'Malformed query in request'
      })
      return
    }
    const foundArr = findPost(keyNames, keyVals) // 0 = status, 1 = json, 2 = index

    if (foundArr[0]) {
      resp.statusCode = 200
      resp.json({
        success: true,
        foundPost: true,
        postObj: foundArr[1].posts[foundArr[2]]
      })
    } else {
      // resp.statusCode = 404;
      resp.json({
        success: true,
        foundPost: false,
        postObj: null
      })
    }
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function deletePost (req, resp) {
  try {
    if (req.query.sentBy === null || req.query.targetId === null || req.query.sentBy === '' || req.query.targetId === '') {
      resp.statusCode = 404
      resp.json({
        success: false,
        errorMessage: 'Malformed query in request'
      })
      return
    }
    // we convert our single request parameter, targetId into a suitable json for the findPost function, just to reuse a bit of code
    const foundArr = (findPost(['pid'], [req.query.targetId])) // 0 = status, 1 = json, 2 = index

    if (req.query.sentBy === foundArr[1].posts[foundArr[2]].posterId) { // authenticate
      // when testing, we will never be able to delete a post
      /* istanbul ignore next */
      if (foundArr[0]) { // if a post has been found, our post file path is fine so we re-open the file:
        const postJson = foundArr[1]

        // adapted from https://stackoverflow.com/questions/5315138/node-js-remove-file
        const imgPath = ('./client/db/imgs/' + postJson.posts[foundArr[2]].imageName)

        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath)
          postJson.posts.splice(foundArr[2], 1) // remove the data from the array, image is also unlinked/deleted
        }
        fs.writeFileSync(path.resolve('./client/db/posts.json'), JSON.stringify(postJson))

        resp.statusCode = 200
        resp.json({
          success: true
        })
      } else {
        resp.statusCode = 200
        resp.json({
          success: false
        })
      }
    } else {
      resp.statusCode = 400
      resp.json({
        success: false,
        errorMessage: 'Authentication error'
      })
    }
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function deleteUser (req, resp) {
  try {
    if (req.query.sentBy === null || req.query.targetId === null || req.query.sentBy === '' || req.query.targetId === '') {
      resp.statusCode = 404
      resp.json({
        success: false,
        errorMessage: 'Malformed query in request'
      })
      return
    }
    const allUsers = fs.readFileSync(path.resolve('./client/db/users.json'))
    const userJson = (JSON.parse(allUsers))

    let userIndex = -1

    for (let i = 0; i < userJson.users.length; i++) {
      if (req.query.targetId === userJson.users[i].uid && req.query.targetId === req.query.sentBy) { // security woo, see if the target matches who sent it id-wise
        userIndex = i
        break
      }
    }

    if (userIndex === -1) {
      resp.statusCode = 200
      resp.json({
        success: false
      })
      return
    }

    userJson.users.splice(userIndex, 1)
    fs.writeFileSync(path.resolve('./client/db/users.json'), JSON.stringify(userJson))

    resp.statusCode = 200
    resp.json({
      success: true
    })
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function editUser (req, resp) {
  try {
    const allUsers = fs.readFileSync(path.resolve('./client/db/users.json'))
    const userJson = (JSON.parse(allUsers))

    let userIndex = -1

    for (let i = 0; i < userJson.users.length; i++) {
      if (req.body.targetId === userJson.users[i].uid) {
        userIndex = i
        break
      }
    }

    userJson.users[userIndex] = req.body.newUserObj // override the record

    fs.writeFileSync(path.resolve('./client/db/users.json'), JSON.stringify(userJson))

    resp.statusCode = 200
    resp.json({
      success: true
    })
  } catch (err) {
    // it's impossible to get to the catch error, since it would most likely be caused by the server shutting down right when a request is sent
    /* istanbul ignore next */
    resp.statusCode = 400
    /* istanbul ignore next */
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

module.exports = { getid, createPost, editPost, findUserByKey, findUserByKeys, createUser, getPosts, findPostByKeys, deletePost, deleteUser, editUser }

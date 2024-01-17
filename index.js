const fs = require('fs')
// for account creation
const { v4: uuidv4 } = require('uuid') // from UUID docs @ https://www.npmjs.com/package/uuid

function getid (req, resp) {
  try {
    const randId = uuidv4()
    resp.statusCode = 200
    resp.json({
      success: true,
      idNumber: randId
    })
  } catch (err) {
    resp.statusCode = 400
    resp.json({
      success: false,
      errorMessage: err.message
    })
  }
}

function createPost (req, resp) {
  try {
    // general idea from https://stackoverflow.com/questions/53054756/javascript-appending-object-to-json-file
    const allPosts = fs.readFileSync('./client/db/posts.json')
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

    fs.writeFileSync('./client/db/posts.json', JSON.stringify(postJson))
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
    const allPosts = fs.readFileSync('./client/db/posts.json')
    const postJson = (JSON.parse(allPosts))

    for (let i = 0; i < postJson.posts.length; i++) {
      if (postJson.posts[i].pid === req.body.targetPost) { // we got it? lets edit
        for (let j = 0; j < req.body.keyName.length; j++) {
          console.warn('adding ' + req.body.newValue[j] + ' to ' + req.body.keyName[j] + ' instead of ' + postJson.posts[i][req.body.keyName[j]])
          postJson.posts[i][req.body.keyName[j]] = req.body.newValue[j]
        }
        break
      }
    }

    fs.writeFileSync('./client/db/posts.json', JSON.stringify(postJson))

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
    let userStatus = false
    const allUsers = fs.readFileSync('./client/db/users.json')
    const userJson = (JSON.parse(allUsers))

    let userIndex = 0

    for (let i = 0; i < userJson.users.length; i++) {
      console.log(userJson.users[i][req.body.keyName])
      if (req.body.keyVal === userJson.users[i][req.body.keyName]) {
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
  try {
    let userStatus = false
    const allUsers = fs.readFileSync('./client/db/users.json')
    const userJson = (JSON.parse(allUsers))

    let userIndex = 0
    let counter

    for (let i = 0; i < userJson.users.length; i++) { // loop every user
      counter = 0
      for (let j = 0; j < req.body.keyName.length; j++) { // once you reach a user, check if all keys match
        if (req.body.keyVal[j] === userJson.users[i][req.body.keyName[j]]) {
          counter++
        }
      }
      if (counter === req.body.keyName.length) {
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
    const allUsers = fs.readFileSync('./client/db/users.json')
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

    fs.writeFileSync('./client/db/users.json', JSON.stringify(userJson))
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
    const postsJson = JSON.parse(fs.readFileSync('./client/db/posts.json'))
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

function findPost (req) {
  let postStatus = false
  const allPosts = fs.readFileSync('./client/db/posts.json')
  const postJson = (JSON.parse(allPosts))

  let postIndex = 0

  let counter
  for (let i = 0; i < postJson.posts.length; i++) { // loop every post
    counter = 0
    for (let j = 0; j < req.body.keyName.length; j++) { // once you reach a post, check if all keys match
      if (req.body.keyVal[j] === postJson.posts[i][req.body.keyName[j]]) {
        counter++
      }
    }
    if (counter === req.body.keyName.length) {
      postIndex = i
      postStatus = true
    }
  }
  console.warn('returning post index: ' + postIndex)
  return [postStatus, postJson, postIndex]
}

function findPostByKeys (req, resp) {
  try {
    const foundArr = findPost(req) // 0 = status, 1 = json, 2 = index
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
    // we convert our single request parameter, targetId into a suitable json for the findPost function, just to reuse a bit of code
    const foundArr = (findPost({ body: { keyName: ['pid'], keyVal: [req.body.targetId] } })) // 0 = status, 1 = json, 2 = index

    if (req.body.sentBy === foundArr[1].posts[foundArr[2]].posterId) { // authenticate
      if (foundArr[0]) { // if a post has been found, our post file path is fine so we re-open the file:
        const postJson = foundArr[1]

        // adapted from https://stackoverflow.com/questions/5315138/node-js-remove-file
        const imgPath = ('./client/db/imgs/' + postJson.posts[foundArr[2]].imageName)

        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath)
          postJson.posts.splice(foundArr[2], 1) // remove the data from the array, image is also unlinked/deleted
        }
        fs.writeFileSync('./client/db/posts.json', JSON.stringify(postJson))

        resp.statusCode = 200
        resp.json({
          success: true
        })
      } else {
        // resp.statusCode = 404;
        resp.json({
          success: true,
          foundPost: false,
          postObj: null
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
    console.warn('DEL USER:::::')
    const allUsers = fs.readFileSync('./client/db/users.json')
    const userJson = (JSON.parse(allUsers))

    let userIndex = 0
    console.warn(userJson.users.length)
    for (let i = 0; i < userJson.users.length; i++) {
      console.warn('DING')
      if (req.body.targetId === userJson.users[i].uid && req.body.targetId === req.body.sentBy) { // security woo, see if the target matches who sent it id-wise
        userIndex = i
        break
      }
    }

    userJson.users.splice(userIndex, 1)
    fs.writeFileSync('./client/db/users.json', JSON.stringify(userJson))

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
    const allUsers = fs.readFileSync('./client/db/users.json')
    const userJson = (JSON.parse(allUsers))

    let userIndex = 0

    for (let i = 0; i < userJson.users.length; i++) {
      if (req.body.targetId === userJson.users[i].uid) {
        userIndex = i
        break
      }
    }

    userJson.users[userIndex] = req.body.newUserObj // override the record
    fs.writeFileSync('./client/db/users.json', JSON.stringify(userJson))

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

module.exports = { getid, createPost, editPost, findUserByKey, findUserByKeys, createUser, getPosts, findPostByKeys, deletePost, deleteUser, editUser }

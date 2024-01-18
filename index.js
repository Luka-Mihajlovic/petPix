const express = require('express')
const serverFuncs = require('./serverFuncs.js')
const { v4: uuidv4 } = require('uuid') // from UUID docs @ https://www.npmjs.com/package/uuid

const app = express()

app.use(express.static('client'))
app.use(express.json())

const multer = require('multer')
// from https://stackoverflow.com/questions/44393227/format-issue-while-uploading-jpg-file-with-nodejs-multer-module
const path = require('path')

//!!! WE ARE IGNORING TESTING MULTER VIA JEST
/* istanbul ignore next */
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './client/db/imgs')
  },

  filename: function (req, file, callback) {
    const fname = uuidv4() + path.extname(file.originalname) // uuidv4 to get a guarantee'd random unique name no matter what
    callback(null, fname)
  }
})

const upload = multer({ storage })

// upload.single is for multer to process and create the required files from the multipart data we send
app.post('/createPost', upload.single('file'), serverFuncs.createPost)
app.post('/editPost', serverFuncs.editPost)
app.post('/findUserByKey', serverFuncs.findUserByKey)
app.post('/findUserByKeys', serverFuncs.findUserByKeys)
app.post('/createUser', serverFuncs.createUser)
app.get('/posts', serverFuncs.getPosts)
app.get('/id', serverFuncs.getid)
app.post('/findPostByKeys', serverFuncs.findPostByKeys)
app.post('/delPost', serverFuncs.deletePost)

// delete user from db
// send target, send who sent it (security)
app.post('/delUser', serverFuncs.deleteUser)

// edit request:
// targetId: what we wanna edit
// newUserObj: the new user obj that we want in that position
app.post('/editUser', serverFuncs.editUser)

module.exports = app

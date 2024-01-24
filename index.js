const express = require('express')
const serverFuncs = require('./serverFuncs.js')
const { v4: uuidv4 } = require('uuid') // from UUID docs @ https://www.npmjs.com/package/uuid

const app = express()

app.use(express.static('client'))
app.use(express.json())

const multer = require('multer')
// from https://stackoverflow.com/questions/44393227/format-issue-while-uploading-jpg-file-with-nodejs-multer-module
const path = require('path')

//! !! WE ARE IGNORING TESTING MULTER VIA JEST
/* istanbul ignore next */
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.resolve('./client/db/imgs')) // attempt at OS compatibility
  },

  filename: function (req, file, callback) {
    const fname = uuidv4() + path.extname(file.originalname) // uuidv4 to get a guarantee'd random unique name no matter what
    callback(null, fname)
  }
})

const upload = multer({ storage })

// upload.single is for multer to process and create the required files from the multipart data we send

// GET ROUTES
app.get('/posts', serverFuncs.getPosts)
app.get('/id', serverFuncs.getid)
app.get('/findUserByKey/', serverFuncs.findUserByKey)
app.get('/findUserByKeys/', serverFuncs.findUserByKeys)
app.get('/findPostByKeys/', serverFuncs.findPostByKeys)

// POST ROUTES
app.post('/posts', upload.single('file'), serverFuncs.createPost)
app.post('/users', serverFuncs.createUser)

// DELETE ROUTES
app.delete('/posts/', serverFuncs.deletePost)
app.delete('/users/', serverFuncs.deleteUser)

// PUT ROUTES
app.put('/posts', serverFuncs.editPost)
app.put('/users', serverFuncs.editUser)

module.exports = app

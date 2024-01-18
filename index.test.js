/* eslint-disable */
const app = require('./index')
const supertest = require("supertest")
const request = supertest(app) //https://zellwk.com/blog/endpoint-testing/

const fs = require('fs') //for file testing
const path = require('path')

// Mock out all top level functions, such as get, put, delete and post:
jest.mock("axios");

test('Receives a successful response from get/id', async () => {
    await request.get('/id').expect(200)
})

test('Receives a proper UUID4 value from get/id', async()=>{
    const res = await request.get('/id')
    expect(/^([0-9A-Za-z]{8})-*([0-9A-Za-z]{4}-){3}([0-9A-Za-z]{12})$/.test(res.body.idNumber)).toBe(true) //matches the uuid4 regex pattern? (8-4-4-4-12)

})

test('Fails to upload invalid post', async () => { //we don't want this to succeed, really. We're just uploading a post without a picture since we will not be mocking multer today...
    let fData = new FormData()
    fData.append('postedBy', "123456789")
    fData.append('postTitle', "testTitle")
    fData.append('postDesc', "testDescription")
    fData.append('postTags', "testTags")

    const res = await request.post('/createpost', fData).send({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      expect(res.status).toBe(400)
})

test('Succeeds on post edit call, doesnt edit', async () => {
    const res = await request.post('/editPost').send({
        targetPost: "000", //bad ID
        keyName: ['likedBy', 'likes'],
        newValue: ['000', 0]
    })

    expect(res.status).toBe(200) //doesn't edit, but it still succeeds
})

var newUID; //our guinnea pig

test('Successfully create a user', async () => {
    const res = await request.post('/createUser').send(
    {
        uname: "TEST",
        passw: "TEST123!"
    })
    newUID = res.body.newUser
    expect(res.status).toBe(200) //successfully called
})

test('Successful call on findUserByKey', async () => {
    const res = await request.post('/findUserByKey').send({
        keyVal: newUID,
        keyName: 'uid'
    })
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(true) //found
})

test('Succeed on findUserByKey, do not find valid user', async () => {
    const res = await request.post('/findUserByKey').send({
        keyVal: "000",
        keyName: 'uid'
    })
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(false) //found
})

test('Successful call on findUserByKeyS (plural)', async () => {
    const res = await request.post('/findUserByKeys').send(
    {
      keyVal: [newUID, 'TEST'],
      keyName: ['uid', 'username']
    })
    console.warn(res.body)
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(true) //found
})

test('Successful findUserByKeys, fail to find user', async () => {
    const res = await request.post('/findUserByKeys').send(
    {
      keyVal: ['000', 'lol'],
      keyName: ['uid', 'username']
    })
    console.warn(res.body)
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(false) //found
})

test('Get all posts from database', async () => {
    const res = await request.get('/posts')
    expect(res.status).toBe(200) //successfully called
})

test('Successfully call findPostByKeys', async () => {
    const res = await request.post('/findPostByKeys').send(
        {
            keyVal: ['badID'], //bad ID
            keyName: ['pid']
        })
        expect(res.status).toBe(200) //successfully called
        expect(res.body.foundPost).toEqual(false) //successfully called
})

test('Fail at deleting a non-existing post', async () => {
    const res = await request.post('/delPost').send(
        {
            sentBy: "0000", //bad user ID
            targetId: "0000" //non-existing target ID
        })
        expect(res.status).toBe(400) //successfully called
})

test('Successfully edit user', async () => {
    const loadedProfile = await request.post('/findUserByKey').send({
        keyName: "uid",
        keyVal: newUID
    })
    expect(loadedProfile.status).toBe(200)

    loadedProfile.body.userObj.pets.push({
        petName: "test",
        petDesc: "test",
        petId: "000"
      })

    const res = await request.post('/editUser').send({
        targetId: newUID,
        newUserObj: loadedProfile.body.userObj
      })

    expect(res.status).toBe(200) //successfully called
})

test('Successfully delete user', async () => {
    const res = await request.post('/delUser').send(
        {
            sentBy: newUID,
            targetId: newUID
        })

        expect(res.status).toBe(200) //successfully called
})
/* eslint-enable */

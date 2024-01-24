/* eslint-disable */
const app = require('./index')
const supertest = require("supertest")
const request = supertest(app) //https://zellwk.com/blog/endpoint-testing/

const fs = require('fs') //for file testing
const path = require('path')

// Mock out all top level functions, such as get, put, delete and post:
jest.mock("axios");

//axios by default returns our responses with content-type JSON, which is fine, so we'll test for it a few times.

test('Receives a successful response from get/id', async () => {
    let allPosts = await request.get('/id')
    expect(allPosts.status).toBe(200)
    expect(allPosts.header['content-type']).toBe("application/json; charset=utf-8");
})

test('Receives a proper UUID4 value from get/id', async()=>{
    const res = await request.get('/id')
    expect(/^([0-9A-Za-z]{8})-*([0-9A-Za-z]{4}-){3}([0-9A-Za-z]{12})$/.test(res.body.idNumber)).toBe(true) //matches the uuid4 regex pattern? (8-4-4-4-12)
    expect(res.header['content-type']).toBe("application/json; charset=utf-8");
})

test('Fails to upload invalid post', async () => { //we don't want this to succeed, really. We're just uploading a post without a picture since we will not be mocking multer today...
    let fData = new FormData()
    fData.append('postedBy', "123456789")
    fData.append('postTitle', "testTitle")
    fData.append('postDesc', "testDescription")
    fData.append('postTags', "testTags")

    const res = await request.post('/posts', fData).send({
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      expect(res.status).toBe(400)
      expect(res.header['content-type']).toBe("application/json; charset=utf-8");
})

test('Succeeds on post edit call, doesnt edit', async () => {
    const res = await request.put('/posts').send({
        targetPost: "000", //bad ID
        keyName: ['likedBy', 'likes'],
        newValue: ['000', 0]
    })

    expect(res.status).toBe(200) //doesn't edit, but it still succeeds
})

var newUID; //our guinnea pig

test('Successfully create a user', async () => {
    const res = await request.post('/users').send(
    {
        uname: "TEST",
        passw: "TEST123!"
    })
    newUID = res.body.newUser
    expect(res.status).toBe(200) //successfully called
})

test('Successful call on findUserByKey', async () => {
    const res = await request.get('/findUserByKey/?keyVal=' + newUID + '&keyName=uid')
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(true) //found
})

test('Succeed on findUserByKey, do not find valid user', async () => {
    const res = await request.get('/findUserByKey/?keyVal=000&keyName=uid')
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(false) //found
})

test('Fail malformed findUserByKey request', async () => {
    const res = await request.get('/findUserByKey/?keyVal=')
    expect(res.status).toBe(404) //flop
})

test('Successful call on findUserByKeyS (plural)', async () => {
    const res = await request.get('/findUserByKeys/?keyVal=["'+ newUID +'","TEST"]&keyName=["uid","username"]')
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(true) //found
})

test('Successful findUserByKeys, fail to find user', async () => {
    const res = await request.get('/findUserByKeys/?keyVal=["000","lolfff"]&keyName=["uid","username"]')
    expect(res.status).toBe(200) //successfully called
    expect(res.body.foundUser).toEqual(false) //found
})

test('Fail malformed findUserByKeys request, only one + no arrays', async () => {
    const res = await request.get('/findUserByKey/?keyVal=')
    expect(res.status).toBe(404) //flop
})

test('Fail parsing JSON in findUserByKeys request, only one', async () => {
    const res = await request.get('/findUserByKeys/?keyName=["uid","username"]')
    expect(res.status).toBe(400) //flop
})

test('Get all posts from database', async () => {
    const res = await request.get('/posts')
    expect(res.status).toBe(200) //successfully called
})

test('Successfully call findPostByKeys', async () => {
    const res = await request.get('/findPostByKeys?keyVal=["badID"]&keyName=["pid"]')
        expect(res.status).toBe(200) //successfully called
        expect(res.body.foundPost).toEqual(false) //successfully called
})

test('Fail parsing JSON in findUserByKeys request, only one', async () => {
    const res = await request.get('/findPostByKeys?keyVal=["badID"]')
        expect(res.status).toBe(400) //fail
})


test('Fail at deleting a non-existing post', async () => {
    const res = await request.delete('/posts?sentBy=000&targetId=000')
        expect(res.status).toBe(400) //successfully called
})

test('Malformed delete post request fail', async () => {
    const res = await request.delete('/posts?sentBy=')
        expect(res.status).toBe(404) //successfully called
})

test('Successfully edit user', async () => {
    const loadedProfile = await request.get('/findUserByKey/?keyVal=' + newUID + '&keyName=uid')
    expect(loadedProfile.status).toBe(200)

    loadedProfile.body.userObj.pets.push({
        petName: "test",
        petDesc: "test",
        petId: "000"
      })

    const res = await request.put('/users').send({
        targetId: newUID,
        newUserObj: loadedProfile.body.userObj
      })

    expect(res.status).toBe(200) //successfully called
    expect(res.header['content-type']).toBe("application/json; charset=utf-8");
})

test('Malformed delete user request fail', async () => {
    const res = await request.delete('/users?sentBy=')

    expect(res.status).toBe(404) //fails
})

test('Fail to delete non-existing user', async () => {
    const res = await request.delete('/users?sentBy=000&targetId=00')

    expect(res.status).toBe(200) //good request
    expect(res.body.success).toEqual(false) //didnt find
})

test('Successfully delete user', async () => {
    const res = await request.delete('/users?sentBy='+newUID+'&targetId='+newUID)

    expect(res.status).toBe(200) //successfully called
})
/* eslint-enable */

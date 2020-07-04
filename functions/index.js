/* eslint-disable */
const functions = require('firebase-functions');


const app = require('express')();

const FBAuth = require('./util/fbAuth')


const {
        getAllScreams,
        postOneScream, 
        getScreams, 
        commentOnScream,
        deleteScream,
        likeScream,
        unlikeScream,
    } = require('./handlers/screams')
const {signup, login, uploadImage,addUserDetails,getAuthenticatedUser} = require('./handlers/users')




//-----Screams route---
app.get('/screams', getAllScreams)
//post one scream
app.post('/scream', FBAuth, postOneScream)
app.get('/scream/:screamId', getScreams)

//TODO delete scream
app.delete(`/scream/:screamId`,FBAuth, deleteScream)
//TODO like scream
app.get('/scream/:screamId/like', FBAuth,likeScream)
// //TODO unlike scream
app.get('/scream/:screamId/unlike', FBAuth,unlikeScream)
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)


//------users route---
//signup
app.post('/signup', signup)
//login
app.post('/login', login)
//image upload
app.post('/user/image', FBAuth, uploadImage)
//edit userdetails
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)


exports.api = functions.region('asia-northeast1').https.onRequest(app)
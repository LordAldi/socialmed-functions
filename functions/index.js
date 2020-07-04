/* eslint-disable */
const functions = require('firebase-functions');


const app = require('express')();

const FBAuth = require('./util/fbAuth')

const {db} = require('./util/admin')
const {
        getAllScreams,
        postOneScream, 
        getScreams, 
        commentOnScream,
        deleteScream,
        likeScream,
        unlikeScream,
    } = require('./handlers/screams')
const {
        signup, 
        login, 
        uploadImage,
        addUserDetails,
        getAuthenticatedUser,
        getUserDetails,
        markNotificationsRead
    } = require('./handlers/users')




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
app.get('/user/:handle', getUserDetails)
app.post('/notifications',FBAuth, markNotificationsRead)


exports.api = functions.region('asia-northeast1').https.onRequest(app)

exports.createNotificationOnLike = functions.region('asia-northeast1').firestore.document('likes/{id}')
.onCreate((snapshot, context)=> {
    db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        const notif = {
            createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type:'like',
                read: false,
                screamId: doc.id
        }
        if(doc.exists){
            return db.doc(`/notifications/${snapshot.id}`).set(notif)
        }
    })
    .then(()=>{
        return 0;
    })
    .catch(err => {
        console.error(err)
        return 0;
    })
})
exports.deleteNotificationOnUnlike = functions.region('asia-northeast1').firestore.document('likes/{id}')
.onDelete((snapshot)=> {
    db.doc(`/notifications/${snapshot.id}`)
    .delete()
    .then(()=> {
        return 0
    })
    .catch(err => {
        console.error(err)
        return 0
    })
})

exports.createNotificationOnComment = functions.region('asia-northeast1').firestore.document('comments/{id}')
.onCreate((snapshot, context)=> {
    db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        const notif = {
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type:'comment',
            read: false,
            screamId: doc.id
        }
        if(doc.exists){
            return db.doc(`/notifications/${snapshot.id}`).set(notif)
        }
    })
    .then(()=>{
        return 0;
    })
    .catch(err => {
        console.error(err)
        return 0;
    })
    
})


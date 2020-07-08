/* eslint-disable */
const functions = require('firebase-functions');
const app = require('express')();
const cors = require('cors')
app.use(cors())


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
    } = require('./handlers/users');
const { onUpdate } = require('firebase-functions/lib/providers/remoteConfig');




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
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        const notif = {
            createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type:'like',
                read: false,
                screamId: doc.id
        }
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            return db.doc(`/notifications/${snapshot.id}`).set(notif)
        }
    })
    .catch(err => {
        console.error(err)
    })
})
exports.deleteNotificationOnUnlike = functions.region('asia-northeast1').firestore.document('likes/{id}')
.onDelete((snapshot)=> {
   return db.doc(`/notifications/${snapshot.id}`)
    .delete()
    .catch(err => {
        console.error(err)
    })
})

exports.createNotificationOnComment = functions.region('asia-northeast1').firestore.document('comments/{id}')
.onCreate((snapshot, context)=> {
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        const notif = {
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type:'comment',
            read: false,
            screamId: doc.id
        }
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
            return db.doc(`/notifications/${snapshot.id}`).set(notif)
        }
    })
    .catch(err => {
        console.error(err)
    })
    
})

exports.onUserImageChanges = functions.region('asia-northeast1').firestore.document('users/{userId}')
.onUpdate((change)=> {
    if(change.before.data().imageUrl !== change.after.data().imageUrl){
        const batch =db.batch()
        return db.collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
            data.forEach(doc =>{
                const scream = db.doc(`/screams/${doc.id}`)
                batch.update(scream, {userImage: change.after.data().imageUrl})
            })
            return batch.commit()
        })
    } else return true;
})


exports.onScreamDeleted = functions.region('asia-northeast1').firestore.document('screams/{screamId}')
.onDelete((snapshot, context)=> {
    const screamId = context.params.screamId
    const batch = db.batch()
    return db.collection('comments').where('screamId', '==', screamId).get()
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/comments/${doc.id}`))
        })
        return db.collection('likes').where('screamId', '==', screamId).get()
    })
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/likes/${doc.id}`))
        })
        return db.collection('notifications').where('screamId', '==', screamId).get()
    })
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/notifications/${doc.id}`))
        })
        return batch.commit()
    })
    .catch(err=> console.error(err))
})  
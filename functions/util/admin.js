const admin = require('firebase-admin');
const serviceAccount =require ('../key/admin.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://socialmed-14bdb.appspot.com'
});

const db = admin.firestore()

module.exports = {admin, db}
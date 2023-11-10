const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./library-oliver-firebase-adminsdk-s0m9a-c829a5e035.json");

const app = initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://library-oliver-default-rtdb.europe-west1.firebasedatabase.app",
});
const auth = getAuth(app);

console.log("UID Selected: " + process.argv[2]);

auth
  .getUser(process.argv[2])
  .then((userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log("userRecord.displayName: " + userRecord.displayName);
    console.log("userRecord.email: " + userRecord.email);
  })
  .catch((error) => {
    console.log("Error fetching user data:", error);
  });

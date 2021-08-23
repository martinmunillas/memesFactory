import { createApp } from "vue";
import App from "./App.vue";
import firebase from "firebase";
import router from "./routes";

const firebaseApp = firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
});

export const GCP_KEY = "";

export const firestore = firebaseApp.firestore();
export const storage = firebaseApp.storage().ref("/images");

const app = createApp(App);

app.use(router);

app.mount("#app");

import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, deleteDoc, addDoc, getDocs, collection } from "firebase/firestore";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGEwwRCLdRXYLhMYgrCkh-67beRw31i-U",
  authDomain: "voice-recorder-84355.firebaseapp.com",
  projectId: "voice-recorder-84355",
  storageBucket: "voice-recorder-84355.appspot.com",
  messagingSenderId: "823767307506",
  appId: "1:823767307506:web:5f2b93939e7b1b296dec6b",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const getAllData = async () => {
  try {
    const recordingsRef = collection(db,'user1-recordings');
    const response = await getDocs(recordingsRef);
    const data = []
    response.forEach((recordingData) => {
      data.push({ ...recordingData.data(), id: recordingData.id });
    })
   return data; 
} catch (error) {
    console.log(error.message);
}
};

export const deleteRecording = async (id) => {
  return await deleteDoc(doc(db, "user1-recordings", id));
};

export const updateRecording = async (id, newTitle) => {
  return await updateDoc(doc(db, "user1-recordings", id),{title: newTitle});
}

export const uploadToFirestore = async (recording) => {
  try {
    const addedDoc = await addDoc(collection(db,'user1-recordings'), recording);
    console.log('Added doc: ' + addedDoc.id);
    return  addedDoc.id;
  } catch (error) {
    console.log(error);
  }
};

export const uploadToFirebaseStorage = async (recording) => {
  try {
    console.log("start upload to firebase storage");

    console.log("file", typeof recording.file);
    let fileType = "";
    const blob = await fetchAudioFile(recording.file)
      .then((audioFile) => {
        console.log("i have audio", audioFile);
        const uriParts = recording.file.split(".");
        fileType = uriParts[uriParts.length - 1];

        return audioFile;
      })
      .catch((error) => {
        console.log("error", error);
      });

    console.log("blob", blob);

    if (blob) {
      const storageRef = ref(storage, `user1/${recording.title}.${recording.file.includes('blob') ? 'webm':fileType}`);
      await uploadBytes(storageRef, blob, { contentType: `audio/${recording.file.includes('blob') ? 'webm':fileType}` });
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("Recording uploaded to Firebase Storage.");
      return downloadUrl;
    }
  } catch (error) {
    console.error("Error uploading recording to Firebase:", error);
  }
};

const fetchAudioFile = (uri) => {
  console.log("inside fetchAudioFile");
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.responseType = "blob";

    xhr.onload = () => {
      // console.log('status =', xhr.status);
      if (xhr.status === 0 || xhr.status === 200) {
        console.log(xhr.response);
        resolve(xhr.response);
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };

    xhr.send(null);
  });
};

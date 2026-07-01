import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";// import { getFirestore , setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { getFirestore, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0cWFlsqYokRQNpkOr-BUHadwv-pG50ic",
  authDomain: "chat-app-ds-17e99.firebaseapp.com",
  projectId: "chat-app-ds-17e99",
  storageBucket: "chat-app-ds-17e99.firebasestorage.app",
  messagingSenderId: "660377051289",
  appId: "1:660377051289:web:cbe849c1613f70c0f49808"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)

const signup = async (username ,email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db,"users",user.uid),{
            id:user.uid,
            username: username.toLowerCase(),
            email:"",
            name:"",
            avatar:"",
            bio:"Hey , i am using chat app",
            lastSeen:Date.now()
        })
        await setDoc(doc(db,"chats",user.uid),{
            chatData:[]
        })
    }catch (error) {
       console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "));

    }
}

const login = async (email,password) => {
        try {
            await signInWithEmailAndPassword(auth,email,password)
        }catch (error){
             console.error(error);
             toast.error(error.code.split('/')[1].split('-').join(" "));
        }
}

const logout = async () => {
    try{
        await signOut(auth)
    }catch (error){
         console.error(error);
             toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

export {signup,login,logout,auth,db}
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {

  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);

  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  // Load Logged In User
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();

      setUserData(data);

      if (data.avatar && data.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }

      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });

    } catch (error) {
      console.log(error);
    }
  };

  // Update Last Seen Every Minute
  useEffect(() => {

    if (!userData) return;

    const interval = setInterval(async () => {

      if (auth.currentUser) {

        await updateDoc(doc(db, "users", userData.id), {
          lastSeen: Date.now(),
        });

      }

    }, 60000);

    return () => clearInterval(interval);

  }, [userData]);

  // Listen Chats
  useEffect(() => {

    if (!userData) return;

    const chatRef = doc(db, "chats", userData.id);

    const unsubscribe = onSnapshot(chatRef, async (snapshot) => {

      if (!snapshot.exists()) {
        setChatData([]);
        return;
      }

      const chatItems = snapshot.data().chatData || [];

      const tempData = [];

      for (const item of chatItems) {

        const userRef = doc(db, "users", item.rId);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

          tempData.push({
            ...item,
            userData: userSnap.data(),
          });

        }

      }

      tempData.sort((a, b) => b.updatedAt - a.updatedAt);

      setChatData(tempData);

    });

    return () => unsubscribe();

  }, [userData]);

  // Real-time listener for selected chatUser's lastSeen/online status
  useEffect(() => {

    if (!chatUser?.id) return;

    const userRef = doc(db, "users", chatUser.id);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setChatUser((prev) =>
          prev ? { ...prev, ...snapshot.data() } : snapshot.data()
        );
      }
    });

    return () => unsubscribe();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatUser?.id]);

  const value = {

    userData,
    setUserData,

    chatData,
    setChatData,

    messagesId,
    setMessagesId,

    messages,
    setMessages,

    chatUser,
    setChatUser,

    loadUserData,

  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
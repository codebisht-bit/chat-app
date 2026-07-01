import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {

  const navigate = useNavigate();

  const {
    userData,
    chatData,
    setChatUser,
    chatUser,
    setMessagesId,
    messagesId,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {

      const input = e.target.value.trim();

      if (!input) {
        setShowSearch(false);
        setUser(null);
        return;
      }

      setShowSearch(true);

      const userRef = collection(db, "users");

      const q = query(
        userRef,
        where("username", "==", input.toLowerCase())
      );

      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        setUser(null);
        return;
      }

      const foundUser = querySnap.docs[0].data();

      if (foundUser.id === userData.id) {
        setUser(null);
        return;
      }

      const alreadyExist = chatData?.some(
        (chat) => chat.rId === foundUser.id
      );

      if (alreadyExist) {
        setUser(null);
      } else {
        setUser(foundUser);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const addChat = async () => {

    try {

      const messagesRef = collection(db, "messages");
      const chatsRef = collection(db, "chats");

      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatsRef, user.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      toast.success("Chat Added");

      setUser(null);
      setShowSearch(false);

    } catch (error) {

      console.log(error);
      toast.error(error.message);

    }

  };

  const setChat = (item) => {
    setChatUser(item.userData);
    setMessagesId(item.messageId);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="ls">

      <div className="ls-top">

        <div className="ls-nav">

          <img src={assets.logo} className="logo" alt="" />

          <div className="menu">

            <img src={assets.menu_icon} alt="" />

            <div className="sub-menu">

              <p onClick={() => navigate("/profile")}>
                Edit Profile
              </p>

              <hr />

              <p onClick={logout}>Logout</p>

            </div>

          </div>

        </div>

        <div className="ls-search">

          <img src={assets.search_icon} alt="" />

          <input
            type="text"
            placeholder="Search Here..."
            onChange={inputHandler}
          />

        </div>

      </div>

      <div className="ls-list">

        {showSearch && user ? (

          <div
            onClick={addChat}
            className="friends add-user"
          >

            <img src={user.avatar} alt="" />

            <p>{user.name}</p>

          </div>

        ) : (

          chatData?.map((item, index) => (

            <div
              key={index}
              className={`friends ${item.messageId === messagesId ? "active" : ""}`}
              onClick={() => setChat(item)}
            >

              <img src={item.userData.avatar} alt="" />

              <div>

                <p>{item.userData.name}</p>

                <span>{item.lastMessage || "Start chatting..."}</span>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
};

export default LeftSidebar;
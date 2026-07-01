import React, { useContext, useEffect, useState, useRef } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { isUserOnline } from "../../lib/isOnline";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } =
    useContext(AppContext);

  const [input, setInput] = useState("");
  const scrollEnd = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time message listener
  useEffect(() => {
    if (!messagesId) return;

    const unsub = onSnapshot(doc(db, "messages", messagesId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMessages(data.messages ? [...data.messages].reverse() : []);
      }
    });

    return () => unsub();
  }, [messagesId]);

  // Update last message + seen status in both users' chat lists
  const updateChatMetadata = async (lastMessage) => {
    try {
      const userIDs = [chatUser.id, userData.id];

      for (const id of userIDs) {
        const userChatRef = doc(db, "chats", id);
        const userChatSnapshot = await getDoc(userChatRef);

        if (!userChatSnapshot.exists()) continue;

        const userChatData = userChatSnapshot.data();
        const chatIndex = userChatData.chatData.findIndex(
          (c) => c.messageId === messagesId
        );

        if (chatIndex === -1) continue;

        userChatData.chatData[chatIndex].lastMessage = lastMessage.slice(0, 30);
        userChatData.chatData[chatIndex].updatedAt = Date.now();

        if (userChatData.chatData[chatIndex].rId === userData.id) {
          userChatData.chatData[chatIndex].messageSeen = false;
        }

        await updateDoc(userChatRef, { chatData: userChatData.chatData });
      }
    } catch (error) {
      console.error("updateChatMetadata error:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !messagesId) return;

    const text = input;
    setInput(""); // optimistic clear

    try {
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          text,
          createdAt: Date.now(),
        }),
      });

      await updateChatMetadata(text);
    } catch (error) {
      console.error("sendMessage error:", error);

      const errMsg =
        typeof error?.message === "string" && error.message.trim()
          ? error.message
          : "Failed to send message. Please try again.";

      toast.error(errMsg);
      setInput(text);
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !messagesId) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Only PNG or JPEG images are allowed");
      e.target.value = "";
      return;
    }

    try {
      const imageUrl = await upload(file);

      if (!imageUrl) {
        throw new Error("Image upload failed");
      }

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          image: imageUrl,
          createdAt: Date.now(),
        }),
      });

      await updateChatMetadata("Image");
    } catch (error) {
      console.error("sendImage error:", error);

      const errMsg =
        typeof error?.message === "string" && error.message.trim()
          ? error.message
          : "Failed to send image. Please try again.";

      toast.error(errMsg);
    } finally {
      e.target.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!chatUser) {
    return (
      <div className="chat-welcome">
        <img src={assets.logo_icon} alt="" />
        <p>Chat Anytime, Anywhere</p>
      </div>
    );
  }

  return (
    <div className="chat-box">
      {/* Header */}
      <div className="chat-user">
        <img src={chatUser.avatar || assets.profile_img} alt="" />
        <p>
          {chatUser.name}
          {isUserOnline(chatUser.lastSeen) && (
            <img className="dot" src={assets.green_dot} alt="" />
          )}
        </p>
        <img src={assets.help_icon} alt="" className="help" />
      </div>

      {/* Messages */}
      <div className="chat-msg">
        {messages.length === 0 ? (
          <p className="no-message">Start chatting...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            >
              {msg.image ? (
                <img className="msg-img" src={msg.image} alt="" />
              ) : (
                <p className="msg">{msg.text}</p>
              )}

              <div>
                <img
                  src={
                    msg.sId === userData.id
                      ? userData.avatar || assets.profile_img
                      : chatUser.avatar || assets.profile_img
                  }
                  alt=""
                />
                <p>
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Send a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png,image/jpeg"
          hidden
        />

        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>

        <img
          src={assets.send_button}
          alt=""
          onClick={sendMessage}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default ChatBox;
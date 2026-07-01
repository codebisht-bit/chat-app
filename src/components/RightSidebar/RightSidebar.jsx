import React, { useContext } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'
import { isUserOnline } from '../../lib/isOnline'

const RightSidebar = () => {

  const { chatUser, messages } = useContext(AppContext);

  const mediaMessages = messages?.filter((msg) => msg.image) || [];

  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.avatar || assets.profile_img} alt="" />
        <h3>
          {chatUser.name}
          {isUserOnline(chatUser.lastSeen) && (
            <img src={assets.green_dot} className='dot' alt="" />
          )}
        </h3>
        <p>{chatUser.bio}</p>
      </div>
      <hr />
      <div className='rs-media'>
        <p>Media</p>
        <div>
          {mediaMessages.map((msg, index) => (
            <img
              key={index}
              src={msg.image}
              alt=""
              onClick={() => window.open(msg.image)}
            />
          ))}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
    : (
      <div className="rs">
        <button onClick={() => logout()}>Logout</button>
      </div>
    )
}

export default RightSidebar
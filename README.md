💬 Chatapp

A real-time chat application built with React and Firebase, featuring live messaging, media sharing, and online/offline status indicators.

👤 Built by: Deepak Bisht
🔗 Live Demo: https://chat-app-one-olive-17.vercel.app/
📂 Source Code: github.com/codebisht-bit/chat-app


✨ Features


User Authentication — Signup and login powered by Firebase Auth
Real-Time Messaging — Instant message delivery using Firestore's real-time listeners
Media Sharing — Send and receive images in chat, uploaded via Cloudinary
Online/Offline Status — Live green dot indicator showing whether a user is currently active
User Search — Find and start conversations with other users by username
Profile Management — Edit profile picture, name, and bio
Chat Media Gallery — View all images shared in a conversation from the right sidebar
Responsive Design — Clean, modern UI across the sidebar, chat window, and profile panel



🛠️ Tech Stack


Frontend: React + Vite
Backend / Database: Firebase (Authentication + Firestore)
Media Storage: Cloudinary
Hosting: Vercel
Linting: Oxlint



🚀 Getting Started

Prerequisites

Node.js (v18 or higher recommended)
A Firebase project with Authentication and Firestore enabled
A Cloudinary account for image uploads


Installation
Clone the repository
bash   git clone https://github.com/codebisht-bit/chat-app.git
   cd chat-app


Install dependencies
bash   npm install

Configure Firebase
Update src/config/firebase.js with your own Firebase project credentials (apiKey, authDomain, projectId, etc.)

Configure Cloudinary
Update src/lib/upload.js with your Cloudinary cloud name and upload preset

Run the development server
bash   npm run dev

Open http://localhost:5173 in your browser


Build for Production
bashnpm run build

The optimized production build will be output to the dist/ folder.

🔥 Firebase Setup Notes

Enable Email/Password sign-in method under Firebase Authentication
Under Authentication → Settings → Authorized domains, add your deployment domain (e.g. your Vercel URL) so login/signup works on the live site
Firestore is used to store:

users — user profiles (name, avatar, bio, lastSeen)
chats — chat metadata per user (last message, unread status)
messages — actual message content per conversation

🟢 Online Status Logic

A user is considered online if their lastSeen timestamp (stored in Firestore) is within the last 2 minutes. This is updated automatically every minute while the user is active, and checked in real time via src/lib/isOnline.js.


📦 Deployment

This project is deployed on Vercel. Any push to the main branch on GitHub triggers an automatic redeploy.

To deploy your own copy:


Push your code to a GitHub repository
Import the repository into Vercel (Framework Preset: Vite)
Deploy — no environment variables are needed if Firebase/Cloudinary keys are hardcoded in the config files
Add your Vercel domain to Firebase's Authorized domains list



👤 Author

Deepak Bisht
GitHub: @codebisht-bit

If you found this project useful or interesting, feel free to ⭐ star the repo!

🙏 Built With

React
Vite
Firebase
Cloudinary
Vercel

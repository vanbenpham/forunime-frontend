import React from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgetPassword from './pages/auth/ForgetPassword';
import Profile from './pages/profile/Profile';
import LoginBar from './components/appbar/LoginBar';
import Chat from './pages/chat/Chat';
import Discussion from './pages/discussion/Discussion';
import Review from './pages/review/Review';
import Settings from './pages/settings/Settings';
import SingleThread from './pages/discussion/SingleThread';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/thread/:id" element={<SingleThread />} />
          <Route path="/review" element={<Review />} />
          <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
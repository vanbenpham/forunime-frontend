import React from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgetPassword from './pages/auth/ForgetPassword';
import Profile from './pages/profile/Profile';
import Message from './pages/message/Message';
import Discussion from './pages/discussion/Discussion';
import Review from './pages/review/Review';
import Settings from './pages/settings/Settings';
import SingleThread from './pages/discussion/SingleThread';
import SingleDiscussion from './pages/discussion/SingleDiscussion';
import SingleReview from './pages/review/SingleReview';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/message" element={<Message />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/thread/:threadId" element={<SingleThread />} />
          <Route path="/singlediscussion/:postId" element={<SingleDiscussion />} />
          <Route path="/review" element={<Review />} />
          <Route path="/review/:reviewId" element={<SingleReview />} />
          <Route path="/settings/:userId?" element={<Settings />} />

      </Routes>
    </Router>
  );
};

export default App;
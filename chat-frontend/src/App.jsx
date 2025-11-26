import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route path="/" element={
          <motion.div
            initial={{ opacity:0, x:-40 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:40 }}
            transition={{ duration:0.2 }}
          >
            <Login />
          </motion.div>
        } />

        <Route path="/login" element={
          <motion.div
            initial={{ opacity:0, x:40 }} 
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-40 }}
            transition={{ duration:0.2 }}
          >
            <Login />
          </motion.div>
        } />

        <Route path="/signup" element={
          <motion.div
            initial={{ opacity:0, x:40 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-40 }}
            transition={{ duration:0.2 }}
          >
            <Signup />
          </motion.div>
        } />

        <Route path="/chat" element={
          <motion.div
            initial={{ opacity:0, x:40 }}
            animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-40 }}
            transition={{ duration:0.2 }}
          >
            <Chat />
          </motion.div>
        } />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
import React, { useState, useEffect } from 'react';
import '../styles/global.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Appbar from '../components/layout/Appbar';
import Login from '../components/layout/Login';
import Customer from '../components/layout/Customer';
import Account from '../components/layout/Account';
import Home from '../components/layout/Home';

function App() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Router>
      <Appbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/newAccount" element={<Customer />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;


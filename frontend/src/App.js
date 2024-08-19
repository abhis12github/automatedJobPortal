import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PostApplication from "./pages/PostApplication";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { getUser } from "./store/slices/userSlice";
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  return (
    <>
      <Router>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/jobs" element={<Jobs />} ></Route>
          <Route path="/dashboard" element={<Dashboard />} ></Route>
          <Route
            path="/post/application/:jobId"
            element={<PostApplication ></PostApplication>}
          ></Route>
          <Route path="/register" element={<Register ></Register>} ></Route>
          <Route path="/login" element={<Login ></Login>} ></Route>
          <Route path="*" element={<NotFound ></NotFound>} ></Route>
        </Routes>
        <Footer></Footer>
        <ToastContainer position="top-right" theme="dark" />
      </Router>
    </>
  );
}

export default App;

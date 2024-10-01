import logo from './logo.svg';
import './App.css';
import Footer from "./components/Footer/Footer";
import LogIn from "./components/LogIn/LogIn";
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import UserProfile from "./components/UserProfile/UserProfile";

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {AuthProvider} from "./components/AuthProvider";
import {useEffect} from "react";


function App() {
    useEffect(() => {
        if (localStorage.getItem("theme")) {
            document.documentElement.setAttribute("data-theme", localStorage.getItem("theme"));
        } else {
            document.documentElement.setAttribute("data-theme", "light");
        }
    }, []);

  return (
          <div className="App">
              <BrowserRouter>
                  <Routes>
                      <Route path="/login" element={<LogIn/>} />
                      <Route path="/register" element={<Register/>} />
                      <Route path="/" element={<Home/>} />
                  </Routes>
              </BrowserRouter>

          </div>

  );
}

export default App;

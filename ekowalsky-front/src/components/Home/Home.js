import React, {useContext, useEffect,useState} from 'react';
import Parser from 'html-react-parser';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../AuthProvider";
import Dashboard from "../Dashboard/Dashboard";


export default function Home() {

    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("user")) {
            setIsLoggedIn(false);

            navigate("/login");
        } else {
            setIsLoggedIn(true);
        }
    }, []);

    return isLoggedIn ? (
        <Dashboard/>
    ) : null;
}
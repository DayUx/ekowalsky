import React, {useState,useContext, useEffect} from 'react';
import {loginRoute} from "../../utils/APIRoutes";
import {useNavigate} from 'react-router-dom';
import {AuthContext} from "../AuthProvider";
import {toast, ToastContainer} from "react-toastify";

export default function LogIn() {
    const navigate = useNavigate();
    //const {user} = useContext(AuthContext);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            console.log("user is logged in");
            navigate('/');
        }
    }, []);

    const [fields, setFields] = useState({ // <-- create field state
        email: '', password: '',
    });
    const changeHandler = (e) => {
        const {name, value} = e.target;
        setFields((fields) => ({
            ...fields, [name]: value
        }));
    };

    const redirection=()=> {
        navigate('/register')
      }

    const submitHandler = (e) => {
        e.preventDefault();


        if (fields.email.length ==0 || fields.password.length ==0) {
            toast.error("Please fill all the fields");
            return;
        }


        console.log(fields);
        fetch(loginRoute, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fields)
        }).then(response =>
            response.json().then(data => ({
                    data: data,
                    status: response.status
                })
            ).then(res => {
                console.log(res);
                if (res.data.status === true) {
                    localStorage.setItem('user', res.data.user);
                    console.log(res.data.user);
                    navigate('/');
                } else {
                    console.log(res.data);
                }
            }))
    };

    return (<div className="login-register-div">
        <div className="logo"></div>
        <form onSubmit={submitHandler} className="login-register-form">
            <h1>Log In</h1>
            <input  placeholder="Email" type="email" name="email" onChange={changeHandler}
                   value={fields.email}/>
            <input  placeholder="Password" name="password" type="password" onChange={changeHandler}
                   value={fields.password}/>
            <input className="btn" value="Sign In" type="submit"/>
        </form>
        <div className={"register-div"}>
            <h1>New here ?</h1>
            <button onClick={redirection}> Register</button>
        </div>
        <ToastContainer/>
    </div>);
}
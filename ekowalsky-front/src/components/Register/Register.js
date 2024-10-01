import React, {useState, useContext, useEffect} from 'react';
import {registerRoute} from '../../utils/APIRoutes';
import {useNavigate} from 'react-router-dom';
import {ToastContainer,toast} from "react-toastify";


export default function Register() {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState();

    useEffect(() => {
        if (localStorage.getItem('user')) {
            navigate('/');
        }
    }, []);


    const [fields, setFields] = useState({ // <-- create field state
        email: '', password: '', second_name: '', first_name: '', confirm_password: '',
    });
    const changeHandler = (e) => {
        const {name, value} = e.target;
        console.log(name, value);
        setFields((fields) => ({
            ...fields, [name]: value
        }));
    };

    const redirection = () => {
        navigate('/login')
    }

    const submitHandler = (e) => {
        e.preventDefault();

        if (fields.password.length ==0 || fields.first_name.length ==0 || fields.second_name.length ==0 || fields.email.length ==0 || selectedFile == undefined) {
            toast.error("Please fill all the fields");
            return;
        }

        if (fields.password !== fields.confirm_password) {
            toast.error("Confirm password doesn't match");
            return;
        }

        if (fields.password.length < 10) {
            toast.error("Password must be at least 10 characters long");
            return;
        }
        if (fields.password.length > 100) {
            toast.error("Password must be less than 100 characters long");
            return;
        }
        if (fields.first_name.length < 2) {
            toast.error("First name must be at least 2 characters long");
            return;
        }
        if (fields.first_name.length > 50) {
            toast.error("First name must be less than 50 characters long");
            return;
        }
        if (fields.second_name.length < 2) {
            toast.error("Second name must be at least 2 characters long");
            return;

        }
        if (fields.second_name.length > 50) {
            toast.error("Second name must be less than 50 characters long");
            return;
        }
        if (fields.email.length < 5) {
            toast.error("Email must be at least 5 characters long");
            return;
        }
        if (fields.email.length > 50) {
            toast.error("Email must be less than 50 characters long");
            return;
        }
        fetch(registerRoute, {
            method: 'POST', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify({
                email: fields.email,
                password: fields.password,
                first_name: fields.first_name,
                second_name: fields.second_name,
                profile_img: selectedFile

            })
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            console.log(res);
            if (res.data.status === true) {
                localStorage.setItem('user', res.data.user);
                navigate('/');
            } else {
                toast.error(res.data.message);
            }
        }))
    };

    const onSelectFile = e => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined)
            return
        }
        let file = e.target.files[0];
        if (file.size > 1048576 * 0.05) {
            toast.error("File is too big (>50kb)");
            setSelectedFile(undefined)
            return
        }
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {

            setSelectedFile(reader.result);
        }
    }

    return (<div className="login-register-div">
            <div className="logo"></div>
            <form onSubmit={submitHandler} className="login-register-form">
                <h1>Register</h1>
                <div className={"preview-container"}>
                    <input type='file' onChange={onSelectFile}/>
                    {selectedFile ? <img className="preview" src={selectedFile}/> :
                        undefined}
                </div>
                <input placeholder="Email" name="email" type="email" onChange={changeHandler}
                       value={fields.email}/>
                <input placeholder="First Name" name="first_name" onChange={changeHandler}
                       value={fields.first_name}/>

                <input placeholder="Second Name" name="second_name" onChange={changeHandler}
                       value={fields.second_name}/>

                <input placeholder="Password" name="password" type="password" onChange={changeHandler}
                       value={fields.password}/>

                <input placeholder="Confirm Password" name="confirm_password" type="password"
                       onChange={changeHandler} value={fields.confirm_password}/>

                <input className="btn" value="Register" type="submit"/>
            </form>
            <div className={"login-div"}>
                <h1>Already register ?</h1>
                <button onClick={redirection}>Log In</button>
            </div>
        <ToastContainer/>
        </div>);
}


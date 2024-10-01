import React, {useState, useContext, useEffect} from 'react';
import {getUserRoute, updateUserRoute} from "../../utils/APIRoutes";
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate} from "react-router-dom";
import Disconnect from "../Disconnect/Disconnect";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";

export default function UserProfile() {
    const [selectedFile, setSelectedFile] = useState();
    const [imageProfile, setImageProfile] = useState();
    const [user, setUser] = useState();

    const [fields, setFields] = useState({
        email: "",
        password: "",
        first_name: "",
        second_name: "",
        profile_img: "",
        confirm_password: "",
        new_password: "",
    });
const navigate = useNavigate();

    useEffect(() => {
        console.log(localStorage.getItem('user'));
        if (localStorage.getItem('user') == null || localStorage.getItem('user') == undefined || localStorage.getItem('user') == "undefined") {
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }

        const data = wt_decode(localStorage.getItem("user"));
        setUser(data);
        let t = fields;
        t.first_name = data.first_name;
        t.second_name = data.second_name;
        t.email = data.email;
        setFields(t);
        setUserProfilePicture(data.id);
    }, [])

    const wt_decode = (token) => {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    const setUserProfilePicture = (id) => {
        console.log(id);
        fetch(getUserRoute, {
            method: "POST", headers: {
                "Content-Type": "application/json", "x-access-token": localStorage.getItem("user")
            }, body: JSON.stringify({
                id: id
            })
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            console.log(res);
            if (res.data.status) {
                setImageProfile(res.data.user.profile_img);
            }
        }))
    }

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

    const changeHandler = (e) => {
        const {name, value} = e.target;
        setFields((fields) => ({
            ...fields, [name]: value
        }));
    };


    const submitForm = (e) => {
        e.preventDefault();

        if (fields.confirm_password == fields.new_password && fields.new_password.length >= 10) {
            fetch(updateUserRoute, {
                method: "POST", headers: {
                    "Content-Type": "application/json", "x-access-token": localStorage.getItem("user")
                }, body: JSON.stringify({
                    email: fields.email,
                    first_name: fields.first_name,
                    second_name: fields.second_name,
                    password: fields.new_password,
                    profile_img: selectedFile ? selectedFile : imageProfile
                })
            }).then(response => response.json().then(data => ({
                data: data, status: response.status
            })).then(res => {
                console.log(res);
                if (res.status == 413) {
                    toast.error("Image size is too big");
                    return;
                }
                if (res.data.status) {
                    toast.success("Profile successfully updated");
                    localStorage.setItem("user", res.data.user);
                }
            }))

        } else if (fields.confirm_password.length == 0 && fields.new_password.length == 0) {
            fetch(updateUserRoute, {
                method: "POST", headers: {
                    "Content-Type": "application/json", "x-access-token": localStorage.getItem("user")
                }, body: JSON.stringify({
                    email: fields.email,
                    first_name: fields.first_name,
                    second_name: fields.second_name,
                    password: fields.new_password,
                    profile_img: selectedFile ? selectedFile : imageProfile
                })
            }).then(response => response.json().then(data => ({
                data: data, status: response.status
            })).then(res => {
                console.log(res);
                if (res.data.status) {
                    toast.success("Profile updated successfully");
                    localStorage.setItem("user", res.data.user);
                }
            }))
        } else {
            if (fields.confirm_password != fields.new_password) {
                toast.error("New password isn't equal to password confirmation");
            } else if (fields.new_password.length < 10) {
                toast.error("Password length must be 10 or higher");
            }
        }
    }

    return (<div className={"user-profile"}>
        <ToastContainer/>
        <form onSubmit={submitForm}>
            <div className={"preview-container"}>
                <input type='file' onChange={onSelectFile}/>
                {selectedFile ? <img className="preview" src={selectedFile}/> :
                    <img className="preview" src={imageProfile}/>}
            </div>
            <input required={true} placeholder={"Email"} type='email' name={"email"} value={fields.email}
                   onChange={changeHandler}/>
            <input required={true} placeholder={"First name"} name={"first_name"} value={fields.first_name}
                   onChange={changeHandler}/>
            <input required={true} placeholder={"Second name"} name={"second_name"} value={fields.second_name}
                   onChange={changeHandler}/>
            <input placeholder={"New password"} name={"new_password"} type='password' value={fields.new_password}
                   onChange={changeHandler}/>
            <input placeholder={"Confirm new password"} name={"confirm_password"} type='password'
                   value={fields.confirm_password} onChange={changeHandler}/>
            <button type='submit'>Save changes</button>
        </form>
    <div className={"disconnect-div"}>
        <ThemeSwitch/>
        <Disconnect/>
    </div>

    </div>)

}
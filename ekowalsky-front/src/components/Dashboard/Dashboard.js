import React, {useEffect, useRef, useState} from 'react';

import {
    getSchoolsOfUserRoute, getSchoolsRoute, createSchoolRoute, joinSchoolRoute, quitSchoolRoute, host, getUserRoute
} from "../../utils/APIRoutes";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faEllipsisV, faUsers, faSignOutAlt, faTimes} from '@fortawesome/free-solid-svg-icons'
import {useNavigate} from "react-router-dom";
import Chat from "../Chat/Chat";

import {io} from "socket.io-client";
import UserProfile from "../UserProfile/UserProfile";

export default function Dashboard() {

    const navigate = useNavigate();
    const user = localStorage.getItem('user');
    const [mySchools, setMySchools] = useState([]);
    const [schools, setSchools] = useState([]);
    const [active, setActive] = useState(false);
    const [addSchool, setAddSchool] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const [filter, setFilter] = useState('');
    const [selectedSchool, setSelectedSchool] = useState({});
    const [schoolMenu, setSchoolMenu] = useState(false);
    const [imageProfile, setImageProfile] = useState('');
    const [modifyProfile, setModifyProfile] = useState(false);
    const [schoolFields, setSchoolFields] = useState({
        name: '', description: '',
    });

    const chatFunc = useRef(null);
    const socket = useRef();
    let schoolsLoaded = false;
    const [overlay, setOverlay] = useState(false);

    useEffect(() => {
        if (selectedSchool._id) {
            if (socket.current) {
                socket.current.removeAllListeners("msg-receive");
            }
            socket.current = io(host);
            socket.current.emit("joinRoom", {token: user, school_id: selectedSchool._id});
            console.log(socket.current);
            chatFunc.refresh();
        }
    }, [selectedSchool]);

    const createSchool = () => {
        setOverlay(true);
        setAddSchool(true);
        setActive(false);
    }


    const toggleClass = () => {

        let list = [];
        if (!active) {
            getOtherSchools();
        }
        setActive(!active);
        setAddSchool(false);
        setOverlay(true);
    };

    const getOtherSchools = () => {
        fetch(getSchoolsRoute, {
            method: 'POST', headers: {
                'Content-Type': 'application/json', 'x-access-token': user
            },
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {

            setSchools(res.data.schools);
        }))
    }


    const addSchoolSubmit = (e) => {
        e.preventDefault();
        let t = schoolFields;
        t.image = selectedFile;
        fetch(createSchoolRoute, {
            method: 'POST', headers: {
                'x-access-token': user, 'Content-Type': 'application/json'
            }, body: JSON.stringify(t)
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            if (res.data.status === true) {
                let t = schools;
                setMySchools(mySchools.concat(res.data.school));
                closeEverything();
            }
        }));
    }

    const closeEverything = () => {
        setActive(false);
        setOverlay(false);
        setAddSchool(false);
        setSchoolMenu(false);
    };


    const wt_decode = (token) => {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };


    const addSchoolChangeHandler = (e) => {
        const {name, value} = e.target;
        setSchoolFields((schoolFields) => ({
            ...schoolFields, [name]: value
        }));
    }

    useEffect(() => {
        if (!localStorage.getItem('user')) {
            navigate('/login');
        }


        if (tokenIsExpired(user)) {
            disconnect();
        }

        loadSchools();
        setUserProfilePicture(wt_decode(user).id);
    }, []);

    function disconnect() {
        localStorage.removeItem('user');
        navigate('/login');
    }

    function tokenIsExpired(token) {
        var decoded = wt_decode(token);
        var now = new Date();
        var exp = new Date(decoded.exp * 1000);
        return now > exp;
    }


    const loadSchools = () => {
        let token = user;
        const userJson = wt_decode(token);
        setMySchools([]);

        if (!userJson) {
            localStorage.removeItem('user');
            navigate('/login');
        } else {
            let t = [];
            fetch(getSchoolsOfUserRoute, {
                method: 'POST', headers: {
                    'x-access-token': token, 'Content-Type': 'application/json'
                }
            }).then(response => {

                return response.json()
            }).then(data => ({
                data: data
            })).then(res => {
                setMySchools(res.data.servers_id_and_image);
            })
            schoolsLoaded = false;
        }
    }


    const quitSchool = (id) => {
        setSelectedSchool({});
        fetch(quitSchoolRoute, {
            method: 'POST', headers: {
                'x-access-token': user, 'Content-Type': 'application/json'
            }, body: JSON.stringify({
                id_school: id
            })
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {

            if (res.data.status === true) {
                loadSchools();
                getOtherSchools();
            }
        }));
    }
    const joinSchool = (id) => {
        fetch(joinSchoolRoute, {
            method: 'POST', headers: {
                'x-access-token': user, 'Content-Type': 'application/json'
            }, body: JSON.stringify({id_school: id})
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            if (res.data.status === true) {
                let t = mySchools;
                setMySchools(mySchools.concat(res.data.school));
                getOtherSchools();
                closeEverything();
            }
        }));
    }

    const onSelectFile = e => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(undefined)
            return
        }
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {

            setSelectedFile(reader.result);
        }
    }

    const setUserProfilePicture = (id) => {
        fetch(getUserRoute, {
            method: "POST", headers: {
                "Content-Type": "application/json", "x-access-token": localStorage.getItem("user")
            }, body: JSON.stringify({
                id: id
            })
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            if (res.data.status) {
                setImageProfile(res.data.user.profile_img);
            }
        }))

    }

    return (<div className="dashboard">
        <nav>
            <div className="nav-wrapper">
                {mySchools.map((school, index) => {
                    return <button
                        onClick={() => {

                            setSelectedSchool(school);
                            setModifyProfile(false);
                        }}

                        style={{
                            backgroundImage: "url(" + school.image + ")",
                        }}>
                    </button>
                })}
                <button onClick={toggleClass}><FontAwesomeIcon icon={faPlus}/></button>
            </div>
            <button className={"my-profile-button"} onClick={() => {
                setModifyProfile(true);
            }} style={{
                backgroundImage: "url(" + imageProfile + ")",
            }}>
            </button>
        </nav>
        <div className="school-page">

            {modifyProfile ? <UserProfile/> : (
                selectedSchool._id ? <div className="school-page-header">
                        <div className={"school-page-title"}>
                            <h1>
                                {selectedSchool.nom}
                            </h1>
                            <p>
                                {selectedSchool.description}
                            </p>
                        </div>
                        <button onClick={() => {
                            setSchoolMenu(true);
                            setOverlay(true);
                        }}><FontAwesomeIcon icon={faEllipsisV}/></button>
                    </div> : <h2>No school selected</h2>)
            }
            {modifyProfile?undefined:(selectedSchool._id ? <Chat school={selectedSchool} socket={socket} chatFunc={chatFunc}/> : null)}









        </div>
        <div className={active ? 'visible addSchoolMenu' : 'addSchoolMenu'}>
            <div className={"existing-schools"}>
                <div className="addSchoolMenu_header">
                    <h1>Join a school</h1>
                    <input placeholder={"Search a school"} value={filter} onChange={(e) => {
                        setFilter(e.target.value)
                    }} className={"existing-schools-filter"}/>
                    <div className={"existing-schools-list"}>
                        {schools.length !== 0 ?

                            schools.map((school, index) => {
                                if (!filter || school.nom.toLowerCase().includes(filter.toLowerCase())) {
                                    return <div onClick={() => {
                                        joinSchool(school._id)
                                    }} className="school-button" value={school._id}>
                                        <div className={"school-button-icon"} style={{
                                            backgroundImage: "url(" + school.image + ")",
                                        }}></div>
                                        <h2>{school.nom}</h2></div>
                                } else {

                                }
                            }) : <h2>No school found</h2>}
                    </div>

                </div>
            </div>
            <div className={"create-school"}>
                <button onClick={createSchool}>Add a non existing school</button>
            </div>
        </div>

        <div className={schoolMenu ? "school-menu visible" : "school-menu"}>
            <button onClick={closeEverything}><FontAwesomeIcon icon={faTimes}/></button>
            <button onClick={() => {
                quitSchool(selectedSchool._id);
                closeEverything();

            }}><FontAwesomeIcon icon={faSignOutAlt}/></button>
        </div>

        <div className={addSchool ? 'visible create-school-menu' : 'create-school-menu'}>
            <div className={"create-school-menu-header"}>
                <h1>Create a school</h1>
            </div>
            <form onSubmit={addSchoolSubmit}>
                <div className={"preview-container"}>
                    <input type='file' onChange={onSelectFile}/>
                    <img className="preview" src={selectedFile}/></div>
                <input value={schoolFields.nom} onChange={addSchoolChangeHandler} required
                       placeholder="Nom de l'école" name="nom"/>
                <input value={schoolFields.description} onChange={addSchoolChangeHandler} required
                       placeholder="Description" name="description"/>

                <button type="submit">Create</button>
            </form>

        </div>


        <div className={overlay ? "overlay visible" : "overlay"} onClick={closeEverything}>

        </div>
    </div>);
}
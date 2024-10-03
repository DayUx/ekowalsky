import React, {useEffect, useRef, useState} from 'react';

import {
    createGroupRoute,
    getGroupsOfUserRoute,
    getGroupsRoute, getMessagesRoute, getPrivateMessages,
    getUserRoute, getUsersByGroupRoute,
    host,
    joinGroupRoute,
    quitGroupRoute, sendMessageRoute, sendPrivateMessageRoute
} from "../../utils/APIRoutes";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsisV, faPlus, faSignOutAlt, faTimes} from '@fortawesome/free-solid-svg-icons'
import {useNavigate} from "react-router-dom";
import Chat from "../Chat/Chat";

import {io} from "socket.io-client";
import UserProfile from "../UserProfile/UserProfile";
import {click} from "@testing-library/user-event/dist/click";
import { get } from 'mongoose';

export default function Dashboard() {

    const navigate = useNavigate();
    const user = localStorage.getItem('user');
    const [myGroups, setMyGroups] = useState([]);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);
    const [active, setActive] = useState(false);
    const [addGroup, setAddGroup] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const [selectedUser, setSelectedUser] = useState();
    const [filter, setFilter] = useState('');
    const [selectedGroup, setSelectedGroup] = useState({});
    const [groupMenu, setGroupMenu] = useState(false);
    const [imageProfile, setImageProfile] = useState('');
    const [modifyProfile, setModifyProfile] = useState(false);
    const [groupFields, setGroupFields] = useState({
        name: '', description: '',
    });

    const chatFunc = useRef(null);
    const socket = useRef();
    let groupsLoaded = false;
    const [overlay, setOverlay] = useState(false);

    useEffect(() => {
        if (selectedGroup?._id) {
            setSelectedUser(null)
            fetch(getUsersByGroupRoute, {
                body: JSON.stringify({id: selectedGroup._id}),
                method: 'POST', headers: {
                    'Content-Type': 'application/json', 'x-access-token': user
                }
            }).then(response => response.json().then(data => ({
                data: data, status: response.status
            })).then(res => {
                setUsers(res.data.users?.filter((u) => {
                    return u._id !== getUserId();}))

            }))
            if (socket.current) {
                socket.current.removeAllListeners("msg-receive");
            }
            socket.current = io(host);
            socket.current.emit("joinRoom", {token: user, group_id: selectedGroup._id});
            console.log("joinRoom", {token: user, group_id: selectedGroup._id});
            chatFunc.refresh(getMessagesRoute, selectedGroup._id);
        }
    }, [selectedGroup]);
    useEffect(() => {
        if (selectedUser?._id) {
            setSelectedGroup(null)
            if (socket.current) {
                socket.current.removeAllListeners("msg-receive");
            }
            socket.current = io(host);
            socket.current.emit("joinChat", {token: user, to: selectedUser._id});
            console.log("joinChat", {token: user, group_id: selectedGroup._id});
            chatFunc.refresh(getPrivateMessages, selectedUser._id);
        }
    }, [selectedUser]);

    const createGroup = () => {
        setOverlay(true);
        setAddGroup(true);
        setActive(false);
    }


    const toggleClass = () => {

        let list = [];
        if (!active) {
            getOtherGroups();
        }
        setActive(!active);
        setAddGroup(false);
        setOverlay(true);
    };

    const getOtherGroups = () => {
        fetch(getGroupsRoute, {
            method: 'POST', headers: {
                'Content-Type': 'application/json', 'x-access-token': user
            },
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {

            setGroups(res.data.groups);
        }))
    }


    const addGroupSubmit = (e) => {
        e.preventDefault();
        let t = groupFields;
        t.image = selectedFile;
        fetch(createGroupRoute, {
            method: 'POST', headers: {
                'x-access-token': user, 'Content-Type': 'application/json'
            }, body: JSON.stringify(t)
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            if (res.data.status === true) {
                let t = groups;
                setMyGroups(myGroups.concat(res.data.group));
                closeEverything();
            }
        }));
    }

    const closeEverything = () => {
        setActive(false);
        setOverlay(false);
        setAddGroup(false);
        setGroupMenu(false);
    };


    const wt_decode = (token) => {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };


    const addGroupChangeHandler = (e) => {
        const {name, value} = e.target;
        setGroupFields((groupFields) => ({
            ...groupFields, [name]: value
        }));
    }

    useEffect(() => {
        if (!localStorage.getItem('user')) {
            navigate('/login');
        }


        if (tokenIsExpired(user)) {
            disconnect();
        }

        loadGroups();
        setUserProfilePicture(wt_decode(user).id);
    }, []);

    function disconnect() {
        localStorage.removeItem('user');
        navigate('/login');
    }

    function getUserId(){
        return wt_decode(user).id;
    }

    function tokenIsExpired(token) {
        var decoded = wt_decode(token);
        var now = new Date();
        var exp = new Date(decoded.exp * 1000);
        return now > exp;
    }


    const loadGroups = () => {
        let token = user;
        const userJson = wt_decode(token);
        setMyGroups([]);

        if (!userJson) {
            localStorage.removeItem('user');
            navigate('/login');
        } else {
            let t = [];
            fetch(getGroupsOfUserRoute, {
                method: 'POST', headers: {
                    'x-access-token': token, 'Content-Type': 'application/json'
                }
            }).then(response => {

                return response.json()
            }).then(data => ({
                data: data
            })).then(res => {
                setMyGroups(res.data.servers_id_and_image);
            })
            groupsLoaded = false;
        }
    }


    const quitGroup = (id) => {
        setSelectedGroup({});
        console.log("quitting group");
        fetch(quitGroupRoute, {
            method: 'POST', headers: {
                'x-access-token': user, 'Content-Type': 'application/json'
            }, body: JSON.stringify({
                id_group: id
            })
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {

            if (res.data.status === true) {
                loadGroups();
                getOtherGroups();
            }
        }));
    }
    const joinGroup = (id) => {
        fetch(joinGroupRoute, {
            method: 'POST', headers: {
                'x-access-token': user, 'Content-Type': 'application/json'
            }, body: JSON.stringify({id_group: id})
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            if (res.data.status === true) {
                let t = myGroups;
                setMyGroups(myGroups.concat(res.data.group));
                getOtherGroups();
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

    function getGroupHeader() {
        return selectedGroup?._id ? <div className="group-page-header">
            <div className={"group-page-title"}>
                <h1>
                    {selectedGroup.nom}
                </h1>
                <p>
                    {selectedGroup.description}
                </p>
            </div>
            <button onClick={() => {
                setGroupMenu(true);
                setOverlay(true);
            }}><FontAwesomeIcon icon={faEllipsisV}/></button>
        </div> : <h2>No group selected</h2>;
    }

    function getUserHeader() {
        return selectedUser?._id ? <div className="group-page-header">
            <div className={"group-page-title"}>
                <h1>

                   Chat privé avec {selectedUser.first_name} {selectedUser.second_name}
                </h1>
                <p>
                    
                </p>
            </div>
        </div> : <h2>No group selected</h2>;
    }

    function getGroupChat() {
        return  selectedGroup?._id  ? <Chat getMessagesRoute={getMessagesRoute} sendMessageUrl={sendMessageRoute} group={selectedGroup} socket={socket} chatFunc={chatFunc}/> :null;
    }function getPrivateChat() {
        return selectedUser?._id ?  <Chat group={selectedUser} getMessagesRoute={getPrivateMessages} sendMessageUrl={sendPrivateMessageRoute} socket={socket} chatFunc={chatFunc}/> : null;
    }

    function getChat() {
        return selectedGroup?._id ?
            getGroupChat() : getPrivateChat();
    }

    return (<div className="dashboard">
        <nav>
            <div className="nav-wrapper">
                {myGroups.map((group, index) => {
                    return <button
                        onClick={() => {

                            setSelectedGroup(group);
                            setModifyProfile(false);
                        }}

                        style={{
                            backgroundImage: "url(" + group.image + ")",
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
        <div className="group-page">

            {modifyProfile ? <UserProfile/> : selectedUser?._id ? getUserHeader() : getGroupHeader()
            }
            {modifyProfile ? undefined : getChat()}



        </div>

{
    users?.length ? <div className="users"> <div className="users-list">
    {users.map((u) => {
        return <div  className={
            selectedUser?._id === u?._id ? "user selected" : "user"} onClick={() => setSelectedUser(u)} style={{
            backgroundImage: "url(" + u.profile_img + ")",
        }}>
            <h2>{u.first_name} {u.second_name}</h2>
        </div>
    })}
</div>
</div>:null
}
        
        <div className={active ? 'visible addGroupMenu' : 'addGroupMenu'}>
            <div className={"existing-groups"}>
                <div className="addGroupMenu_header">
                    <h1>Join a group</h1>
                    <input placeholder={"Search a group"} value={filter} onChange={(e) => {
                        setFilter(e.target.value)
                    }} className={"existing-groups-filter"}/>
                    <div className={"existing-groups-list"}>
                        {groups.length !== 0 ?

                            groups.map((group, index) => {
                                if (!filter || group.nom.toLowerCase().includes(filter.toLowerCase())) {
                                    return <div onClick={() => {
                                        joinGroup(group?._id)
                                    }} className="group-button" value={group?._id}>
                                        <div className={"group-button-icon"} style={{
                                            backgroundImage: "url(" + group.image + ")",
                                        }}></div>
                                        <h2>{group.nom}</h2></div>
                                } else {

                                }
                            }) : <h2>No group found</h2>}
                    </div>

                </div>
            </div>
            <div className={"create-group"}>
                <button onClick={createGroup}>Add a non existing group</button>
            </div>
        </div>

        <div className={groupMenu ? "group-menu visible" : "group-menu"}>
            <button onClick={closeEverything}><FontAwesomeIcon icon={faTimes}/></button>
            <button onClick={() => {
                quitGroup(selectedGroup?._id);
                closeEverything();

            }}><FontAwesomeIcon icon={faSignOutAlt}/></button>
        </div>

        <div className={addGroup ? 'visible create-group-menu' : 'create-group-menu'}>
            <div className={"create-group-menu-header"}>
                <h1>Create a group</h1>
            </div>
            <form onSubmit={addGroupSubmit}>
                <div className={"preview-container"}>
                    <input type='file' onChange={onSelectFile}/>
                    <img className="preview" src={selectedFile}/></div>
                <input value={groupFields.nom} onChange={addGroupChangeHandler} required
                       placeholder="Group name" name="nom"/>
                <input value={groupFields.description} onChange={addGroupChangeHandler} required
                       placeholder="Description" name="description"/>

                <button type="submit">Create</button>
            </form>

        </div>


        <div className={overlay ? "overlay visible" : "overlay"} onClick={closeEverything}>

        </div>
    </div>);
}
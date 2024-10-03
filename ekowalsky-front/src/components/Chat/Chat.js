import React, {useEffect, useRef, useState} from "react";
import { getUserRoute} from "../../utils/APIRoutes";


import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


export default function Chat({group, socket, chatFunc, sendMessageUrl,getMessagesRoute}) {

    const [messages, setMessages] = useState([]);
    const scrollRef = useRef();
    const [arrivalMessage, setArrivalMessage] = useState();
    const [users, setUsers] = useState([]);
    const [gettingImages, setGettingImages] = useState([]);
    const messagesEndRef = useRef(null)

    const user = localStorage.getItem("user");

    const wt_decode = (token) => {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    const getUserProfilePicture = (id) => {
        if (gettingImages[id]) {
            return;
        }
        if (users[id]) {
            return users[id].profile_img;
        } else {
            let t = gettingImages;
            t[id] = true;
            setGettingImages(t);
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
                    console.log(res.data.user);
                    setUsers({...users, [id]: res.data.user});
                    t[id] = false;
                    setGettingImages(t);
                    return res.data.user.profile_img;
                }
            }))
        }
    }


    useEffect(() => {

        chatFunc.refresh = (url,id) => {
            setMessages([]);
            fetch(url, {
                method: "POST", headers: {
                    "Content-Type": "application/json", "x-access-token": localStorage.getItem("user")
                }, body: JSON.stringify({
                    id_group: id
                })
            }).then(response => response.json().then(data => ({
                data: data, status: response.status
            })).then(res => {
                console.log(res);
                if (res.data.status) {
                    setMessages(res.data.messages);
                }
            }))


            socket.current.removeAllListeners("msg-receive")
            if (socket.current) {
                socket.current.on("msg-receive", (data) => {
                    setArrivalMessage({user_id: data.user_id, message: data.msg, timestamp: data.timestamp});
                });
            }
        }
    },[]);


    const handleSendMsg = async (msg) => {
        const data = wt_decode(user);


        fetch(sendMessageUrl, {
            method: 'POST', headers: {
                'Content-Type': 'application/json', 'x-access-token': user
            }, body: JSON.stringify({
                from: data.id, to: group._id, message: msg,
            })
        }).then(response => response.json().then(data => ({
            data: data, status: response.status
        })).then(res => {
            if (res.data.status) {
                socket.current.emit("send-msg", {
                    to: group._id, from: user, msg,
                });
                const msgs = [...messages];
                msgs.push(res.data.message);
                setMessages(msgs);
            }


        }));


    };


    useEffect(() => {
        arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);
    const [msg, setMsg] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const handleEmojiPickerhideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiClick = (event, emojiObject) => {
        let message = msg;
        message += emojiObject.emoji;
        setMsg(message);
    };

    const sendChat = (event) => {
        event.preventDefault();
        if (msg.length > 0) {
            handleSendMsg(msg);
            setMsg("");
        }
    };


    const userProfilePicture = (id) => {
        let img = getUserProfilePicture(id);
        return <img src={img} alt="" className="rounded-circle" width="30px" height="30px"/>
    }


    return (

        <div className="group-page-body">
            <div className="chat-messages">
                {messages.map((message, index) => {
                    return <div className={"message"}>
                        <div className={"message-user"}>


                            {userProfilePicture(message?.user_id)}


                            <div className={"message-user-name"}>
                                {users[message?.user_id]?.first_name}
                                &nbsp;
                                {users[message?.user_id]?.second_name}
                                &nbsp;
                                <span style={{fontSize:"10px",opacity:0.8}}> {new Date(message?.date * 1).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className={"message-content"}>{message?.message}</div>
                    </div>
                })}
                <div ref={messagesEndRef} />

            </div>

            <form className="input-container" onSubmit={(event) => sendChat(event)}>
                <input
                    type="text"
                    placeholder="type your message here"
                    onChange={(e) => setMsg(e.target.value)}
                    value={msg}
                />
                <button type="submit">
                    <FontAwesomeIcon icon={faPaperPlane}/>
                </button>
            </form>
        </div>);

}
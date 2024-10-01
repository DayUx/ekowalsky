const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./api/routes/userRoutes');
const socket = require("socket.io");
const {hasAccess} = require("./api/controller/schoolController");
const jwt = require("jsonwebtoken");
var bodyParser = require('body-parser');


const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({limit: '5mb'}));
app.use('/', userRoutes);

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err.message);
});

const server = app.listen(process.env.PORT, () => {
    console.log('Server is running : ' + process.env.PORT);
})


const io = socket(server, {
    cors: {
        origin: "http://localhost:3000", credentials: true,
    },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("joinRoom", (data) => {
        try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            if (hasAccess(decoded.id, data.school_id)) {
                console.log("User has access to this school");
                console.log(data.school_id);
                socket.join(data.school_id);
            }

        } catch (e) {

        }
    });
    socket.on("leave", () => {
        try {
            socket.leaveAll();


        } catch (e) {
            next(e);
        }
    });

    socket.on("send-msg", (data) => {
        try {
            const decoded = jwt.verify(data.from, process.env.JWT_SECRET);
            console.log(data);
            if (hasAccess(decoded.id, data.to)) {
                console.log("User has access to thissqd");
                socket.to(data.to).emit("msg-receive", {user_id: decoded.id, msg: data.msg, timestamp: Date.now()});
            }
        } catch (e) {
            console.log(e);
        }
    });
});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./api/routes/userRoutes');
const socket = require("socket.io");
const {hasAccess, getChatId} = require("./api/controller/groupController");
const jwt = require("jsonwebtoken");
var bodyParser = require('body-parser');


const app = express();
require('dotenv').config();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.json({ limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
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
global.io = io;
io.on("connection", (socket) => {

    global.chatSocket = socket;
    socket.on("joinRoom", (data) => {
        try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            if (hasAccess(decoded.id, data.group_id)) {
                socket.join(data.group_id);
                console.log("connected to " + data.group_id);
            }

        } catch (e) {

        }
    });
    socket.on("joinChat", (data) => {
        try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            getChatId(decoded.id, data.to).then((chat_id) => {
                socket.join(chat_id);
                console.log("connected to " + chat_id);
            })
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
});
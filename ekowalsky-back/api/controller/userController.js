const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const Group = require("../model/groupModel");
const Chats = require("../model/chatModel");
module.exports.register = async (req, res, next) => {
    try {
        const {first_name, second_name, email, password,profile_img} = req.body;
        const mailCheck = await Users.findOne({email: email});
        if (mailCheck) {
            return res.json({
                message: "Mail already used",
                status: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Users.create({
            first_name: first_name,
            second_name: second_name,
            email: email,
            password: hashedPassword,
            profile_img: profile_img,
        });
        delete user.password;
        delete user.profile_img;
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            second_name: user.second_name,
        }, process.env.JWT_SECRET, {expiresIn: '24h'});


        return res.json({status : true, user: token});
    }catch (e){
        next(e);
    }
};

module.exports.getUser = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(req.body.id,{password:0,email:0});
        if(!user){
            return res.json({status : false, message: "User not found"});
        }

        return res.json({status : true, user: user});
    }catch (e){
        next(e);
    }
}


module.exports.login = async (req,res, next) =>{
    try {
        const {email, password} = req.body;
        const user = await Users.findOne({email: email});
        if (!user) {
            return res.json({
                message: "User not found",
                status: false,
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({
                message: "Password is invalid",
                status: false,
            });
        }
        delete user.password;
        delete user.profile_img;
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            second_name: user.second_name,
        }, process.env.JWT_SECRET, {expiresIn: '24h'});

        return res.json({status : true, user: token});
    }catch (e){
        next(e);
    }
};


module.exports.sendPrivateMessage = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        let chat = await Chats.findOne({ $or: [{ user_one: userJson.id, user_two: req.body.to }, { user_one: req.body.to, user_two: userJson.id }] });
        let message = req.body.message;
        let messageObject = {
            date: new Date(),
            message: message,
            user_id: userJson.id
        };
        if (!chat) {

            chat = await Chats.create({
                user_one: userJson.id,
                user_two: req.body.to,
                messages: [messageObject]
            });

        } else {
            chat.messages.push(messageObject);
            await chat.save();
        }

        global.chatSocket.to(chat._id.toString()).emit("msg-receive", {user_id: userJson.id, msg: message, date: Date.now()});
        return res.json({status: true, message: messageObject});

    } catch (e) {
        next(e);
    }
}

module.exports.getPrivateMessages = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);

        const chat = await Chats.findOne({ $or: [{ user_one: userJson.id, user_two: req.body.id_group }, { user_one: req.body.id_group, user_two: userJson.id }] });
        if (!chat) {
            return res.json({status: false, message: "Chat not found"});
        } else {
            return res.json({status: true, messages: chat.messages});
        }
    } catch (e) {
        next(e);
    }
}

module.exports.updateUser = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(userJson.id);
        if (!user) {
            return res.json({status: false, message: "User not found"});
        }
        const {first_name, second_name, email, password,profile_img} = req.body;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        if (first_name) {
            user.first_name = first_name;
        }
        if (second_name) {
            user.second_name = second_name;
        }
        if (email) {
            user.email = email;
        }
        if (profile_img) {
            user.profile_img = profile_img;
        }
        await user.save();
        delete user.password;
        delete user.profile_img;
        token = jwt.sign({
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                second_name: user.second_name,
            },
            process.env.JWT_SECRET, {expiresIn: '24h'});
        return res.json({status: true, user: token});
    }catch (e){
        next(e);
    }
}
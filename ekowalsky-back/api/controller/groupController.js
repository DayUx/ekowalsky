const Group = require('../model/groupModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

module.exports.images = async (req, res, next) => {
    try {

        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const id_et_image = await Group.find({"users.user_id": userJson.id}, {users: 0});
        return res.json({status: true, servers_id_and_image: id_et_image});
    } catch (e) {
        next(e);
    }
};

module.exports.hasAccess = async (userId, groupId) => {
    try {
        let group = await Group.findById(groupId);
        if (!group) {
            return false;
        }
        group = group.users.find(user => user.user_id === userId);
        if (!group) {
            return false;
        }
        return true;

    } catch (e) {
        return false;
    }
}

module.exports.getGroups = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const groups = await Group.find({"users.user_id": {$ne: userJson.id}}, {users: 0});
        return res.json({status: true, groups: groups});
    } catch (e) {
        next(e);
    }
}

module.exports.createGroup = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {nom, image, description} = req.body;
        const group = await Group.create({
            nom: nom, image: image, users: [{user_id: userJson.id}], description: description,
        });
        delete group.users;
        return res.json({status: true, group: group});
    } catch (e) {
        next(e);
    }
}

module.exports.joinGroup = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {id_group} = req.body;
        const group = await Group.findById(id_group);
        if (!group) {
            return res.json({status: false, message: "Group not found"});
        } else if (group.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are already in this group"});
        } else {
            group.users.push({user_id: userJson.id});
            await group.save();
            delete group.users;
            return res.json({status: true, group: group});
        }
    } catch (e) {
        next(e);
    }
}


module.exports.quitGroup = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {id_group} = req.body;
        const group = await Group.findById(id_group);
        if (!group) {
            return res.json({status: false, message: "Group not found"});
        } else if (!group.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are not in this group"});
        } else {
            group.users = group.users.filter(user => user.user_id !== userJson.id);
            await group.save();
            delete group.users;
            return res.json({status: true, group: group});
        }
    } catch (e) {
        next(e);
    }
}


module.exports.messages = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {id_group} = req.body;
        const group = await Group.findById(id_group);
        if (!group) {
            return res.json({status: false, message: "Group not found"});
        } else if (!group.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are not in this group"});
        } else {
            return res.json({status: true, messages: group.messages});
        }
    } catch (e) {
        next(e);
    }
};


module.exports.sendMessage = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {to, message} = req.body;
        const msg = await Group.findById(to);
        if (msg == null) {
            return res.json({status: false, message: "Group not found"});
        } else if (!msg.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are not in this group"});
        } else {
            msg.messages.push({user_id: userJson.id, date: Date.now(), message: message});
            await msg.save();


            return res.json({status: true, message: {user_id: userJson.id, date: Date.now(), message: message}});
        }


    } catch (e) {
        next(e);
    }
}
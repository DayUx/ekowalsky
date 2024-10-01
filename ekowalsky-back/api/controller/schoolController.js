const School = require('../model/schoolModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

module.exports.images = async (req, res, next) => {
    try {

        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const id_et_image = await School.find({"users.user_id": userJson.id}, {users: 0});
        return res.json({status: true, servers_id_and_image: id_et_image});
    } catch (e) {
        next(e);
    }
};

module.exports.hasAccess = async (userId, schoolId) => {
    try {
        let school = await School.findById(schoolId);
        if (!school) {
            return false;
        }
        school = school.users.find(user => user.user_id === userId);
        if (!school) {
            return false;
        }
        return true;

    } catch (e) {
        return false;
    }
}

module.exports.getSchools = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const schools = await School.find({"users.user_id": {$ne: userJson.id}}, {users: 0});
        return res.json({status: true, schools: schools});
    } catch (e) {
        next(e);
    }
}

module.exports.createSchool = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {nom, image, description} = req.body;
        const school = await School.create({
            nom: nom, image: image, users: [{user_id: userJson.id}], description: description,
        });
        delete school.users;
        return res.json({status: true, school: school});
    } catch (e) {
        next(e);
    }
}

module.exports.joinSchool = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {id_school} = req.body;
        const school = await School.findById(id_school);
        if (!school) {
            return res.json({status: false, message: "School not found"});
        } else if (school.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are already in this school"});
        } else {
            school.users.push({user_id: userJson.id});
            await school.save();
            delete school.users;
            return res.json({status: true, school: school});
        }
    } catch (e) {
        next(e);
    }
}


module.exports.quitSchool = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {id_school} = req.body;
        const school = await School.findById(id_school);
        if (!school) {
            return res.json({status: false, message: "School not found"});
        } else if (!school.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are not in this school"});
        } else {
            school.users = school.users.filter(user => user.user_id !== userJson.id);
            await school.save();
            delete school.users;
            return res.json({status: true, school: school});
        }
    } catch (e) {
        next(e);
    }
}


module.exports.messages = async (req, res, next) => {
    try {
        const token = req.headers['x-access-token'];
        const userJson = await jwt.verify(token, process.env.JWT_SECRET);
        const {id_school} = req.body;
        const school = await School.findById(id_school);
        if (!school) {
            return res.json({status: false, message: "School not found"});
        } else if (!school.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are not in this school"});
        } else {
            return res.json({status: true, messages: school.messages});
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
        const msg = await School.findById(to);
        if (msg == null) {
            return res.json({status: false, message: "School not found"});
        } else if (!msg.users.find(user => user.user_id === userJson.id)) {
            return res.json({status: false, message: "You are not in this school"});
        } else {
            msg.messages.push({user_id: userJson.id, date: Date.now(), message: message});
            await msg.save();


            return res.json({status: true, message: {user_id: userJson.id, date: Date.now(), message: message}});
        }


    } catch (e) {
        next(e);
    }
}
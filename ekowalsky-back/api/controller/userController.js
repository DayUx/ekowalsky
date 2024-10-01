const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
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
        console.log(req.body.id);
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
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
   first_name: {
         type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true,
   },
    second_name: {
        type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
            trim: true,
    },
    email: {
        type: String,
            required: true,
            minlength: 5,
            maxlength: 50,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
            required: true,
            minlength: 10,
            maxlength: 100,
            trim: true,
    },
    profile_img: {
        type: String,
            default: "",
    },
    messages: [{
        date: {
            type: 'string',
            required: true
        },
        message: {
            type: 'string',
            required: true
        },
        user_id: {
            type: 'string',
            required: true
        }
    }]
});


module.exports = mongoose.model('Users', userSchema);


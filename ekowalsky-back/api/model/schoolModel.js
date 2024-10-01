var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    nom: {
        type: 'string',
        required: true
      },
      description: {
        type: 'string',
        required: true
      },
      image: {
        type: 'string',
        required: true
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
          
      }],
      users: [{
        user_id: {
            type: 'string',
            required: true
          }
        }]
    
});


module.exports = mongoose.model('Schools', schoolSchema);
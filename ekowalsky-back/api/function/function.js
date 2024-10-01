var MongoClient = require('mongodb').MongoClient;
// creation db social_network
var url = "mongodb://localhost:30000/social_network";

class User {
    constructor(name, mail, passwd, profile_img, school_name, job, old_age) {
        this.name = name;
        this.mail = mail;
        this.password = passwd;
        this.profile_img = profile_img;
        this.school_name = school_name;
        this.job = job;
        this.old_age = old_age;
    }

    /**
     * it adds collections User and Message to mongodb social_network
     * To use this function, u should open a connection to your database
     * */
    createCollections() {
        // connection à la db cinema
        var dbo = db.db("social_network");
        // création de la collection
        dbo.createCollection("User", {
            bsonType: "object",
            required: ["name", "mail", "password", "profile_img", "school_name", "job", "old_age"],
            properties: {
                name: {
                    bsonType: "string", description: "must be a string and is required"
                }, mail: {
                    bsonType: "string", description: "must be a string and is required"
                }, password: {
                    bsonType: "string", description: "must be an integer and is required"
                }, profile_img: {
                    bsonType: "string", description: "must be a string and is required"
                }, school_name: {
                    bsonType: "string", description: "must be a string and is required"
                }, job: {
                    bsonType: "string", description: "must be a string and is required"
                }, old_age: {
                    bsonType: "int", description: "must be an integer and is required"
                }
            }
        });
        dbo.createCollection("School", {

            bsonType: "object", required: ["nom", "description", "ville", "messages", "users"], properties: {
                nom: {
                    bsonType: "string", description: "must be a string and is required"
                }, description: {
                    bsonType: "string", description: "must be a string and is required"
                }, ville: {
                    bsonType: "string", description: "must be a string and is required"
                }, messages: {
                    bsonType: "array", items: {
                        bsonType: "object", required: ["date", "message", "id_user"], properties: {
                            date: {
                                bsonType: "string", description: "must be a string and is required"
                            }, message: {
                                bsonType: "string", description: "must be a string and is required"
                            }, id_user: {
                                bsonType: "string", description: "must be a string and is required"
                            }
                        }
                    }
                }, users: {
                    bsonType: "array", items: {
                        user_id: {
                            bsonType: "string", description: "must be a string and is required"
                        }
                    }
                }
            }
        });
    }

    /**
     * Allows you to delete a user in the db
     * @param {*} nom name of the user you want to delete
     * @param {*} mail mail of the user you want to delete
     */
    deleteUser(nom, mail) {
        var myquery = {nom: nom, mail: mail};
        dbo.collection("User").deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    }

    /**
     * Allows you to delete a school in the db
     * @param {*} nom name of the school you want to delete
     * @param {*} ville city of the school you want to delete
     */
    deleteSchool(nom, ville) {
        var myquery = {nom: nom, ville: ville};
        dbo.collection("School").deleteOne(myquery, function (err, obj) {
            if (err) throw err;
            console.log("1 document deleted");
            db.close();
        });
    }

    /**
     * Allows to insert some users in the table User
     * @param {*} name the names of the users
     * @param {*} mail the mails of the users
     * @param {*} password the password of the users
     * @param {*} profile_img the images link of the users
     * @param {*} school_name the school names of the users
     * @param {*} job the jobs of the users
     * @param {*} old_age the ages of the users
     */
    insertUser(first_name, second_name, mail, password) {
        dbo.collection("User").insertMany({
            first_name: first_name,
            second_name: second_name,
            mail: mail,
            password: password,
        }, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });

    }

    /**
     * Allows to insert ONE school
     * @param {*} name
     * @param {*} description
     * @param {*} ville
     */
    insertSchool(name, description, ville, users_id) {
        var msg = []
        var usr = [{
            user_id: users_id
        }]
        var myobj = [{
            nom: name, description: description, ville: ville, messages: msg, users: usr
        }]
        dbo.collection("School").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    }


    /**
     * it allows to verify if the user with the mail/mdp still exists
     * @param {*} mail the mail of the user
     * @param {*} mdp the password of the user
     * @returns the attributs of the user in the db
     */
    verifyExistingUser(mail, mdp) {
        var tmp = null;
        dbo.collection("User").findOne({name, profile_img, school_name, job, old_age}, {
            mail: mail, password: mdp
        }, function (err, result) {
            if (err) throw err;
            console.log(result.name);
            if (result.name != null) {
                return [name, profile_img, school_name, job, old_age];
            }
            db.close();
        });
        return tmp;
    }

    /**
     * it allows to have all data of the customers collection
     * @return all data of the collection
     */
    listAll() {
        dbo.collection("customers").find({}).toArray(function (err, result) {
            if (err) throw err;
            db.close();
            return result;
        });
    }
}


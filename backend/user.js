<<<<<<< HEAD
const mongoose = require('mongoose');  

const Schema = mongoose.Schema;  
const userSchema = new Schema({ name: String, password: String });  

=======
const mongoose = require('mongoose');  

const Schema = mongoose.Schema;  
const userSchema = new Schema({ name: String, password: String });  

>>>>>>> f86090e91735f6b4aa6f1b3b84b372af40de207c
module.exports = mongoose.model('user', userSchema, 'users');  
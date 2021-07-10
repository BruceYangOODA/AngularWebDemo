const express = require('express')
const router = express.Router()
const User = require('./user')

const mongoose = require('mongoose')
const _url = 'mongodb://localhost:27017'
mongoose.connect(_url, err => {  
    if(err) console.log('DB Err! ', err)
    else console.log('DB connected')
});

router.get('/', (req, res) => { 
    console.log("body",req.body);
    console.log('get connected API')
    res.send('200') 
    res.end()});  

router.post('/register', (req, res) => {
    let userData = req.body;
    User.findOne({name:userData.name}, (err,user) =>{
        if(err) console.log(err);  
        if(!user) {
            let newUser = new User(userData)
            newUser.save((err, registUser) =>{
                if(err) console.log(err)
                else  res.status(200).send(registUser)                
            })
        }
        else { 
            invalidUser = { name: userData.name, password: '' }
            res.status(200).send(invalidUser)}
    })
    
    /*
    let user = new User(userData);
    user.save((err, registeredUser) => {
        if(err) console.log(err);  
        else res.status(200).send(registeredUser);
    });*/
});

router.post('/login', (req, res) => {
    let userData = req.body;
    let respUser = { name: '', password: '' }
    User.findOne({name: userData.name}, (err, user) =>{        
        if(err) console.log(err);  
        else {
            if (!user) {                
                res.status(200).send(respUser);}
            else {
                respUser.name = userData.name
                if(user.password != userData.password) {                    
                    res.status(200).send(respUser)  }
                else {
                    respUser.password = user.password
                    res.status(200).send(respUser) }
            }
        }
    })
})

router.get('/events', (req, res) => {})

router.post('/newroom', (req, res) => {
    let roomData = req.body
    console.log(roomData)
    res.status(200).send(roomData)

})

module.exports = router;  
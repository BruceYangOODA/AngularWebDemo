const User = require('./user')

var roomList = []


loginUser = (userData, fn) => {
    let name = userData.name
    let password = userData.password
    User.findOne({name:name}, (err, user) => {
        if(err) console.log(err)
        if(!user) fn({name:'', password:password})
        else { 
            if(user.password ==password) fn(user)
            else fn({name:name, password:''})
        }
    })
}

registUser = (userData, fn) => {
    let name = userData.name
    let password = userData.password
    User.findOne({name:name}, (err, user) =>{
        if(err) console.log(err);  
        if(!user) {
            let newUser = new User(userData)
            newUser.save((err, registUser) =>{
                if(err) console.log(err)
                fn(registUser)
            })
        }
        else {
            let newUser = { name:user.name, password:''}
            fn(newUser)
        }
    })
}

createRoom = (roomId, bundle, fn) =>{
    let roomName = bundle.roomName
    let userId = bundle.userId
    let userName = bundle.userName
    
    let room = roomList.find(ele => ele.name == roomName)    
    if(!room) {
        let newRoom = {
            id: roomId,
            name: roomName,
            users: [{id:userId, name:userName}]
        }
        roomList.push(newRoom)
        fn(newRoom)
    }
    else fn(null)
}

getAllRoom = (fn) =>{
    fn(roomList)
}

getRoomById = (roomId, fn) =>{
    let _room = roomList.find(room => room.id == roomId)    
    fn(_room)    
}

addUsertoRoom = (bundle, fn) =>{
    let roomId = bundle.roomId
    let userId = bundle.userId
    let userName = bundle.userName
    let room = roomList.find(ele => ele.id == roomId)    
    if(!room) fn(null)
    else {        
        room.users.push({id:userId, name:userName})
        fn(room)
    }
}

removeUserFromRoom = (userId, fn) => {    
    delRoomIds = []
    roomList.forEach(room => {        
        let userIndex = room.users.findIndex(user => user.id==userId)        
        if(userIndex != -1) {
            room.users.splice(userIndex,1)        
            if(room.users.length == 0) delRoomIds.push(room.id)
        }
    })
    fn(delRoomIds)
}

removeRoom = (delRoomIds) => {    
    let newList = roomList.filter(room => !delRoomIds.includes(room.id))
    roomList = newList
}
/*
export interface Room {
  name: string,
  id: string,
  users: Array<User>,
}*/

module.exports = {
    registUser: registUser,
    loginUser: loginUser,
    addUsertoRoom: addUsertoRoom,
    createRoom: createRoom,
    getAllRoom: getAllRoom,
    getRoomById: getRoomById,
    removeUserFromRoom: removeUserFromRoom,
    removeRoom: removeRoom,


}
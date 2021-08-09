import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RegistComponent } from './dialog/regist.component';
import { InfoComponent } from './dialog/info.component';
import { UserService } from '../service/user.service';
import { NavigationExtras, Router } from '@angular/router';

export interface User {
  name: string,  
  id: string,
  password?: string,
}

export interface Room {
  name: string,
  id: string,
  users: Array<User>,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  userModel = { name: '', password: '', id:''}  
  roomName = ''
  isLogin: boolean = false
  roomList: Array<Room> = []    
  @ViewChild('account', { read: ElementRef }) accountRef!: ElementRef;
  @ViewChild('pw', { read: ElementRef }) pwRef!: ElementRef;
  @ViewChild('btnLogin', { read: ElementRef }) loginRef!: ElementRef;
  @ViewChild('userForm', { read: ElementRef }) userForm!: ElementRef;

  constructor(public dialog: MatDialog,
              private userService: UserService,
              private _router: Router) 
    {     
      this.userService.connect()      
  }

  ngOnInit(): void {

    this.userService.sendGetSocketId('get-socket-id')
    this.userService.listenGetSocketId('get-socket-id', (socket_id) => this.userModel.id = socket_id)

    this.userService.sendGetAllRoom('all-room')        
    this.userService.listenGetAllRoom('all-room', (roomList) => this.roomList = roomList)
    this.userService.listenRoomDisconnected('room-disconnected',(room_id) => {
      let room_index = this.roomList.findIndex(room => room.id == room_id)
      if(room_index != -1) this.roomList.splice(room_index,1)
    })

    this.userService.listenLogin('login-user', (user)=>{
      if (user.password == '') this.openInfoDialog("密碼錯誤")  
      else if (user.name == '') this.openInfoDialog("無此帳號")
      else {
      this.isLogin = true
      this.openInfoDialog("成功登入")
      }
    })

    this.userService.listenRegist('regist-user', (user) =>{
      if (user.password == '') this.openInfoDialog("帳號重複")
      else this.openInfoDialog(("帳號 " + user.name + " 建立完成,請重新登入"))
    })

    this.userService.listenCreateRoom('create-room',(newRoom) =>{         
      if (!newRoom) this.openInfoDialog('已有此名稱的會議')
      else {
        let navigationExtras: NavigationExtras = { state: {room:newRoom, creater:true}}
        this._router.navigate(['channel', newRoom.id], navigationExtras)
      }
    })
    
    this.userService.listenJoinRoom('join-room', (room) =>{
      if(!room) this.openInfoDialog('會議已結束')
      else {
        let navigationExtras: NavigationExtras = { state: {room:room, creater:false}}
        this._router.navigate(['channel', room.id],navigationExtras)
      }
    })

    this.userService.listenAddRoom('add-room', (newRoom) =>{
      this.roomList.push(newRoom)
      console.log('newRoom',this.roomList[0].users)
    })

    this.userService.listenUpdateRoom('update-room', (room) =>{
      for (var i=0; i<this.roomList.length;i++){
        if(this.roomList[i].id == room.id) this.roomList[i] = room
      }
    })

    this.userService.listenUserDisconnected('user-disconnected', (userId) =>{
      let id = ''+userId
      this.roomList.forEach(room =>{
          for(var i=0;i<room.users.length;i++){
            if(room.users[i].id == id) {              
              room.users.splice(i, 1)
            }
          }
      })
    })
  }
  ngAfterViewInit(): void {
  }
  validName(): boolean {
    if (this.userModel.name === '') return true
    return false
  }
  validPw(): boolean {
    if (this.userModel.password === '') return true
    return false
  }

  openRegistDialog(): void {
    let dialogRef = this.dialog.open(RegistComponent);
    dialogRef.afterClosed().subscribe((userData) => {
      if (userData == null) return
      else {
        if (userData.name == '' || userData.password == '') this.openInfoDialog("帳號與密碼不可以空白");
        else this.userService.sendCheckUserData('regist-user', userData)
      }
    })
  }

  openInfoDialog(msg: string): void {
    this.dialog.open(InfoComponent, { data: msg });
  }

  loginUser(): void {
    if (this.userModel.name == '' || this.userModel.password == '') 
        this.openInfoDialog('請先輸入帳號密碼')     
    else if (this.isLogin) this.logout()
    else this.userService.sendCheckUserData('login-user', this.userModel)
  }

  logout() {
    this.isLogin = !this.isLogin
    this.openInfoDialog('登出帳號')
    this.userModel.name = ''
    this.userModel.password = ''
  }

  createNewRoom() {   
    if(!this.isLogin) { 
      this.openInfoDialog('請先登入帳號')
      return
     }
    let newRoom = {
      roomName: this.roomName,
      userName: this.userModel.name,
      userId: this.userModel.id,
    }
    this.userService.sendNewRoom('create-room', newRoom) 
  }

  joinRoomBtnClick(room: Room) { 
    if(!this.isLogin) { 
      this.openInfoDialog('請先登入帳號')
      return
     }

    let newRommBundle = {      
      roomId: room.id,
      userId: this.userModel.id,
      userName: this.userModel.name
    }      
    this.userService.sendJoinRoom('join-room', newRommBundle)    
  }

  test(event: any) {
    console.log('channelList',this.roomList);
    console.log('userModel',this.userModel)
    
  }

}

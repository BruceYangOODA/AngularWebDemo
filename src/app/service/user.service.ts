import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User, Room } from '../components/home.component';
import { SignalMessage, UserPeer} from '../components/channel.component';
import { io, Socket } from 'socket.io-client';
//import { SignalData } from 'simple-peer'; 
import { MatDialog } from '@angular/material/dialog';
import { InfoComponent } from '../components/dialog/info.component';
import * as SimplePeer from 'simple-peer';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private socket!: Socket
  private url = 'http://localhost:3000' // your server local path  

  constructor() { 
  }

  connect() {
    this.socket = io(this.url, {transports: ['websocket', 'polling', 'flashsocket']});    
  }

  getSocketId(): string{
    if(this.socket == undefined) return ''
    else return this.socket.id
  }

  private listen(socket_msg: string, fn: (bundle:any) => void) {
    this.socket.on(socket_msg, fn)
  }

  private send(socket_msg: string, bundle: any) {
    this.socket.emit(socket_msg, bundle)
  }  

  listenLogin(socket_msg: string, fn:(user:User)=> void) {
    this.listen(socket_msg, fn)    
  }
  listenRegist(socket_msg: string, fn:(user:User)=> void) {
    this.listen(socket_msg, fn)
  }  
  listenAddRoom(socket_msg: string, fn:(room:Room) => void) {
    this.listen(socket_msg, fn)
  }
  listenCreateRoom(socket_msg: string, fn:(room:Room | null)=> void){
    this.listen(socket_msg, fn)
  }
  listenJoinRoom(socket_msg: string, fn:(room:Room | null) => void) {
    this.listen(socket_msg, fn)
  }
  listenUpdateRoom(socket_msg: string, fn:(room: Room) => void) {
    this.listen(socket_msg, fn)
  }
  listenUserDisconnected(socket_msg: string, fn:(user: User) => void) {
    this.listen(socket_msg, fn)
  }
  listenUserJoinRoom(socket_msg: string, fn:(user: User) => void) {
    this.listen(socket_msg, fn)
  }
  listenUserLeftRoom(socket_msg: string, fn:(userId: string) => void) {
    this.listen(socket_msg, fn)
  }
  listenOfferSignal(socket_msg:string, fn:(msg: SignalMessage) => void) {
    this.listen(socket_msg, fn)
  }
  listenAcceptSignal(socket_msg:string, fn:(msg: SignalMessage) => void) {
    this.listen(socket_msg, fn)
  }
  listenGetAllRoom(socket_msg: string, fn: (roomList: Array<Room>) => void) {
    this.listen(socket_msg, fn)
  }
  listenGetSocketId(socket_msg:string, fn:(socekt_id: string) => void) {
    this.listen(socket_msg, fn)
  }
  listenRoomDisconnected(socket_msg:string, fn:(room_id: string) => void) {
    this.listen(socket_msg, fn)
  }
  sendGetSocketId(socket_msg:string) {
    this.send(socket_msg, {})
  }
  sendNewRoom(socket_msg:string, newRoom: any) {    
    this.send(socket_msg, newRoom)
  }
  sendOfferSignal(socket_msg:string, msg: SignalMessage) {
    this.send(socket_msg, msg)
  }
  sendAcceptSignal(socket_msg:string, msg: SignalMessage) {
    this.send(socket_msg, msg)
  }
  sendJoinRoom(socket_msg: string, newRoomBundle: any) {
    this.send(socket_msg, newRoomBundle)
  }
  sendCheckUserData(socket_msg: string, user: User) {
    this.send(socket_msg, user)
  }
  sendGetAllRoom(socket_msg: string) {    
    this.send(socket_msg, {})    
  }
  

  getRoomById(socket_msg: string, roomId: string, fn: (room: Room) => void) {
    this.send(socket_msg, roomId)
    this.listen(socket_msg, fn)
  }


}



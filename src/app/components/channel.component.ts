import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as SimplePeer from 'simple-peer';
import { UserService } from '../service/user.service';
import { Room, User } from './home.component';

export interface SignalMessage {
  offerId: string,
  acceptId: string,
  signalData: SimplePeer.SignalData,
  msg?: string,
  roomName?: string
}

export interface UserStream {
  id: string,
  stream: MediaStream,
}

export interface UserPeer {
  id: string,
  peer: SimplePeer.Instance
}

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css'],
})
export class ChannelComponent implements OnInit, AfterViewInit {


  @ViewChild('local_video') localVideo!: ElementRef<HTMLVideoElement>
  @ViewChild('screen_video') screenVideo!: ElementRef<HTMLVideoElement>
  @ViewChild('videoList', { read: ElementRef }) videoList!: ElementRef

  peerList: Array<UserPeer> = []
  streamList: Array<UserStream> = []  
  room!: Room
  
  localStream!: MediaStream
  socket_id: string = ''
  screen_id_select= ''

  //videoHT = "<button>靜音</button><video id="
  //videoML = " width='100%'></video>"
  //temproom = {users:[{id:'1',name:'a'},{id:'2',name:'b'},{id:'3',name:'c'}]}
  isRoomCreater: boolean = false

  constructor(
    private userService: UserService,
    private _router: Router) {
    let socketId = this.userService.getSocketId()
    if (!socketId) this._router.navigate(['home'])
    this.socket_id = socketId

    if (this._router.getCurrentNavigation()?.extras.state?.room) {
      this.room = this._router.getCurrentNavigation()?.extras.state?.room
      this.isRoomCreater = this._router.getCurrentNavigation()?.extras.state?.creater

      let userIndex = this.room.users.findIndex(user => user.id==this.socket_id)
      if(userIndex != -1) this.room.users.splice(userIndex,1)
    }
    /*
        let id = this._route.snapshot.paramMap.get('room');
        if (id) {      
          this.userService.getRoomById('room-by-id', id, (room) => {
            if (!room) this._router.navigate(['home'])
            this.room = room
          })
        }*/
  }

  ngAfterViewInit(): void {
    //this.createUserVideoElement()

    navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 }, audio: true })
      .then((stream) => {
        this.localVideo.nativeElement.srcObject = stream
        this.localVideo.nativeElement.play()

        if(!this.isRoomCreater) this.offerSignalToOthers(stream)

        this.listenOfferSignal(stream)

      })
  }

  ngOnInit(): void {
    this.userService.listenUserJoinRoom('user-join-room', (newUser) => {      
      this.addUserToRoom(newUser)      
    })

    this.userService.listenUserLeftRoom('user-left-room', (userId) => {      
      this.removeUserFromRoom(userId)      
    })
  }

  createUserVideoElement() {
    this.room.users.forEach(user => {
      //if (user.id == this.socket_id) return
     // this.videoList.nativeElement.innerHTML += this.videoHT + user.id + this.videoML
    })
  }

  listenOfferSignal(stream: MediaStream) {
    this.userService.listenOfferSignal('offer-signal', (msg) => {
      console.log('offer-signal', msg)
      const peer: SimplePeer.Instance = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream
      })

      peer.on('signal', (signal) => {
        console.log('accept-signal start', signal)
        this.userService.sendAcceptSignal('accept-signal', {
          offerId: msg.offerId,
          acceptId: msg.acceptId,
          signalData: signal
        })
      })

      peer.on('stream', (stream) => {
        console.log('accept-signal stream', stream)
        this.addUserStream(msg.offerId, stream)        
      })

      peer.signal(msg.signalData)
      this.peerList.push({ id: msg.offerId, peer: peer })
    })
  }

  offerSignalToOthers(stream: MediaStream) {
    this.room.users.forEach(user => {
      //if (user.id == this.socket_id) return

      const peer: SimplePeer.Instance = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream
      })

      peer.on('signal', (signal) => {
        console.log('offer-signal start', signal)
        let msg = {
          offerId: this.socket_id,
          acceptId: user.id,
          signalData: signal
        }
        this.userService.sendOfferSignal('offer-signal', msg)
      })

      peer.on('stream', (stream) => {
        console.log('offer-signal stream', stream)
        this.addUserStream(user.id, stream)
      })

      this.userService.listenAcceptSignal('accept-signal', (msg) => {
        console.log('accept-signal', msg)
        peer.signal(msg.signalData)
      })
      this.peerList.push({ id: user.id, peer: peer })
    })
  }

  addUserStream(userId: string, stream: MediaStream) {
    this.streamList.push({id:userId, stream:stream})
        let videoElement = <HTMLVideoElement>document.getElementById(userId)
        if (videoElement) {
          videoElement.srcObject = stream
          videoElement.muted = true
          videoElement.play()
        }
  }

  addUserToRoom(user: User){
    this.room.users.push(user)
  }

  removeUserFromRoom(userId: string){
    let userIndex = this.room.users.findIndex(user => user.id==userId)
    if(userIndex != -1) this.room.users.splice(userIndex,1)

    let streamIndex = this.streamList.findIndex(stream => stream.id==userId)
    if(streamIndex != -1) this.streamList.splice(streamIndex,1)

    let videoElement = document.getElementById(userId)
    if (videoElement) videoElement.remove()

    let peerIndex = this.peerList.findIndex(peer => peer.id==userId)
    if(peerIndex != -1) {
      let peer = this.peerList.splice(peerIndex,1)[0].peer      
      peer.destroy()
    }

    if(this.screen_id_select == userId) this.screenVideo.nativeElement.srcObject = null
  }
  screenChange(){    
    if(!this.screen_id_select) 
    {
      this.screenVideo.nativeElement.srcObject = null
    }
    else {
      this.streamList.forEach(ele => {
        if(ele.id == this.screen_id_select) {
          this.screenVideo.nativeElement.srcObject = ele.stream
          this.screenVideo.nativeElement.muted = false
          this.screenVideo.nativeElement.play()
        }
      })
    }
  } 

  getMuteStatus(userId: string): boolean {
    let videoElement = <HTMLVideoElement>document.getElementById(userId)
    if(videoElement) return videoElement.muted
    return true
  }

  muteBtnClick(userId: string) {
    console.log("userId CLICK",userId)
    let videoElement = <HTMLVideoElement>document.getElementById(userId)
    if(videoElement) videoElement.muted = !videoElement.muted
  }

  test() {
    
    console.log("socketId ",this.socket_id)
    //this.createUserVideoElement()
    /*
    console.log('peerList', this.peerList)
    if(this.peerList) {
      let peer = this.peerList[0].peer
      console.log('peer', peer)
      peer.on('stream', stream =>{
        this.testVideo.nativeElement.srcObject = stream
        this.testVideo.nativeElement.play()
      })
          }*/

          /*
    console.log('streamList', this.streamList)
    if (this.streamList) {
      let stream = this.streamList[0].stream
      console.log('stream', stream)
      this.screenVideo.nativeElement.srcObject = stream
      this.screenVideo.nativeElement.play()

    }*/


    /*
    let id = 'vv'
    let inner = "<video id=" + id + " width='100%' autoplay>"
      + "<source src='/assets/test.mp4' type='video/mp4'></video>"

    let videoList = document.getElementById('videoList')
    console.log(videoList)
    if (videoList) {
      videoList.innerHTML += inner
      //video.play()
    }
    //console.log('videoList value', this.videoList.nativeElement.value)
    //console.log('videoList', this.videoList.nativeElement.innerHTML)*/
  }

}



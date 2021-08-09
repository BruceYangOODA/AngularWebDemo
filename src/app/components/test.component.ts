import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoplayer!: ElementRef;
  @ViewChild('local_video') localVideo!: ElementRef<HTMLVideoElement>;
  constructor() { }

  ngOnInit(): void {
    
  }
  ngAfterViewInit() {
    navigator.mediaDevices.getUserMedia({video:true, audio:true})
    .then((stream) => {
      this.localVideo.nativeElement.srcObject = stream;
    })

  }
  play() { }


  toggleVideo(event: any) {
    this.videoplayer.nativeElement.play();
  }

}

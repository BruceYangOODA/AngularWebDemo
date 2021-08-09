import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { TestComponent } from './components/test.component';
import { HomeComponent } from './components/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './module/material.module';
import { RegistComponent } from './components/dialog/regist.component';
import { InfoComponent } from './components/dialog/info.component';
import { HttpClientModule } from '@angular/common/http';
import { ChannelComponent } from './components/channel.component';


const routes: Routes = [
  { path: '',  component: HomeComponent},
  { path: 'channel/:room', component: ChannelComponent},
  { path: 'test', component: TestComponent},
  { path: 'home', component: HomeComponent},
  {path: '**', redirectTo:'/home'}
]


@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    HomeComponent,
    RegistComponent,
    InfoComponent,
    ChannelComponent 
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

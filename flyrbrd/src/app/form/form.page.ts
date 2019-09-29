import { Component, OnInit } from '@angular/core';
//import { EventData } from '../../interfaces/data.interface';
import { EventData } from './data.interface';
import { Storage } from '@ionic/storage';
import {Location} from '@angular/common';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {
  event: EventData = {
    key: "hayahHYagsj34hsada",
    title: "MinKao SexWeek Gone Wrong",
    subtitles: ["MinKao C++","YArtish", "Professor Patel on life with herpes"],
    date: "October 8, 2019",
    notes:" Minkao C++ clubs will be hosting sexweek with guest speaker Ankush patel talking about his secret life with herpes and how he hid it for years",
    qr: "https://pornhub.com",
    loc: "Minkao 301"
  };

  constructor(private storage: Storage, private _location: Location) { }

  ngOnInit() {
  }

  backClicked() {
    this._location.back();
  }

  changeTitle(newTitle: string, index: number){
    let temp: string =  this.event.title;
    this.event.title = newTitle;
    this.event.subtitles[index] = temp;
  }

  updateEvent(){
    if(this.event.key.length){
      const epochNow = (new Date).getTime();
      this.storage.set(epochNow.toString(), event);
    }else{
      this.storage.set(this.event.key, event);
    }
  }
}

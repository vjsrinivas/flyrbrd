import { Component } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview';
import jsQR, { QRCode } from "jsqr";
import { HomeService } from '../services/home.service';
import { VisionService } from '../services/vision.service';
import { LogicProvider } from '../services/read';
import { Observable } from "rxjs";
import { EventData } from '../../interfaces/data.interface';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public classExpand: string;
  private viewList: HTMLElement;
  public viewListWord: string;
  events$: Observable<EventData[]>;
  public totalEvents: number;

  constructor(private vision: VisionService,
    public _read: LogicProvider, private homeService: HomeService) {
    this.classExpand = 'card';
    this.viewListWord = 'VIEW LIST';
    this.totalEvents = 0;
  }

  ionViewWillEnter() {
    const options = {
      x: 0,
      y: 0,
      width: window.screen.width,
      height: window.screen.height,
      camera: CameraPreview.CAMERA_DIRECTION.BACK,
      toBack: true,
      tapPhoto: false,
      tapFocus: true,
      previewDrag: false,
      storeToFile: false,
      disableExifHeaderStripping: false,
      alpha: 1
    };

    CameraPreview.startCamera(options).then(
      (val) => { console.log(val); },
      (err) => { console.log(err); }
    );

    this.events$ = this._read.getData()
    this.events$.subscribe((res) => {
      this.totalEvents = res.length;
    })
  }

  ionViewDidEnter() {
    this.viewList = document.getElementById('viewList');
  }

  takePicture() {
    const cameraOptions = {
      quality: 85
    };

    CameraPreview.takePicture(cameraOptions).then(
      (base64) => {
        this.vision.grab_packet_data(base64).subscribe(
          (val) => {
            const img = 'data:image/jpeg;base64,' + val;
            this.vision.parse_packet_data(img);
          }, (innerErr) => {
            console.log(innerErr);
          }
        );

        console.log("here goes getImageDimensions");
        this.homeService.getImageDimensions(base64[0]).then(
          (img) => {
            this.homeService.jsQR_fromBase64(base64[0]).then(
              (val) => {
                let imageData: Uint8ClampedArray;
                imageData = val;
                const code = jsQR(imageData, img.w, img.h);

                if(code) {
                  alert(code.data);
                }
              }
            );
          }, (err) => {
            console.log(err);
          }
        );
      },
      (err) => { console.log(err); }
    );
  }

  expand() {
    this.viewList.classList.toggle('expand');
    if(this.viewListWord === 'VIEW LIST') {
      this.viewListWord = 'EXIT LIST';
    } else {
      this.viewListWord = 'VIEW LIST';
    }
  }
}

import { Component } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview';
import { VisionService } from '../services/vision.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public classExpand: string;
  private viewList: HTMLElement;
  constructor(private vision: VisionService) {
    this.classExpand = 'card';
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
  }

  ionViewDidEnter() {
    this.viewList = document.getElementById('viewList');
    console.log(this.viewList);
  }

  takePicture() {
    const cameraOptions = {
      width: 640,
      height: 640,
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
      },
      (err) => { console.log(err); }
    );
  }

  expand() {
    this.viewList.classList.toggle('expand');
  }
}

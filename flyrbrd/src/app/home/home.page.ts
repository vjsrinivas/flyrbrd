import { Component } from '@angular/core';
import { CameraPreview, CameraPreviewPictureOptions, CameraPreviewOptions } from '@ionic-native/camera-preview';
import jsQR, { QRCode } from "jsqr";
import { VisionService } from '../services/vision.service';
import { HomeService } from '../services/home.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private vision: VisionService, private homeService: HomeService) { }

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

  takePicture() {
    const cameraOptions = {
      width: window.screen.width,
      height: window.screen.height,
      quality: 85
    };

    CameraPreview.takePicture(cameraOptions).then(
      (base64) => {
        this.vision.grab_packet_data(base64).subscribe(
          (val) => {
            this.vision.parse_packet_data(val);
          }, (innerErr) => {
            console.log(innerErr);
          }
        );
        this.homeService.jsQR_fromBase64(base64[0]).then(
          (val) => {
            let imageData: Uint8ClampedArray;
            console.log(val);
            imageData = val;
            const code = jsQR(imageData, window.screen.height, window.screen.width);
            if (code) {
              console.log(code.data);
            }
          },
          (err) => { console.log(err); }
        )
      },
      (err) => { console.log(err); }
    );
  }

  swipeUp(event: any) {
    console.log(event);
  }

  swipedown(event: any) {
    console.log(event);
  }
}

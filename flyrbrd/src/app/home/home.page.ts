import { Component } from '@angular/core';
import jsQR, { QRCode } from "jsqr";
import { HomeService } from '../services/home.service';

let LOGO: string = "";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(homeService: HomeService) {

    let imageData: Uint8ClampedArray;
    /*
    console.log(LOGO);


    let qr_2 = this.base64ToBuffer(LOGO);
    console.log(qr_2);
    const qr = Uint8ClampedArray.from(qr_2);
    console.log(qr);
    */

    homeService.jsQR_fromBase64(LOGO).then(
      (val) => {
        console.log(val);
        imageData = val;
        const code = jsQR(imageData, 1000, 1333);
        if (code) {
          console.log(code.data);
        }
      },
      (err) => { console.log(err); }
    )

  }



  public base64ToBuffer(base64: string) {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  }

  test() {
    alert();
  }
}

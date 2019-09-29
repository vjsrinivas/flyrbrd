import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  jsQR_fromBase64(base64: string): Promise<Uint8ClampedArray> {
    return new Promise<Uint8ClampedArray>((resolve, reject) => {
      const image: HTMLImageElement = document.createElement('img');
      image.src = 'data:image/jpg;base64,'+base64;
      //console.log('data:image/jpg;base64,'+base64);
      image.onload = () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const context: CanvasRenderingContext2D = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        try {
          const imageData = context.getImageData(0, 0, image.width, image.height).data.buffer;
          //console.log(imageData);
          const arrayClamp = new Uint8ClampedArray(imageData);
          console.log(arrayClamp);
          // const qrCode: QRCode = jsQR(imageData.data, imageData.width, imageData.height);
          resolve(arrayClamp);
        } catch (e) {
          reject(e);
        }
      };
    });
  }

  getImageDimensions(file): Promise<any> {
    return new Promise<any> ((resolve, reject) => {
      let i = new Image();
      i.src = 'data:image/jpg;base64,'+file;
      i.onload = function(){
        const img = {w: i.width, h: i.height};
        resolve(img);
      };
    })
  };

  constructor() { }
}

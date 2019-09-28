import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, ObservableInput, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { keys } from '../../environments/keys';

@Injectable({
  providedIn: 'root'
})
export class VisionService {

  base64img: string;
  constructor(private http: HttpClient) {
  }

  run_image_detect(base64img: string): Observable<any> {
    const googleUrl = 'https://vision.googleapis.com/v1/images:annotate';
    const request = {
      requests: [
        {
          image: {
            content: base64img
          },
          features: [
            {
              type: 'TEXT_DETECTION'
            }
          ]
        }
      ]
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    console.log(JSON.stringify(request));

    return this.http.post(googleUrl + '?key=' + keys.googleVisionKey, request, httpOptions);
  }

}

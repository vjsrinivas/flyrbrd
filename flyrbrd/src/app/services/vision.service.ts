import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, ObservableInput, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { keys } from '../../environments/keys';

@Injectable({
  providedIn: 'root'
})
export class VisionService {

  private base64img: string;
  constructor(private http: HttpClient) {
  }

  grab_packet_data(base64img: string): Observable<any> {
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

  parse_packet_data(jsonObj): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const body = jsonObj.responses;
      console.log(body);
      const textSummary = body[0].textAnnotations;

      if (textSummary.length) {
        const summary = textSummary[0].description;
        console.log(summary);
      }

      // figure out where the biggest bounding box is:
      this.biggest_bounding_box(body[0].fullTextAnnotation);
    });
  }

  biggest_bounding_box(jsonObj, pageNum = 0) {
    // assuming jsonObj is fullTextAnnotation
    // get all the bounding boxes in a list
    const blocks = jsonObj.pages[pageNum].blocks;
    let biggestAreaElement;
    let biggestArea = 0;
    if (blocks) {
      blocks.forEach(element => {
        console.log(element);
        const vert = element.boundingBox.vertices;
        for (let i = 0; i < vert.length; i++) {
          if (!vert[i].x) { vert[i].x = 0; }
          if (!vert[i].y) { vert[i].y = 0; }
        }

        const area = this.calculate_area(vert[0].x, vert[0].y, vert[1].x, vert[1].y, vert[2].x, vert[2].y, vert[3].x, vert[3].y);
        if (area >= biggestArea) {
          biggestAreaElement = element;
          biggestArea = area;
        }
      });
    }
  }

  calculate_area(x1, y1, x2, y2, x3, y3, x4, y4) {
    return (0.5) * (
      ((x1 * y2) + (x2 * y3) + (x3 * y4) + (x4 * y1))
      -
      ((x2 * y1) + (x3 * y2) + (x4 * y3) + (x1 * y4))
    );
  }
}

import { Injectable, ɵLocaleDataIndex } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, ObservableInput, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { keys } from '../../environments/keys';
import { EventData } from '../../interfaces/data.interface';

@Injectable({
  providedIn: 'root'
})
export class VisionService {

  private base64img: string;
  constructor(private http: HttpClient) {
  }

  grab_packet_data(base64img: string): Observable<any> {
    const googleUrl = 'https://vision.googleapis.com/v1/images:annotate';
    console.log(base64img);
    const request = {
      requests: [{
          image: {
            content: base64img
          },
          features: [{
              type: 'DOCUMENT_TEXT_DETECTION'
          }]
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

  parse_packet_data(jsonObj, productJSON: EventData): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const body = jsonObj.responses;
      console.log(body);
      const textSummary = body[0].textAnnotations;

      if (textSummary.length) {
        const summary = textSummary[0].description;
        productJSON.flyer.date = this.determine_date(summary);
        productJSON.flyer.notes = summary;
      }

      // figure out where the biggest bounding box is:
      // console.log('Biggest areas:');
      const topThree = this.biggest_bounding_box(body[0].fullTextAnnotation);
      // console.log(topThree);
      productJSON.flyer.title = topThree[0][0];
      productJSON.flyer.subtitles = topThree.splice(1)[0];
    });
  }

  biggest_bounding_box(jsonObj, pageNum = 0): string[][] {
    // returns top three objects in decreasing areas
    // assuming jsonObj is fullTextAnnotation
    // get all the bounding boxes in a list
    const blocks = jsonObj.pages[pageNum].blocks;
    const topThreeAreaElements = [];
    if (blocks) {
      blocks.forEach(element => {
        const vert = element.boundingBox.vertices;
        for (let i = 0; i < vert.length; i++) {
          if (!vert[i].x) { vert[i].x = 0; }
          if (!vert[i].y) { vert[i].y = 0; }
        }

        const area = this.calculate_area(vert[0].x, vert[0].y, vert[1].x, vert[1].y, vert[2].x, vert[2].y, vert[3].x, vert[3].y);
        if (!topThreeAreaElements.length) {
          topThreeAreaElements.push(element);
        } else if (topThreeAreaElements.length < 3) {
          let i = 0;
          for (i = 0; i < topThreeAreaElements.length; i++) {
            if (topThreeAreaElements[i] <= area) {
              topThreeAreaElements[i] = element;
              break;
            }
          }

          if (i === topThreeAreaElements.length) {
            topThreeAreaElements.push(element);
          }
        } else {
          for (let i = 0; i < topThreeAreaElements.length; i++) {
            if (topThreeAreaElements[i] <= area) {
              topThreeAreaElements[i] = element;
              break;
            }
          }
        }
      });
    }

    const topWords: string[][] = [];
    topThreeAreaElements.forEach(element => {
      topWords.push(this.generate_string(element));
    });

    return topWords;
  }

  calculate_area(x1, y1, x2, y2, x3, y3, x4, y4) {
    return (0.5) * (
      ((x1 * y2) + (x2 * y3) + (x3 * y4) + (x4 * y1))
      -
      ((x2 * y1) + (x3 * y2) + (x4 * y3) + (x1 * y4))
    );
  }

  generate_string(element): string[] {
    const finalWords = [];
    console.log(element);
    const listParagraphs = element.paragraphs;
    listParagraphs.forEach(paragraph => {
      const listWords = paragraph.words;
      if (listWords) {
        listWords.forEach(item => {
          let combiner = '';
          for (let i = 0; i < item.symbols.length; i++) {
            combiner = combiner.concat(item.symbols[i].text);
          }
          finalWords.push(combiner);
        });
      } else {
        console.log('no words in paragraph?');
      }
    });

    return finalWords;
  }

  determine_date(allInput: string) {
    let date = '';
    const weekdays = ['mon', 'tues', 'wed', 'thrus', 'fri', 'sat', 'sun'];
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];
    const time = ['pm', 'am'];
    const dayth = ['th', 'nd'];
    const rawInput = allInput.toLowerCase();

    // figure out max and min positions of possible date attributes:
    let earliestMonth = rawInput.length;
    let earliestWeekday = rawInput.length;
    let earliestTime = rawInput.length;
    let latestDayth = rawInput.length;

    months.forEach(element => {
      const tmp = rawInput.indexOf(element);
      if (tmp !== -1 && tmp <= earliestMonth) {
        earliestMonth = tmp;
      }
    });

    weekdays.forEach(element => {
      const tmp = rawInput.indexOf(element);
      if (tmp !== -1 && tmp <= earliestWeekday) {
        earliestWeekday = tmp;
      }
    });

    time.forEach(element => {
      const tmp = rawInput.indexOf(element);
      if (tmp !== -1 && tmp <= earliestTime && tmp !== 0) {
        if ((rawInput[tmp - 1] >= '0' && rawInput[tmp - 1] <= '9') || (rawInput[tmp - 1] === ' ')) {
          earliestTime = tmp;
        }
      }
    });

    dayth.forEach(element => {
      const tmp = rawInput.lastIndexOf(element);
      if (tmp !== -1 && tmp >= latestDayth) {
        latestDayth = tmp;
      }
    });

    // console.log("Here is earliest:");
    // console.log(earliestMonth);
    // console.log(earliestWeekday);
    // console.log(earliestTime);

    const ladderDay = [latestDayth, earliestMonth, earliestWeekday, earliestTime];
    let minner = 9999;
    let maxxer = -1;

    ladderDay.forEach(ladder => {
      if (ladder !== rawInput.length) {
        if (minner >= ladder) {
          minner = ladder;
        }

        if (maxxer <= ladder) {
          maxxer = ladder;
        }
      }
    });

    // console.log("minner and maxxer");
    // console.log(minner);
    // console.log(maxxer);

    // try to find new line or other delimiter in case minimum is not what we want:
    // most date parts break new line:
    const newlineHit = rawInput.indexOf('\n', maxxer);
    const slashHit = rawInput.indexOf('|', maxxer);

    if (slashHit !== -1) {
      date = allInput.slice(minner, slashHit);
    } else if (newlineHit !== -1) {
      date = allInput.slice(minner, newlineHit);
    } else {
      date = allInput.slice(minner, maxxer);
    }
    console.log(date);

    if (minner === -1 || maxxer === 9999) {
      return date;
    }
  }

  determine_location(allInput: string) {
    let loc = '';
    const rawInput = allInput.toLowerCase();
    const building = ['building', 'bld'];
    const room = ['room', 'rm'];
    let earliestBuilding = rawInput.length;
    let earliestRoom = rawInput.length;

    // building comes after so use lastindexof:
    building.forEach(element => {
      const tmp = rawInput.indexOf(element);
      if (tmp !== -1 && tmp <= earliestBuilding) {
        earliestBuilding = tmp;
      }
    });

    room.forEach(element => {
      const tmp = rawInput.indexOf(element);
      if (tmp !== -1 && tmp <= earliestRoom) {
        earliestRoom = tmp;
      }
    });

    let minner = 9999;
    let maxxer = -1;
    const ladderDay = [earliestBuilding, earliestRoom];
    ladderDay.forEach(ladder => {
      if (ladder !== rawInput.length) {
        if (minner >= ladder) {
          minner = ladder;
        }

        if (maxxer <= ladder) {
          maxxer = ladder;
        }
      }
    });

    // count two spaces:
    let spacer = 0;
    let latestRoom = earliestRoom;
    if (earliestRoom !== rawInput.length) {
      while (spacer !== 2) {
        if (rawInput[latestRoom] === ' ') {
          spacer += 1;
        } else if (rawInput[latestRoom] === '\n' && spacer === 1) {
          spacer += 1;
        } else {
          latestRoom++;
        }
      }
    }

    if (earliestBuilding !== rawInput.length && latestRoom !== rawInput.length) {
      loc = allInput.slice(earliestRoom, latestRoom);
    }

    if (minner === -1 || maxxer === 9999) {
      return loc;
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventData } from '../../interfaces/data.interface';
import { Observable } from 'rxjs';

@Injectable()
export class LogicProvider {

    private dataUrl: string = "assets/data.json"

      constructor(private http: HttpClient) { }

      getData(): Observable<EventData[]> {
        return this.http.get<EventData[]>(this.dataUrl)
     }

}
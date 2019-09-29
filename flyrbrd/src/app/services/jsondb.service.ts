import { Injectable } from '@angular/core';
import { EventData } from '../../interfaces/data.interface';

@Injectable({
  providedIn: 'root'
})
export class JsondbService {
  public JSONObjs = {};
  constructor() { }
}

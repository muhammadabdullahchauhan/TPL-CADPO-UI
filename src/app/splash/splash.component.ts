import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { WebResponseService } from '../web-response.service';
import { ApplicationData } from '../classes/application';

@Component({
  selector: 'app-splash',
  templateUrl: '../../assets/htmls/splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent {
  constructor(private apiResponse: WebResponseService) {
  
  }
}

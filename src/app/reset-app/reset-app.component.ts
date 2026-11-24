import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-app',
  templateUrl: '../../assets/htmls/reset-app.component.html',
  styleUrls: ['./reset-app.component.css']
})
export class ResetAppComponent {
constructor()
{
  location.href = "";
}
}

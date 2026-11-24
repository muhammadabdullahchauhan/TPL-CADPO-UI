import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-prefrences',
  templateUrl: '../../assets/htmls/change-prefrences.component.html',
  styleUrls: ['./change-prefrences.component.css']
})
export class ChangePrefrencesComponent {
  constructor(private _router: Router) {
 //   console.log("11");
    let stateObj = {
      ...this._router.getCurrentNavigation()?.extras.state
    }
  //  console.log(stateObj['url']); // should log out 'bar'
    this._router.navigate([stateObj['url'].replace("/","")]);
  }

}

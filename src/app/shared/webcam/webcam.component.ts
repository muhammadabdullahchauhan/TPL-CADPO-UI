import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { consoleLog } from 'src/app/classes/GlobalFunctions';

@Component({
  selector: 'app-webcam',
  templateUrl: '../../../assets/htmls/webcam.component.html',
  styleUrls: ['./webcam.component.css']
})
export class WebcamComponent  {
//camera
 // toggle webcam on/off
 public showWebcam = false;
 public allowCameraSwitch = true;
 public multipleWebcamsAvailable = false;
 public deviceId: string =""
 public videoOptions: MediaTrackConstraints = {
   // width: {ideal: 1024},
   // height: {ideal: 576}
 };
 @Output() outputPacket = new EventEmitter<any>();
 @Input() showPreview: boolean = false;
 public errors: WebcamInitError[] = [];

 // latest snapshot
 //public webcamImage: WebcamImage;

 // webcam snapshot trigger
 private trigger: Subject<void> = new Subject<void>();
 // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
 private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

 
 @Input() takePicture;
 @Input() altCamera;
//CAMERA


public ngOnInit(): void {
  if(this.showPreview){
    this.showWebcam = true;
  }
  WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
    this.takePicture.subscribe(v => { 
    consoleLog("webcam.component.ts","Taking Picture");
     this.showWebcam = true;
      setTimeout(()=>{
        this.triggerSnapshot();
        if(!this.showPreview){
          this.showWebcam = false;
          consoleLog("webcam.component.ts","Camera off");
        }
      
      },4000);
     
   
    });

    this.altCamera.subscribe(v => { 
     
    
   
    });
}

public triggerSnapshot(): void {
  this.trigger.next();
}

public toggleWebcam(): void {
  this.showWebcam = !this.showWebcam;
}

public handleInitError(error: WebcamInitError): void {
  this.errors.push(error);
}

public showNextWebcam(directionOrDeviceId: boolean|string): void {
  // true => move forward through devices
  // false => move backwards through devices
  // string => move to device with given deviceId
  this.nextWebcam.next(directionOrDeviceId);
}

public handleImage(webcamImage: WebcamImage): void {
//  console.info('received webcam image', webcamImage);
 // this.webcamImage = webcamImage;
 this.outputPacket.emit(webcamImage);
}

public cameraWasSwitched(deviceId: string): void {
 
  this.deviceId = deviceId;
}

public get triggerObservable(): Observable<void> {
  return this.trigger.asObservable();
}

public get nextWebcamObservable(): Observable<boolean|string> {
  return this.nextWebcam.asObservable();
}

// ngOnDestroy()
// {
//   this.showWebcam = false;
// }

 
}

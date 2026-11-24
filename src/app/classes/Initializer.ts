import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { fromEvent } from "rxjs/internal/observable/fromEvent";
import { SpinnerService } from "../dialogs/loading-dialog/spinner.service";
import { WebResponseService } from "../web-response.service";
import { ApplicationData } from "./application";
import {
  LogMethod,
  clearTransactionSession,
  consoleLog,
  getTransactiontTitle,
  logoutCustomer,
  validateAuthorization,
} from "./GlobalFunctions";
import Speech from "speak-tts"; // es6
import {
  ModalInterfaceModel,
  ModalInterfaceComponent,
} from "../dialogs/modal-interface/modal-interface.component";
import { DataService } from "./DataService";

@Injectable({
  providedIn: "root",
})
export class Initializer {
  private events: string[] = [
    "keydown",
    "click",
    "active",
    "mousemove",
    "focus",
    "onchange",
  ];
  static activitySession: boolean = false;
  constructor(
    private http: HttpClient,
    private _router: Router,
    public dialog: MatDialog,
    private apiResponse: WebResponseService,
    private spinnerService: SpinnerService,
    private dataService: DataService,
  ) {}
  idleTimeout: any;
  popupTimeout: any;

  result: any;
  spinnerRef: any;
  activityMonitoring: boolean = false;
  authInterval: any;
  healthInterval: any;
  statusInterval: any;
  dialogRef: any;
  outofServiceInterval: any;

  public stopMonitoring() {
    //  console.log("stopped monitoring");
    clearTimeout(this.idleTimeout);
    clearTimeout(this.popupTimeout);
    this.activityMonitoring = false;
  }
  public startMonitoring(sessionType?) {
    //    console.log("start monitoring");
    switch (sessionType) {
      case "cash":
        ApplicationData.config.currentInterval =
          ApplicationData.config.cashTimeout;
        break;

      case "cheque":
        ApplicationData.config.currentInterval =
          ApplicationData.config.chequeTimeout;
        break;

      default:
        ApplicationData.config.currentInterval =
          ApplicationData.config.sessionInterval;
        break;
    }

    //  console.log("Interval started for:" + ApplicationData.config.currentInterval);
    this.activityMonitoring = true;

    this.resetTimer();
    this.events.forEach((event) =>
      fromEvent(document, event).subscribe((_) => {
        this.resetTimer();
      }),
    );
  }

  resetTimer() {
    clearTimeout(this.idleTimeout);
    clearTimeout(this.popupTimeout);
    if (this.activityMonitoring == false) {
      return;
    }
    this.idleTimeout = setTimeout(() => {
      this.logoutConfirmation();
      //console.log("popupTimeout:" + ApplicationData.config.currentInterval);

      this.popupTimeout = setTimeout(() => {
        this.stopMonitoring();
        //  stopActivityMontioring();

        if (ApplicationData.sessionTransaction.accountTitle != "") {
          if (sessionStorage.getItem("currentAmount")) {
            this.dialog.closeAll();
            clearTimeout(this.idleTimeout);
            clearTimeout(this.popupTimeout);
            this.dataService.pushAbandonedTransaction(true);
            // this.apiResponse.openCloseDropdoor(0).subscribe((res: any) => {

            //     this.finalizeCancelation();
            // });
          } else {
            this.finalizeCancelation();
          }
        } else {
          this.finalizeCancelation();
        }
      }, ApplicationData.config.currentInterval);
    }, ApplicationData.config.currentInterval);
  }

  finalizeCancelation() {
    this.apiResponse.updateTransactionStatus("Abandoned", []).subscribe(
      (res: any) => {
        this.dataService.subject.next("Transaction Abandoned");
        ApplicationData.customer.collectedAmount = 0;

        logoutCustomer();
        clearTransactionSession();
        this.dialog.closeAll();
        if (ApplicationData.sessionTransaction.cashAcceptorIsBusy) {
          ApplicationData.sessionTransaction.cancellationPending = true;
        } else {
          //  this.dataService.subject.next("Transaction Ended");
          this._router.navigate(["thankyou"]);
          //  this.startMonitoring();
        }
        clearTimeout(this.idleTimeout);
        clearTimeout(this.popupTimeout);
      },
      (err) => {
        this.dataService.subject.next("Transaction Abandoned Error");
      },
    );
  }

  authTerminal() {
    clearTimeout(this.authInterval);
    this.authInterval = setTimeout(() => {
      this.apiResponse.getTWARE_NETWORK_STATUS().subscribe(
        (responseNetwork) => {
          consoleLog(
            "out-of-service.component.ts",
            "Requested Netowork Status",
            responseNetwork,
          );
          if (responseNetwork["code"] == "0000") {
            //SUCCESS

            if (
              ApplicationData.config.deviceCode == "" ||
              ApplicationData.config.ipAddress == "" ||
              ApplicationData.config.officeName == ""
            ) {
              this.apiResponse.getTWARE_DEVICE_AUTH().subscribe(
                (responseAuth) => {
                  consoleLog(
                    "out-of-service.component.ts",
                    "Requested Device Auth",
                    responseAuth,
                  );

                  if (
                    responseAuth["code"] == "0000" ||
                    responseAuth["code"] == "DEV_AUTH_0000"
                  ) {
                    //SUCCESS
                    ApplicationData.config.deviceCode =
                      responseAuth["data"]["terminalCode"];
                    ApplicationData.config.ipAddress =
                      responseAuth["data"]["ipAddress"];
                    ApplicationData.config.branchCode =
                      responseAuth["data"]["branchCode"];
                    ApplicationData.config.officeName =
                      responseAuth["data"]["officeName"];
                    ApplicationData.config.heartbeatInterval =
                      responseAuth["data"]["heartbeatInterval"];
                    ApplicationData.config.sessionInterval =
                      responseAuth["data"]["sessionInterval"];
                    ApplicationData.config.cashTimeout =
                      responseAuth["data"]["cashAcceptInterval"];
                    ApplicationData.config.chequeTimeout =
                      responseAuth["data"]["chequeAcceptInterval"];
                    ApplicationData.perefernces.batchCapacity =
                      responseAuth["data"]["batchCapacity"];
                    this.apiResponse.getLanguages()?.subscribe(
                      (data: any) => {
                        if (data["statusCode"] == "00") {
                          ApplicationData.perefernces.languages = data["data"];

                          for (let language of data["data"]) {
                            if (language["isDefault"] == true) {
                              this.apiResponse
                                .getLangMessages(language["languageCode"])
                                .subscribe((messages) => {
                                  WebResponseService.messages = {
                                    ...messages,
                                  };

                                  this.apiResponse
                                    .getLangLabels(language["languageCode"])
                                    .subscribe((labels) => {
                                      ApplicationData.labeling = {
                                        ...labels,
                                      };
                                    });
                                });
                            }
                          }
                          setTimeout(() => {
                            ApplicationData.perefernces.terminalAuthorized = true;
                          }, 2000);
                        } else {
                          this.authTerminal();
                        }
                      },
                      (err: any) => {
                        this.authTerminal();
                      },
                    );
                  } else {
                    this.authTerminal();
                  }
                },
                (err: any) => {
                  this.authTerminal();
                },
              );
            }
          } else {
            this.authTerminal();
          }
        },
        (err: any) => {
          this.authTerminal();
        },
      );
    }, 5000);
  }

  public start() {
    this.apiResponse.getConfigurationJSON().subscribe((data) => {
      WebResponseService.settings = {
        ...data,
      };
      ApplicationData.log.message = WebResponseService.settings.log_message;
      ApplicationData.log.response = WebResponseService.settings.log_response;
      ApplicationData.log.subsribed = WebResponseService.settings.log_message;

      localStorage.clear();

      this.authTerminal();
      this.checkTerminalHealth();
      this.checkTerminalStatus();
    });

    ApplicationData.speechObj = new Speech();
  }

  checkTerminalHealth() {
    this.healthInterval = setInterval(() => {
      this.apiResponse.checkTWARE_terminalHealth().subscribe(
        (responseData) => {
          // Add a 5-second delay

          if (
            WebResponseService.settings.log_interval == true &&
            WebResponseService.settings.production_TAgent == true
          ) {
            consoleLog(
              "Initializer.ts",
              "Checked Terminal Health",
              responseData,
            );
          }
          if (responseData["code"] == "0000") {
            let unsafe: boolean = false;
            ApplicationData.perefernces.terminalHealth = responseData;
            Object.keys(responseData["data"]).forEach((key) => {
              let sensorObj = responseData["data"][Number(key)];

              if (
                ApplicationData.perefernces.superUser == true &&
                String(sensorObj.deviceName).toLowerCase() ==
                  "facia door sensor"
              ) {
                location.href = "http://localhost:3643/sup";
              } else if (
                String(sensorObj.deviceName).toLowerCase().includes("sensor") &&
                String(sensorObj.status.health).toUpperCase() != "OK"
              ) {
                unsafe = true;
              }
            });
            // if (unsafe) {
            //     ApplicationData.perefernces.healthyTerminal = false;
            //     ApplicationData.perefernces.sensorWarning = true;
            //     if (!ApplicationData.perefernces.superUser) {
            //         ApplicationData.perefernces.criticallyOutService = true;
            //         this.stopMonitoring();

            //         if (ApplicationData.perefernces.inservice) {
            //             if (getTransactiontTitle() != "") {
            //                 this.dataService.pushCancelTransaction();
            //             }

            //             this._router.navigate(['out-of-service']);
            //         }
            //     }
            // }
            // else {

            //     ApplicationData.perefernces.healthyTerminal = true;

            // }
          } else {
            this.dataService.subject.next(
              "Health Error: " + responseData["code"],
            );
          }
        },
        (err) => {
          this.dataService.subject.next("Health Error: " + err["code"]);
        },
      );
    }, 5000);
  }

  checkTerminalStatus() {
    setInterval(() => {
      if (ApplicationData.perefernces.terminalAuthorized) {
        this.apiResponse
          .checkServiceStatus(ApplicationData.perefernces.lastServiceStatus)
          .subscribe(
            (serviceResponse: any) => {
              if (
                serviceResponse["code"] == "0000" &&
                ApplicationData.perefernces.lastServiceStatus !=
                  serviceResponse["message"]
              ) {
                if (
                  serviceResponse["message"].toUpperCase() == "IN SERVICE" &&
                  ApplicationData.perefernces.lastServiceStatus != "IN SERVICE"
                ) {
                  this._router.navigate(["home"]);
                } else if (
                  serviceResponse["message"].toUpperCase() == "OUT OF SERVICE"
                ) {
                  clearInterval(this.outofServiceInterval);
                  this.outofServiceInterval = setInterval(() => {
                    console.log(ApplicationData.perefernces.pendingResponse);
                    if (
                      !ApplicationData.perefernces.transactionPerformed &&
                      !ApplicationData.perefernces.pendingResponse
                    ) {
                      clearInterval(this.outofServiceInterval);
                      if (getTransactiontTitle() != "") {
                        this.dataService.pushCancelTransaction(
                          "OUT OF SERVICE",
                        );
                      } else {
                        this._router.navigate(["out-of-service"]);
                      }
                    }
                  }, 500);
                }
              }
            },
            (err) => {
              ApplicationData.perefernces.lastServiceStatus = "OUT OF SERVICE";
              if (getTransactiontTitle() != "") {
                this.dataService.pushCancelTransaction("OUT OF SERVICE");
              } else {
                this._router.navigate(["out-of-service"]);
              }
            },
          );
      }
    }, 5000);
  }

  @LogMethod
  logoutConfirmation() {
    let heading: "";
    let message: "";
    if (ApplicationData.sessionTransaction.transactionTitle == "") {
      heading = WebResponseService.messages.confirm_dismiss_session.heading;
      message = WebResponseService.messages.confirm_dismiss_session.message;
    } else {
      heading = WebResponseService.messages.confirm_dismiss_transaction.heading;
      message = WebResponseService.messages.confirm_dismiss_transaction.message;
    }

    //  this.dialog.closeAll();

    setTimeout(() => {
      const dialogData = new ModalInterfaceModel(
        heading,
        message,
        ApplicationData.dialogType._CONFIRMATION,
        ApplicationData.dialogIcon._CONFIRMATION,
      );
      this.dialogRef = this.dialog.open(ModalInterfaceComponent, {
        maxWidth: "700",
        data: dialogData,
      });
      this.dialogRef.disableClose = true;

      this.dialogRef.afterClosed().subscribe((dialogResult) => {
        this.stopMonitoring();

        if (dialogResult == false) {
          if (ApplicationData.sessionTransaction.systemreferencenumber != "") {
            this.dataService.pushCancelTransaction();
          } else {
            // setTimeout(() => {
            //     logoutCustomer();
            //     clearTransactionSession();
            //     this.dialog.closeAll();
            //     this._router.navigate(['thankyou']);
            // }, 2000);
            this.dataService.subject.next("Transaction cancelled by customer");
            logoutCustomer();
            clearTransactionSession();
            this.dialog.closeAll();
            this._router.navigate(["thankyou"]);
          }
        } else {
          //       clearTimeout(this.popupTimeout);
          if (
            localStorage.getItem("refreshed") != "outoforder" ||
            localStorage.getItem("refreshed") != "idle"
          ) {
            if (
              ApplicationData.sessionTransaction.transactionTitle != "" ||
              validateAuthorization() ||
              ApplicationData.customer.collectedAmount > 0
            ) {
              this.startMonitoring();
            }
          } else {
            this.stopMonitoring();
          }
        }
      });
    }, 200);
  }
}

export function speak(text) {
  if (!text.includes(".mp3")) {
    if (ApplicationData.speechObj.speaking) {
      ApplicationData.speechObj.cancel();
    }
    if (ApplicationData.speechObj.hasBrowserSupport()) {
      // returns a boolean
      ApplicationData.speechObj
        .init()
        .then((data) => {
          // The "data" object contains the list of available voices and the voice synthesis params

          ApplicationData.speechObj.setPitch(0.3);

          //  ApplicationData.speechObj.setVoice("Microsoft Zira - English (United States)");
          ApplicationData.speechObj
            .speak({
              text: text,
            })
            .then(() => {})
            .catch((e) => {});
        })
        .catch((e) => {});
    }
  } else {
    // PLAY MP3 VOICE HERE

    let audio = new Audio();
    audio.src = "assets/speech/ur-PK/" + text;
    audio.load();
    audio.play();
  }
}

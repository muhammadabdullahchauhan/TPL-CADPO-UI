# TPL CADPO UI

Touch-screen banking kiosk front end (Angular 15) for TouchPoint. Customers deposit cash or cheques, pay utility bills and top up mobile accounts on a portrait kiosk screen.

The app runs in **mock mode** by default, so it works without hardware or a bank backend.

## Features

- Cash deposit: own account, other account, other banks (interbank)
- Cheque deposit: own account, other account, by teller
- QR cash deposit
- Utility bill payment
- Mobile top-up
- CNIC input with biometric step
- Cash and cheque acceptor screens
- Receipt printing, thank-you screen and automatic return to home
- Inactivity timeout, device health checks, out-of-service screen
- English and Urdu (RTL) support

## Tech stack

- Angular 15, TypeScript
- Angular Material
- ngx-webcam, ngx-mask, simple-keyboard, swiper, sweetalert2, speak-tts

## Getting started

```bash
npm install --legacy-peer-deps
npm i -D @types/node@18 --legacy-peer-deps
ng serve
```

Open http://localhost:4200

Production build:

```bash
ng build
```

## Mock mode

API and hardware switches are in `src/assets/app_constants.json`. While `production_TWARE`, `production_QServices` and `production_TAgent` are `false`, all responses come from `src/app/classes/MockService`. Set them to `true` to call the real hardware and bank services (URLs are defined in `src/app/webservices.ts`).

## Project structure

```
src/
  app/
    classes/            Global data, helpers, initializer, device health, mock service
    transaction-flows/  One folder per transaction, each with a parent and step components
    transaction components/  cash-acceptor, cheque-acceptor
    shared/             numpad, webcam
    dialogs/            confirm, loading, modal, cash-stuck dialogs
    home/ splash/ cnic-input/ out-of-service/ thank-you/ reset-app/ ...
    web-response.service.ts   All API calls in one place
    webservices.ts            API URL list
    app-routing.module.ts     Routes
  assets/
    css/ htmls/ img/ app_constants.json  Styles, templates, images, config, labels
```

## Transaction flow

1. Splash, then Home
2. Customer picks a transaction
3. Parent component runs the steps: CNIC, account details, cash or cheque, review, result
4. Receipt is printed, then the thank-you screen returns to Home
5. Cancel at any step clears the whole session

## Notes

- Home screen is kept separate from the transaction screens.
- Transaction UI is being redesigned in a calm, premium style using the existing blue, white and orange palette.

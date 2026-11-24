import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getEnteredAmount } from 'src/app/classes/GlobalFunctions';

export interface CashStuckDialogData {
  accountNumber: string;
  accountTitle: string;
  depositAmount: number | string;
  enteredAmount?: number | string;
}

@Component({
  selector: 'app-cash-stuck-dialog',
  templateUrl: './cash-stuck-dialog.component.html',
  styleUrls: ['./cash-stuck-dialog.component.css']
})
export class CashStuckDialogComponent implements OnInit {
  denominations: number[] = [5000, 1000, 500, 100, 75, 50, 20, 10];
  denomCounts: { [denom: number]: string } = {
    5000: '',
    1000: '',
    500: '',
    100: '',
    75: '',
    50: '',
    20: '',
    10: ''
  };

  activeTarget: number = 5000;
  claimAmount: string = '0';
  showErrors: boolean = false;
  enteredAmount: any = 0;

  constructor(
    public dialogRef: MatDialogRef<CashStuckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CashStuckDialogData
  ) {}

  ngOnInit(): void {
    const rawEntered =
      this.data?.enteredAmount !== undefined &&
      this.data?.enteredAmount !== null &&
      this.data?.enteredAmount !== ''
        ? this.data.enteredAmount
        : getEnteredAmount() || 0;
    this.enteredAmount = rawEntered;
  }

  selectTarget(denom: number): void {
    this.activeTarget = denom;
  }

  calculateTotalFromDenoms(): number {
    let total = 0;
    for (const d of this.denominations) {
      const count = parseInt(this.denomCounts[d], 10);
      if (!isNaN(count) && count > 0) {
        total += d * count;
      }
    }
    return total;
  }

  hasEnteredDenoms(): boolean {
    return this.denominations.some(d => {
      const count = parseInt(this.denomCounts[d], 10);
      return !isNaN(count) && count > 0;
    });
  }

  formatDenominationsString(): string {
    const parts: string[] = [];
    for (const d of this.denominations) {
      const count = parseInt(this.denomCounts[d], 10);
      if (!isNaN(count) && count > 0) {
        parts.push(`${d}x${count}`);
      }
    }
    return parts.join(', ');
  }

  onNumpadInput(char: any): void {
    const charStr = String(char);
    const denom = this.activeTarget;
    if (!denom) return;

    let current = this.denomCounts[denom] || '';

    if (charStr === 'D') {
      current = current.slice(0, -1);
    } else if (charStr === 'C') {
      current = '';
    } else if (/^[0-9]$/.test(charStr)) {
      if (current === '0') {
        current = charStr;
      } else if (current.length < 5) {
        current += charStr;
      }
    }

    this.denomCounts[denom] = current;

    // Real-time auto-calculation of uneditable claim amount
    const total = this.calculateTotalFromDenoms();
    this.claimAmount = total > 0 ? total.toString() : '0';
  }

  submitClaim(): void {
    const hasDenoms = this.hasEnteredDenoms();
    const total = this.calculateTotalFromDenoms();

    if (!hasDenoms || total <= 0) {
      this.showErrors = true;
      return;
    }

    const formattedDenoms = this.formatDenominationsString();
    const finalAmount = total.toString();

    this.dialogRef.close({
      claimAmount: finalAmount,
      claimDenominations: formattedDenoms
    });
  }

  closeDialog(): void {
    this.dialogRef.close(null);
  }
}



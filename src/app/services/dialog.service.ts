import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(public dialog: MatDialog) {
  }

  openDialog(component: any, config: MatDialogConfig): MatDialogRef<any> {
    return this.dialog.open(component, config);
  }

  closeDialogs(): void {
    if (this.dialog) {
      this.dialog.closeAll();
    }
  }
}

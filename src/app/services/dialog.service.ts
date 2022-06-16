import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(public dialog: MatDialog) {}

  openDialog(component: any, config: MatDialogConfig): MatDialogRef<any> {
    return this.dialog.open(component, config);
  }

  closeDialogs(): void {
    this.dialog?.closeAll();
  }
}

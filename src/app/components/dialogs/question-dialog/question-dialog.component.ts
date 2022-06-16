import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss']
})
export class QuestionDialogComponent {

  customText: string|undefined;
  showButtonText: boolean|undefined;

  constructor(private questionDialog: MatDialogRef<QuestionDialogComponent>) { }

  confirm(): void {
    this.questionDialog.close(1);
  }

  cancel(): void {
    this.questionDialog.close(0);
  }

}

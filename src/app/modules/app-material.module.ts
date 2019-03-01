import { MatButtonModule, MatCheckboxModule, MatCardModule } from '@angular/material';
import { NgModule } from '@angular/core';

const materialArray = [
  MatButtonModule,
  MatCheckboxModule,
  MatCardModule
];

@NgModule({
  imports: materialArray,
  exports: materialArray
})
export class AppMaterialModule { }

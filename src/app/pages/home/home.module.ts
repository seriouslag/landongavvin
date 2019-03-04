import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/modules/app-material.module';
import { BlogListComponent } from 'src/app/components/blog-list/blog-list.component';
import { BlogComponent } from 'src/app/components/blog/blog.component';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { FlexLayoutModule } from '@angular/flex-layout';

const componentArray = [
  BlogListComponent,
  BlogComponent,
  HomeComponent
];

@NgModule({
  declarations: componentArray,
  imports: [
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
    CommonModule,
    AppMaterialModule,
    FlexLayoutModule
  ],
  exports: componentArray
})
export class HomeModule { }

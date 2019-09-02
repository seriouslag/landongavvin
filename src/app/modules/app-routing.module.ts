import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  { path: 'home', loadChildren: () => import('../pages/home/home.module').then(m => m.HomeModule) },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'about', redirectTo: 'about/landongavin', pathMatch: 'full' },
  { path: 'about/:vanity', loadChildren: () => import('../pages/about-page/about-page.module').then(m => m.AboutPageModule) },
  { path: 'account', loadChildren: () => import('../pages/account-page/account-page.module').then(m => m.AccountPageModule) },
  { path: 'login', loadChildren: () => import('../pages/login-page/login-page.module').then(m => m.LoginPageModule) },

  /*
    Lazy loading with a wildcard does not work with angular4 yet.
    {path: '**', loadChildren: 'app/pages/splash/splash.page.module#SplashPageModule'}
   */
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  private routerSubscription: Subscription;
  private redirectAfterLogin: string;
  private userSubscription: Subscription;
  fbAuthUser: firebase.User;

  constructor(private activatedRoute: ActivatedRoute, private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.userSubscription = this.firebaseService.fbAuthUser.subscribe((fbAuthUser) => {
      this.fbAuthUser = fbAuthUser;
    });
    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.redirectAfterLogin) {
        this.redirectAfterLogin = params.redirectAfterLogin;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  signOut(): void {
    this.firebaseService.logout();
  }
}

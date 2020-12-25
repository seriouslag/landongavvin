import { Component, OnDestroy, OnInit } from '@angular/core';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  user: User;
  fbAuthUser: firebase.User;
  private userSubscription: Subscription;
  private fbAuthUserSubscription: Subscription;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    this.userSubscription = this.firebaseService.user.subscribe((user) => {
      this.user = user;
    });
    this.fbAuthUserSubscription = this.firebaseService.fbAuthUser.subscribe((fbAuthUser) => {
      this.fbAuthUser = fbAuthUser;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.fbAuthUserSubscription) {
      this.fbAuthUserSubscription.unsubscribe();
    }
  }

  public logout(): void {
    this.firebaseService.logout();
  }
}

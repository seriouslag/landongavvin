import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  user: User|undefined|null;
  fbAuthUser: firebase.default.User|undefined;
  private userSubscription: Subscription|undefined;
  private fbAuthUserSubscription: Subscription|undefined;

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
    this.userSubscription?.unsubscribe();
    this.fbAuthUserSubscription?.unsubscribe();
  }

  public async logout(): Promise<void> {
    await this.firebaseService.logout();
  }
}

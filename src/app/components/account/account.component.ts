import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/User';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  user: firebase.User;
  lgUser: User;

  private userSubscription: Subscription;
  private lgUserSubscription: Subscription;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    this.userSubscription = this.firebaseService.user.subscribe(user => {
      this.user = user;

      if (this.user != null) {
        this.lgUserSubscription = this.firebaseService.getUserByUID(user.uid).subscribe(lgUser => {
          this.lgUser = lgUser;
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.lgUserSubscription) {
      this.lgUserSubscription.unsubscribe();
    }
  }

  public logout(): void {
    this.firebaseService.logout();
  }
}

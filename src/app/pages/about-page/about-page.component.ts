import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/User';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent implements OnInit, OnDestroy {

  waiting = true;
  failed = false;
  aboutUser: User;
  aboutUID: string;

  private routerSubscription: Subscription;
  private vanitySubscription: Subscription;
  private lgUserSubscription: Subscription;

  constructor(private firebaseService: FirebaseService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.vanity) {
        this.vanitySubscription = this.firebaseService.getUIDByVanity(params.vanity.toLowerCase()).subscribe((aboutUID) => {
          this.waiting = false;
          this.aboutUID = aboutUID;
          if (this.aboutUID != null) {
            this.failed = false;
            this.getUserByUID(this.aboutUID);
          } else {
            this.failed = true;
            this.aboutUser = null;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.vanitySubscription) {
      this.vanitySubscription.unsubscribe();
    }
    if (this.lgUserSubscription) {
      this.lgUserSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private getUserByUID(uid: string) {
    this.lgUserSubscription = this.firebaseService.getUserByUID(uid).subscribe(aboutUser => {
      this.aboutUser = aboutUser as User;
      if (aboutUser === null) {
        this.failed = true;
        this.waiting = false;
      }
    });
  }

}

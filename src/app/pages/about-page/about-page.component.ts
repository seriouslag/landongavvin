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
  aboutUser: User|null = null;
  aboutUID: string|undefined;

  private routerSubscription: Subscription|undefined;
  private vanitySubscription: Subscription|undefined;
  private userSubscription: Subscription|undefined;

  constructor(private firebaseService: FirebaseService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.vanity) {
        this.vanitySubscription = this.firebaseService.getUIDByVanity(params.vanity.toLowerCase()).subscribe(async (aboutUID) => {
          this.waiting = false;
          this.aboutUID = aboutUID;
          if (this.aboutUID) {
            this.failed = false;
            await this.fetchUserInfo();
          } else {
            this.failed = true;
            this.aboutUser = null;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.vanitySubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private async fetchUserInfo() {
    if (!this.aboutUID) return;
    const user = await this.firebaseService.getUserByUID(this.aboutUID)
    this.aboutUser = user;
    if (user === null) {
      this.failed = true;
      this.waiting = false;
    }
  }
}

import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Blog } from '../models/Blog';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as firebase from 'firebase/app';
import { User } from '../models/User';
import { MatSnackBar } from '@angular/material';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public user: Observable<firebase.User>;
  public blogs: Observable<Blog[]>;

  private blogsRef: AngularFireList<Blog>;
  private blogListenerSet = false;

  constructor(private db: AngularFireDatabase,
              private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private snackBar: MatSnackBar) {
    console.log('in firebase service constructor');
    this.blogsRef = this.db.list<Blog>('/blog');

    this.user = auth.authState;
  }

  public getBlogs(): Observable<Blog[]> {
    if (this.blogListenerSet) {
      return this.blogs;
    }
    return this.setBlogsListener();
  }

  private setBlogsListener(): Observable<Blog[]> {
    console.log('setting blog listener');
    this.blogListenerSet = true;
    this.blogs = this.blogsRef.valueChanges();
    return this.blogs;
  }

  public refreshUser() {
    if (this.auth.auth.currentUser) {
      this.auth.auth.currentUser.reload().then(() => {
        if (environment.production === false) {
          console.log('refreshed user');
        }
      });
    }
  }

  public async logout(): Promise<void> {
    try {
      const loginResponse = this.auth.auth.signOut();
      this.snackBar.open('Successfully logged out.', 'OK', { duration: 1750 });
    } catch (e) {
      console.log('Failed to logout', e);
      this.snackBar.open('Something went wrong :(', 'OK', { duration: 1750 });
    }
  }

  public async loginWithGoogleProvider(): Promise<void> {
    const loginResponse: firebase.auth.UserCredential = await this.auth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    const fireabaseUser: firebase.User = loginResponse.user;

    const user: User = await this.db.object<User>('/users/' + fireabaseUser.uid).valueChanges().pipe(
      take(1)
    ).toPromise();

    if (user != null) {
      return;
    }

    const tempUser: User = {} as User;
    tempUser.dateCreated = Date.now().toString();
    tempUser.email = user.email || '';

    if (user.uid) {
      tempUser.uid = user.uid.toLowerCase();
      tempUser.vanity = user.uid.toLowerCase();
      this.setUserVanity(user.uid.toLowerCase());
    }

    if (fireabaseUser.displayName) {
      const firstName = fireabaseUser.displayName.split(' ').slice(0, -1).join(' ');
      const lastName = fireabaseUser.displayName.split(' ').slice(-1).join(' ');
      tempUser.fname = firstName;
      tempUser.lname = lastName;
    }

    this.saveUserToDB({
      email: tempUser.email, fname: tempUser.fname, lname: tempUser.lname,
      bio: '', job: '', company: '', twitter: '',
      facebook: '', instagram: '', twitch: '', youtube: '',
      google: '', uid: tempUser.uid, linkedin: '', resumeLink: '',
      vanity: tempUser.uid,
      dateCreated: tempUser.dateCreated, image: '', isVerified: false
    } as User);
  }

  public saveUserToDB(lgUser: User): Promise<void> {
    return this.db.object('users/' + lgUser.uid).set(lgUser);
  }

  public getUIDByVanity(vanity: string): Observable<{}> {
    return this.db.object('/vanities/' + vanity).valueChanges();
  }

  public async sendEmailVerification(): Promise<void> {
    try {
      const emailResponse = await this.auth.auth.currentUser.sendEmailVerification();
      this.snackBar.open('A verification email has been sent to ' + this.auth.auth.currentUser.email, 'OK', { duration: 4000 });
    } catch (e) {
      this.snackBar.open('Failed to send a verification email please try again later.', 'OK', { duration: 4000 });
    }
  }

  public getUserProfileImg(uid: string): Promise<string> {
    return this.storage.ref('users/' + uid + '/profile.jpg').getDownloadURL().pipe(take(1)).toPromise();
  }

  public fetchProvidersForEmail(email: string): Promise<string[]> {
    return this.auth.auth.fetchProvidersForEmail(email);
  }

  public sendPasswordResetEmail(email: string, actionCodeSettings: any): Promise<void> {
    return this.auth.auth.sendPasswordResetEmail(email, actionCodeSettings);
  }

  // Use until backend is setup
  public getAllVanities(): AngularFireList<any> {
    return this.db.list('/vanities');
  }

  public updateUserInfo(updateObject: any): Promise<any> {
    return this.db.object('/users/' + this.auth.auth.currentUser.uid).update(updateObject);
  }

  public setUserVanity(vanity: string): Promise<void> {
    if (vanity.length <= 0) {
      // add error to promise
      console.log('Vanity cannot be empty');
    }

    vanity = vanity.toLowerCase();
    const uid = this.auth.auth.currentUser.uid;
    let user: User;
    let oldVanity: string;
    return new Promise(resolve => {
      const req = this.getUserByUID(uid);
      req
      .pipe(
        take(1)
      ).subscribe(u => {
        user = u;
        oldVanity = user.vanity;
        this.db.object('/vanities').update({ [user.vanity]: null });
        this.db.object('users/' + uid).update({ vanity });
        return this.db.object('/vanities').update({ [vanity]: user.uid });
      });
    });
  }

  public getUserByUID(uid: string): Observable<User> {
    const ret = this.db.object<User>('/users/' + uid).valueChanges();
    ret
    .pipe(
      take(1)
    )
    .subscribe((user: User) => {
      if (user && this.auth.auth.currentUser && user.uid === this.auth.auth.currentUser.uid) {
        if (user.isVerified !== this.auth.auth.currentUser.emailVerified) {
          this.updateUserInfo({ isVerified: this.auth.auth.currentUser.emailVerified });
        }
      }
    });
    return ret;
  }

  public createUserFromEmail(email: string, password: string, fname: string, lname: string): Promise<firebase.User> {
    return this.auth.auth.createUserWithEmailAndPassword(email, password).then(async (response) => {
      if (!response) {
        console.log('The response from creating a user is', null);
      }

      const user = response.user;

      try {
        await this.saveUserToDB({
          email, fname, lname,
          bio: '', job: '', company: '', twitter: '',
          facebook: '', instagram: '', twitch: '', youtube: '',
          google: '', uid: user.uid, linkedin: '', resumeLink: '',
          vanity: user.uid.toLowerCase(),
          dateCreated: Date.now().toString(), image: '', isVerified: false
        } as User);
        this.setUserVanity(user.uid.toLowerCase());
        this.sendEmailVerification();
      } catch (e) {
        this.snackBar.open('Failed to create your account please try again.', 'OK', { duration: 3000 });
      }
      return user;

    }).catch((error: firebase.FirebaseError) => {
      if (error.code === 'auth/weak-password') {
        this.snackBar.open('Password is too weak', 'OK', { duration: 2000 });
      } else if (error.code === 'auth/invalid-email') {
        this.snackBar.open('Email is invalid', 'OK', { duration: 2000 });
      } else if (error.code === 'auth/email-already-in-use') {
        this.snackBar.open('This email is already in use', 'OK', { duration: 2000 });
      } else if (error.code === 'auth/operation-not-allowed') {
        this.snackBar.open('This is not allowed at this time', 'OK', { duration: 2000 });
      } else {
        this.snackBar.open('Cannot process, unknown error', 'OK', { duration: 2000 });
      }

      return null;
    });
  }

  public loginWithEmailProvider(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.auth.auth.signInWithEmailAndPassword(email, password).then((response) => {
      // Login successful
      // Handle toast here?
      const user = response.user;
      if (user.displayName) {
        this.snackBar.open('Logged in as ' + user.displayName, 'OK', { duration: 1750 });
      } else if (user.email) {
        this.snackBar.open('Logged in as ' + user.email, 'OK', { duration: 1750 });
      } else {
        this.snackBar.open('Successfully logged in', 'OK', { duration: 1750 });
      }

      return user;
    }).catch((error: any) => {
      const errorCode = error.code;
      this.snackBar.open(error.message, 'OK', {
        duration: 2000,
      });
      if (errorCode === 'auth/user-disabled') {
      } else if (errorCode === 'auth/invalid-email') {
      } else if (errorCode === 'auth/user-not-found') {
      } else if (errorCode === 'auth/wrong-password') {
      } else {
        console.log('An unknown error occurred', error);
      }

      return null;
    });
  }
}

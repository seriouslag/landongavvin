import { Injectable, OnDestroy } from '@angular/core';
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

  public async refreshUser() {
    if (!this.auth.auth.currentUser) {
      return;
    }

    await this.auth.auth.currentUser.reload();
    if (!environment.production) {
      console.log('refreshed user');
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

    try {
      const user: User = await this.db.object<User>('/users/' + fireabaseUser.uid).valueChanges().pipe(
        take(1)
      ).toPromise();

      if (user === null) {
        console.log('Failed to login through Google provider.');
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
    } catch (e) {
      let message: string;
      switch (e.code) {
        case 'auth/account-exists-with-different-credential':
          message = 'This account already exists with diffent credentials, please try signing in.';
          break;
        case 'auth/auth-domain-config-required':
          message = 'System error. :(';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Sign in popup was canceled :(';
          break;
        case 'auth/operation-not-allowed':
          message = 'This method of signing in is currently disabled, please try another method.';
          break;
        case 'auth/operation-not-supported-in-this-environment':
          message = 'Must be https and running in registered domain.';
          break;
        case 'auth/popup-blocked':
          message = 'Signin popup was blocked';
          break;
        case 'auth/popup-closed-by-user':
          message = 'Sign in popup was canceled :(';
          break;
        case 'auth/unauthorized-domain':
          message = 'This domain is not authorized for this signin method.';
          break;
        default:
          message = 'Cannot process, unknown error';
      }

      this.snackBar.open(message, 'OK', { duration: 2000 });
    }
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
    return new Promise(() => {
      const req = this.getUserByUID(uid);
      req
      .pipe(
        take(1)
      ).subscribe(u => {
        user = u;
        oldVanity = user.vanity;
        this.db.object('/vanities').update({ [user.vanity]: null });
        this.db.object('users/' + uid).update({ vanity });
        this.db.object('/vanities').update({ [vanity]: user.uid });
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

  public async createUserFromEmail(email: string, password: string, fname: string, lname: string): Promise<firebase.User> {
    try {
      const createUserResponse = await this.auth.auth.createUserWithEmailAndPassword(email, password);

      if (!createUserResponse) {
        console.log('The response from creating a user is', null);
      }

      const user = createUserResponse.user;

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
    } catch (e) {
      let message: string;
      switch (e.code) {
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          message = 'Email is invalid';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already in use';
          break;
        case 'auth/operation-not-allowed':
          message = 'This is not allowed at this time';
          break;
        default:
          message = 'Cannot process, unknown error';
      }

      this.snackBar.open(message, 'OK', { duration: 2000 });
      return null;
    }
  }

  public async loginWithEmailProvider(email: string, password: string): Promise<firebase.User> {
    try {
      const signInResponse = await this.auth.auth.signInWithEmailAndPassword(email, password);

      const user = signInResponse.user;

      if (user.displayName) {
        this.snackBar.open('Logged in as ' + user.displayName, 'OK', { duration: 1750 });
      } else if (user.email) {
        this.snackBar.open('Logged in as ' + user.email, 'OK', { duration: 1750 });
      } else {
        this.snackBar.open('Successfully logged in', 'OK', { duration: 1750 });
      }

      return user;
    } catch (e) {
      const errorCode = e.code;
      this.snackBar.open(e.message, 'OK', {
        duration: 2000,
      });

      let message: string;
      switch (errorCode) {
        case 'auth/user-disabled':
          message = 'This user is disabled.';
          break;
        case 'auth/invalid-email':
          message = 'This email is invalid.';
          break;
        case 'auth/user-not-found':
          message = 'User was not found.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password.';
          break;
        default:
          message = 'An unknown error occurred';
      }
      console.log('message', e);

      return null;
    }
  }
}

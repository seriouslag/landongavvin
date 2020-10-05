import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Blog } from '../models/Blog';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { take, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import * as firebase from 'firebase/app';
import { User } from '../models/User';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {

  public fbAuthUser: Observable<firebase.User>;
  public blogs: Observable<Blog[]>;

  private fbAuthUserSubscription: Subscription;
  public user = new BehaviorSubject<User>(null);

  private blogsRef: AngularFireList<Blog>;
  private blogListenerSet = false;

  private serviceUserReference: User;

  constructor(private db: AngularFireDatabase,
              private auth: AngularFireAuth,
              private storage: AngularFireStorage,
              private snackBar: MatSnackBar) {
    console.log('in firebase service constructor');
    this.blogsRef = this.db.list<Blog>('/blog');

    this.fbAuthUser = auth.authState;

    this.fbAuthUserSubscription = auth.authState.subscribe((fbAuthUser) => {
      if (!fbAuthUser) {
        this.user.next(null);
        this.serviceUserReference = null;
        return;
      }
      this.getUserByUID(fbAuthUser.uid).pipe(take(1)).subscribe((user) => {
        this.serviceUserReference = user;
        this.user.next(user);
      });
    });
  }

  public async updateImageCacheControl(path: string, fileName: string) {
    const newMetadata = {
      cacheControl: 'public,max-age=604800'
    };

    try {
      const ref = this.storage.ref('/').child(path);
      const imageRef = ref.child(fileName);
      // updateMetatdata not updateMetadata because of typo in library
      const result = await imageRef.updateMetatdata(newMetadata);
      result.pipe(take(1)).subscribe();
    } catch (e) {
      this.handleStorageErrors(e);
    }
  }

  private handleStorageErrors(error) {
    let message: string;
    switch (error.code) {
      case 'storage/unknown':
        message = 'An unknown error occurred.';
        break;
      case 'storage/object-not-found':
        message = 'No object exists at the desired reference.';
        break;
      case 'storage/bucket-not-found':
        message = 'No bucket is configured for Cloud Storage';
        break;
      case 'storage/project-not-found':
        message = 'No project is configured for Cloud Storage';
        break;
      case 'storage/quota-exceeded':
        message = `Quota on your Cloud Storage bucket
                   has been exceeded. If you're on the free tier,
                   upgrade to a paid plan.If you're on a paid plan,
                   reach out to Firebase support.`;
        break;
      case 'storage/unauthenticated	':
        message = 'User is unauthenticated, please authenticate and try again.';
        break;
      case 'storage/unauthorized':
        message = 'User is not authorized to perform the desired action, check your security rules to ensure they are correct.';
        break;
      case 'storage/retry-limit-exceeded':
        message = 'The maximum time limit on an operation (upload, download, delete, etc.) has been excceded. Try uploading again.';
        break;
      case 'storage/invalid-checksum':
        message = 'File on the client does not match the checksum of the file received by the server. Try uploading again.';
        break;
      case 'storage/canceled':
        message = 'User canceled the operation.';
        break;
      case 'storage/invalid-event-name':
        message = 'Invalid event name provided. Must be one of [`running`, `progress`, `pause`]';
        break;
      case 'storage/invalid-url':
        message = `Invalid URL provided to refFromURL().
                   Must be of the form: gs://bucket/object
                   or https://firebasestorage.googleapis.com/v0/b/bucket/o/object?token=<TOKEN>`;
        break;
      case 'storage/invalid-argument':
        message = `The argument passed to put() must be 'File',
                  'Blob', or 'UInt8' Array. The argument passed to putString() must be a raw,
                  'Base64', or 'Base64URL' string.`;
        break;
      case 'storage/no-default-bucket':
        message = `No bucket has been set in your config's storageBucket property.`;
        break;
      case 'storage/cannot-slice-blob':
        message = `Commonly occurs when the local file has changed
                   (deleted, saved again, etc.). Try uploading again after verifying that the file hasn't changed.`;
        break;
      case 'storage/server-file-wrong-size':
        message = '	File on the client does not match the size of the file recieved by the server. Try uploading again.';
        break;
      default:
        message = 'An unknown error occurred.';
    }
    this.snackBar.open(message, 'OK', { duration: 1000 });
    console.log(message, error);
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
      try {
        const loginResponse = await this.auth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        const fireabaseUser: firebase.User = loginResponse.user;
        const user: User = await this.db.object<User>('/users/' + fireabaseUser.uid).valueChanges().pipe(
          take(1)
        ).toPromise();

        if (user !== null) {
          console.log('logged in via Google provider.');
          return;
        }

        console.log('Logged in via Google provider; Now creating user in DB;');

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
          github: '', vanity: tempUser.uid, profileImage: false,
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

  public saveUserToDB(user: User): Promise<void> {
    return this.db.object('users/' + user.uid).set(user);
  }

  public getUIDByVanity(vanity: string): Observable<string> {
    return this.db.object('/vanities/' + vanity).valueChanges().pipe(
      map((uid) => uid.toString())
    );
  }

  public async sendEmailVerification(): Promise<void> {
    try {
      const emailResponse = await this.auth.auth.currentUser.sendEmailVerification();
      this.snackBar.open('A verification email has been sent to ' + this.auth.auth.currentUser.email, 'OK', { duration: 4000 });
    } catch (e) {
      this.snackBar.open('Failed to send a verification email please try again later.', 'OK', { duration: 4000 });
    }
  }

  public async getUserProfileImg(uid: string): Promise<string> {
    try {
      if (this.serviceUserReference && uid === this.serviceUserReference.uid && !this.serviceUserReference.profileImage) {
        return null;
      }
      const response = this.storage.ref('users').child(uid).child('/profile.jpg').getDownloadURL().pipe(take(1)).toPromise();
      return response;
    } catch (e) {
      return null;
    }
  }

  public fetchProvidersForEmail(email: string): Promise<string[]> {
    return this.auth.auth.fetchSignInMethodsForEmail(email);
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
          email, fname, lname, profileImage: false,
          bio: '', job: '', company: '', twitter: '',
          facebook: '', instagram: '', twitch: '', youtube: '',
          google: '', uid: user.uid, linkedin: '', resumeLink: '',
          github: '', vanity: user.uid.toLowerCase(),
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

  ngOnDestroy(): void {
    if (this.fbAuthUserSubscription) {
      this.fbAuthUserSubscription.unsubscribe();
    }
  }
}

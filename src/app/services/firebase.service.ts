import { Injectable, OnDestroy } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from '@firebase/app-compat';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Blog } from '../models/Blog';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService implements OnDestroy {

  public fbAuthUser: Observable<firebase.default.User>;
  public blogs: Observable<Blog[]>|undefined;

  private fbAuthUserSubscription: Subscription;
  public user = new BehaviorSubject<User|null>(null);

  private blogsRef: AngularFireList<Blog>;
  private blogListenerSet = false;

  private serviceUserReference: User|null = null;

  constructor(private db: AngularFireDatabase,
              private fbAuth: AngularFireAuth,
              private storage: AngularFireStorage,
              private snackBar: MatSnackBar) {
    console.log('in firebase service constructor');
    this.blogsRef = this.db.list<Blog>('/blog');

    this.fbAuthUser = fbAuth.authState as Observable<firebase.default.User>;

    this.fbAuthUserSubscription = fbAuth.authState.subscribe(async (fbAuthUser) => {
      if (!fbAuthUser) {
        this.user.next(null);
        this.serviceUserReference = null;
        return;
      }
      const user = await this.getUserByUID(fbAuthUser.uid);
      this.serviceUserReference = user;
      this.user.next(user);
    });
  }

  public async updateImageCacheControl(path: string, fileName: string) {
    const newMetadata = {
      cacheControl: 'public,max-age=604800'
    };

    try {
      const ref = this.storage.ref('/').child(path);
      const imageRef = ref.child(fileName);
      const result = await imageRef.updateMetadata(newMetadata).toPromise();
      console.log('updated image ref', result)
    } catch (e) {
      this.handleStorageErrors(e as firebase.default.FirebaseError);
    }
  }

  private handleStorageErrors(error: firebase.default.FirebaseError) {
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
    if (this.blogListenerSet && this.blogs) {
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
    const user = await this.fbAuth.currentUser;
    if (!user) {
      return;
    }

    user.reload();
    if (!environment.production) {
      console.log('refreshed user');
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.fbAuth.signOut();
      this.snackBar.open('Successfully logged out.', 'OK', { duration: 1750 });
    } catch (e) {
      console.log('Failed to logout', e);
      this.snackBar.open('Something went wrong :(', 'OK', { duration: 1750 });
    }
  }

  public async loginWithGoogleProvider(): Promise<void> {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        const loginResponse = await firebase.auth().signInWithPopup(provider);
        console.log('logged in', loginResponse)
        const firebaseUser = loginResponse.user;
        if (!firebaseUser) {
          console.error('failed to find user');
          return;
        }
        const user: User|null = await this.db.object<User>('/users/' + firebaseUser.uid).valueChanges().pipe(
          take(1)
        ).toPromise();

        if (user !== null) {
          console.log('logged in via Google provider.');
          return;
        }

        console.log('Logged in via Google provider; Now creating user in DB;');

        const tempUser: User = {} as User;
        tempUser.dateCreated = Date.now().toString();
        tempUser.email = '';

        if (firebaseUser.displayName) {
          const firstName = firebaseUser.displayName.split(' ').slice(0, -1).join(' ');
          const lastName = firebaseUser.displayName.split(' ').slice(-1).join(' ');
          tempUser.fname = firstName;
          tempUser.lname = lastName;
        }

        await this.saveUserToDB({
          email: tempUser.email, fname: tempUser.fname, lname: tempUser.lname,
          bio: '', job: '', company: '', twitter: '',
          facebook: '', instagram: '', twitch: '', youtube: '',
          google: '', uid: tempUser.uid, linkedin: '', resumeLink: '',
          github: '', vanity: tempUser.uid, profileImage: false,
          dateCreated: tempUser.dateCreated, image: '', isVerified: false
        } as User);
      } catch (error) {
        let e = error as FirebaseError;
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
        console.error(e);
      }
  }

  public async saveUserToDB(user: User): Promise<void> {
    return await this.db.object('users/' + user.uid).set(user);
  }

  public getUIDByVanity(vanity: string): Observable<string> {
    return this.db.object<string|undefined>('/vanities/' + vanity).valueChanges().pipe(
      map((uid) => uid?.toString() || '')
    );
  }

  public async sendEmailVerification(): Promise<void> {
    try {
      const user = await this.fbAuth.currentUser;
      if (!user) throw 'Could not get current user'
      const actionCodeSettings: firebase.default.auth.ActionCodeSettings = {
        url: 'https://landongavin.dev',
        handleCodeInApp: false
      };
      await user.sendEmailVerification(actionCodeSettings);
      this.snackBar.open('A verification email has been sent to ' + user.email, 'OK', { duration: 4000 });
    } catch (e) {
      this.snackBar.open('Failed to send a verification email please try again later.', 'OK', { duration: 4000 });
      console.error('failed to send email verification', e);
    }
  }

  public async getUserProfileImg(uid: string): Promise<string|null> {
    try {
      if (this.serviceUserReference && uid === this.serviceUserReference.uid && !this.serviceUserReference.profileImage) {
        return null;
      }
      const response = await this.storage.ref('users').child(uid).child('/profile.jpg').getDownloadURL().pipe(take(1)).toPromise();
      return response;
    } catch (e) {
      return null;
    }
  }

  public async fetchProvidersForEmail(email: string): Promise<string[]> {
    return await this.fbAuth.fetchSignInMethodsForEmail(email);
  }

  public async sendPasswordResetEmail(email: string, actionCodeSettings: any): Promise<void> {
    return await this.fbAuth.sendPasswordResetEmail(email, actionCodeSettings);
  }

  // Use until backend is setup
  public getAllVanities(): AngularFireList<any> {
    return this.db.list('/vanities');
  }

  public async updateUserInfo(updateObject: any): Promise<any> {
    const user = await this.fbAuth.currentUser;
    if (!user) throw 'Could not get current user';
    return this.db.object('/users/' + user.uid).update(updateObject);
  }

  public async setUserVanity(vanity: string): Promise<void> {
    if (vanity.length <= 0) {
      // add error to promise
      console.log('Vanity cannot be empty');
    }

    vanity = vanity.toLowerCase();
    const cUser = await this.fbAuth.currentUser;
    if (!cUser) throw 'Could not get current user';
    const uid = cUser.uid;
    const user = await this.getUserByUID(uid);
    if (!user) throw 'Could not get db user';
    this.db.object('/vanities').update({ [user.vanity]: null });
    this.db.object('users/' + uid).update({ vanity });
    this.db.object('/vanities').update({ [vanity]: user.uid });
  }

  public async getUserByUID(uid: string): Promise<User|null> {
    const user = await this.db.object<User>('/users/' + uid).valueChanges()
      .pipe(
        take(1),
      ).toPromise();
      const cUser = await this.fbAuth.currentUser;
      if (user && cUser && user.uid === cUser.uid) {
        if (user.isVerified !== cUser.emailVerified) {
          await this.updateUserInfo({ isVerified: cUser.emailVerified });
        }
      }
    return user;
  }

  public async createUserFromEmail(email: string, password: string, fname: string, lname: string): Promise<firebase.default.User|null> {
    try {
      const createUserResponse = await this.fbAuth.createUserWithEmailAndPassword(email, password);

      if (!createUserResponse) {
        console.log('The response from creating a user is', null);
      }

      const user = createUserResponse.user;
      if (!user) throw 'Could not get created user';

      try {
        await this.saveUserToDB({
          email, fname, lname, profileImage: false,
          bio: '', job: '', company: '', twitter: '',
          facebook: '', instagram: '', twitch: '', youtube: '',
          google: '', uid: user.uid, linkedin: '', resumeLink: '',
          github: '', vanity: user.uid.toLowerCase(),
          dateCreated: Date.now().toString(), image: '', isVerified: false
        } as User);
        await this.setUserVanity(user.uid.toLowerCase());
        await this.sendEmailVerification();
      } catch (e) {
        this.snackBar.open('Failed to create your account please try again.', 'OK', { duration: 3000 });
      }
      return user;
    } catch (error) {
      const e = error as FirebaseError;
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

  public async loginWithEmailProvider(email: string, password: string): Promise<firebase.default.User|null> {
    try {
      const signInResponse = await this.fbAuth.signInWithEmailAndPassword(email, password);

      const user = signInResponse.user;
      if (!user) throw 'Could not get signed in user';

      if (user.displayName) {
        this.snackBar.open('Logged in as ' + user.displayName, 'OK', { duration: 1750 });
      } else if (user.email) {
        this.snackBar.open('Logged in as ' + user.email, 'OK', { duration: 1750 });
      } else {
        this.snackBar.open('Successfully logged in', 'OK', { duration: 1750 });
      }

      return user;
    } catch (error) {
      const e = error as FirebaseError;
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
    this.fbAuthUserSubscription?.unsubscribe();
  }
}

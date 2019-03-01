import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Blog } from '../models/Blog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { FetchBlogs } from '../actions/blog';

interface AppState {
  loading: boolean;
  blogs: Blog[];
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  blogsRef: AngularFireList<Blog>;
  blogs: Observable<Blog[]>;
  snapshotRef: any;

  constructor(private db: AngularFireDatabase, private store: Store<AppState>) {
    console.log('in service constructor');
    this.blogsRef = this.db.list<Blog>('/blog');
    this.setBlogsListener();

    this.blogs.subscribe(banana => {
      console.log('woo', banana);
    });
  }

  private setBlogsListener() {
    console.log('setting blog listener');
    this.blogs = this.blogsRef.valueChanges()
    .pipe(
      tap(() => {
        this.store.dispatch(new FetchBlogs('blogs'));
      })
    );
  }
}

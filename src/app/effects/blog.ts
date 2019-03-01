import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { switchMap, tap } from 'rxjs/operators';

import { FETCH_BLOGS, FetchBlogsSuccess } from '../actions/blog';
import { Blog } from '../models/Blog';


@Injectable()
export class BlogEffects {

  @Effect()
  FetchBlogs$: Observable<Blog[]> = this.actions$
  .pipe(
    tap(effect => {
      console.log('in effects', effect);
    }),
    ofType(FETCH_BLOGS),
    // tap((payload) => {
    //   console.log(payload);
    //   return new FetchBlogsSuccess(payload);
    // })
  );

    constructor(private actions$: Actions) { }
}

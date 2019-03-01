import { Action } from '@ngrx/store';
import { Blog } from '../models/blog';

export const FETCH_BLOGS = 'Fetch BLOGS';
export const FETCH_BLOGS_SUCCESS = 'Fetch BLOGS success';

export class FetchBlogs implements Action {
  readonly type = FETCH_BLOGS;

  constructor(public payload: string) {}
}

export class FetchBlogsSuccess implements Action {
  readonly type = FETCH_BLOGS_SUCCESS;

  constructor(public payload: Blog[]) {}
}

export type Actions = FetchBlogs | FetchBlogsSuccess;

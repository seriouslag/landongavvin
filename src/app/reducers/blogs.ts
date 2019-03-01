import * as blog from '../actions/blog';
import { Blog } from '../models/Blog';

export interface State {
  loading: boolean;
  blogs: Blog[];
}

export const initialState: State = {
  loading: false,
  blogs: []
};

export function reducer(state = initialState, action: blog.Actions): State {
  switch (action.type) {
    case blog.FETCH_BLOGS: {
      console.log('in blog fetch');
      const returnObject = {
        ...state,
        loading: true
      };

      return returnObject;
    }
    case blog.FETCH_BLOGS_SUCCESS: {
      console.log('in blog success');
      return {
        loading: false,
        blogs: action.payload
      };
    }
    default: {
      return state;
    }
  }
}

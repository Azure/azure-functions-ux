export const FETCH_REQUEST = 'FETCH_REQUEST';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const UPDATE_REQUEST = 'UPDATE_REQUEST';
export const UPDATE_SUCCESS = 'UPDATE_SUCCESS';
export const UPDATE_FAILURE = 'UPDATE_FAILURE';

const initalMetadata = {
  fetchError: false,
  fetchErrorObject: new Error(),
  updateError: false,
  updateErrorObject: new Error(),
  loading: false,
  updating: false,
};
export const metadataReducer = (areaString: string) => (state = initalMetadata, action: any) => {
  switch (action.type) {
    case `${areaString}/${FETCH_REQUEST}`:
      return {
        ...state,
        loading: true,
        fetchError: false,
      };
    case `${areaString}/${FETCH_SUCCESS}`:
      return {
        ...state,
        loading: false,
        fetchError: false,
      };
    case `${areaString}/${FETCH_FAILURE}`:
      return {
        ...state,
        loading: false,
        fetchError: true,
        fetchErrorObject: action.error,
      };
    case `${areaString}/${UPDATE_REQUEST}`:
      return {
        ...state,
        updating: true,
        updateError: false,
      };
    case `${areaString}/${UPDATE_SUCCESS}`:
      return {
        ...state,
        updating: false,
        updateError: false,
      };
    case `${areaString}/${UPDATE_FAILURE}`:
      return {
        ...state,
        updating: false,
        updateError: true,
        updateErrorObject: action.error,
      };
    default:
      return state;
  }
};

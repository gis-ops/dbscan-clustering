import { combineReducers } from 'redux'
import {
  REQUEST_PLACES_RESULTS,
  RECEIVE_PLACES_RESULTS,
  UPDATE_BBOX,
  UPDATE_DBSCAN_SETTINGS,
  COMPUTE_DBSCAN,
  RESULT_HANDLER,
  CLEAR,
  DISABLE_PLACES
} from '../actions/actions'

const initialPlacesState = {
  boundingbox: '',
  message: { receivedAt: 0 },
  lastCall: Date.now(),
  places: {},
  dbscanSettings: {
    minPoints: 10,
    maxDistance: 500
  },
  lastCompute: 0
}

const placesControls = (state = initialPlacesState, action) => {
  switch (action.type) {
    case DISABLE_PLACES: {
      return {
        ...state,
        places: {
          ...state.places,
          [action.payload]: {
            ...state.places[action.payload],
            disabled: true
          }
        }
      }
    }
    case CLEAR: {
      return {
        ...state,
        places: {},
        lastCall: Date.now(),
        lastCompute: Date.now()
      }
    }
    case REQUEST_PLACES_RESULTS: {
      return {
        ...state,
        places: {
          ...state.places,
          [action.payload.category]: {
            ...state.places[action.payload.category],
            isFetching: true
          }
        }
      }
    }

    case RECEIVE_PLACES_RESULTS: {
      return {
        ...state,
        lastCall: Date.now(),
        places: {
          ...state.places,
          [action.payload.category]: {
            ...state.places[action.payload.category],
            data: state.places[action.payload.category].hasOwnProperty('data')
              ? [
                  ...state.places[action.payload.category].data,
                  ...action.payload.data.items
                ]
              : action.payload.data.items,
            next: action.payload.data.next,
            previous: action.payload.data.previous,
            boundingbox: action.payload.boundingbox,
            color: action.payload.color,
            isFetching: false,
            disabled: !action.payload.data.next
          }
        }
      }
    }
    case UPDATE_BBOX: {
      const newState = { ...state }
      newState.boundingbox = action.payload
      for (const obj in newState.places) {
        newState.places[obj].disabled = false
        newState.places[obj].next = undefined
        newState.places[obj].previous = undefined
      }

      return newState
    }
    case RESULT_HANDLER: {
      return {
        ...state,
        message: {
          ...state.message,
          ...action.payload,
          receivedAt: Date.now()
        }
      }
    }
    case COMPUTE_DBSCAN: {
      return {
        ...state,
        lastCompute: Date.now()
      }
    }
    case UPDATE_DBSCAN_SETTINGS: {
      return {
        ...state,
        dbscanSettings: {
          ...state.dbscanSettings,
          [action.payload.setting]: action.payload.value
        }
      }
    }
    default: {
      return state
    }
  }
}

const rootReducer = combineReducers({
  placesControls
})

export default rootReducer

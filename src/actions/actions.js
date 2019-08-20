const hereAppCode = '0XXQyxbiCjVU7jN2URXuhg'
const hereAppId = 'yATlKFDZwdLtjHzyTeCK'

export const RECEIVE_PLACES_RESULTS = 'RECEIVE_PLACES_RESULTS'
export const REQUEST_PLACES_RESULTS = 'REQUEST_PLACES_RESULTS'
export const UPDATE_BBOX = 'UPDATE_BBOX'
export const UPDATE_DBSCAN_SETTINGS = 'UPDATE_DBSCAN_SETTINGS'
export const COMPUTE_DBSCAN = 'COMPUTE_DBSCAN'
export const RESULT_HANDLER = 'RESULT_HANDLER'
export const CLEAR = 'CLEAR'
export const DISABLE_PLACES = 'DISABLE_PLACES'

export const fetchHerePlaces = payload => (dispatch, getState) => {
  const currentPlacesControls = getState().placesControls
  const { boundingbox } = currentPlacesControls

  let url
  let params

  if (
    currentPlacesControls.places.hasOwnProperty(payload.category) &&
    boundingbox == currentPlacesControls.places[payload.category].boundingbox &&
    currentPlacesControls.places[payload.category].next
  ) {
    url = currentPlacesControls.places[payload.category].next
  } else {
    url = new URL('https://places.cit.api.here.com/places/v1/discover/explore')
    params = {
      app_id: hereAppId,
      app_code: hereAppCode,
      //west longitude, south latitude, east longitude, north latitude.
      in: boundingbox,
      size: 20,
      cat: payload.category
    }
  }

  if (url) {
    dispatch(requestPlacesResults({ category: payload.category }))

    if (params) url.search = new URLSearchParams(params)
    return fetch(url)
      .then(response => response.json())
      .then(data =>
        dispatch(
          processPlacesResponse(
            data,
            payload.category,
            boundingbox,
            payload.color
          )
        )
      )
      .catch(error => console.error(error)) //eslint-disable-line
  }
}

export const sendMessage = message => ({
  type: RESULT_HANDLER,
  payload: message
})

export const clear = () => ({
  type: CLEAR
})

export const doUpdateBoundingBox = boundingbox => dispatch => {
  const bbox = [
    boundingbox._southWest.lng,
    boundingbox._southWest.lat,
    boundingbox._northEast.lng,
    boundingbox._northEast.lat
  ].join(',')

  dispatch(updateBoundingBox(bbox))
}

export const disablePlaces = category => ({
  type: DISABLE_PLACES,
  payload: category
})

const updateBoundingBox = bbox => ({
  type: UPDATE_BBOX,
  payload: bbox
})

export const computeDbScan = () => ({
  type: COMPUTE_DBSCAN
})

export const updateDbScanSettings = settings => ({
  type: UPDATE_DBSCAN_SETTINGS,
  payload: { ...settings }
})

const parsePlacesResponse = json => dispatch => {
  const results = {}
  let jsonToParse
  if (json.results) {
    jsonToParse = json.results
  } else {
    jsonToParse = json
  }

  if (jsonToParse.items.length > 0) {
    results.items = jsonToParse.items
  }
  if (jsonToParse.next) {
    results.next = jsonToParse.next
  } else {
    dispatch(
      sendMessage({
        type: 'warning',
        icon: 'warning',
        description:
          'All places fetched in this bounding box. Try and zoom in or pan the map.',
        title: 'No more places to fetch.'
      })
    )
  }

  return results
}

const processPlacesResponse = (json, category, bbox, color) => dispatch => {
  const results = dispatch(parsePlacesResponse(json))

  dispatch(
    receivePlacesResults({
      data: results,
      category: category,
      boundingbox: bbox,
      color: color
    })
  )
  if (results.length == 0) {
    dispatch(
      sendMessage({
        type: 'warning',
        icon: 'warning',
        description:
          'No places in your viewport, zoom to another region and try again.',
        title: 'DBScan settings'
      })
    )
  }
}

export const receivePlacesResults = places => ({
  type: RECEIVE_PLACES_RESULTS,
  payload: places
})

export const requestPlacesResults = category => ({
  type: REQUEST_PLACES_RESULTS,
  payload: category
})

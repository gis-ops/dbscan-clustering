# Building a DBScan Clustering Web(M)app with HERE Maps places, React, Leaflet and TurfJS

![HERE Maps Places and DBScan Clusters](https://user-images.githubusercontent.com/10322094/63057562-d49a0880-beea-11e9-8a7f-68f70c6e629e.png)

In this tutorial you will learn how to use _ReactJS, Redux, TurfJS_ and _Leaflet_ to create a simple but powerful maps application which is capable of consuming the **HERE Places API** and with these places is able to compute clusters with the almighty [**Density Based Clustering Algoritm With Noise**](https://en.wikipedia.org/wiki/DBSCAN).

Please find a live version [here](https://gis-ops.github.io/dbscan-clustering/).

Ummmh, so what are clustering algorithms good for? Let's have a look what wikipedia says.

_Cluster analysis or clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar (in some sense) to each other than to those in other groups (clusters). It is a main task of exploratory data mining, and a common technique for statistical data analysis, used in many fields, including machine learning, pattern recognition, image analysis, information retrieval, bioinformatics, data compression, and computer graphics. [Wikipedia](https://en.wikipedia.org/wiki/Cluster_analysis)._

Cool stuff, especially because this application consumes the useful **HERE Maps Places API** to fetch points of interest in the bounding box of the map.
As a user you have the possibilty to select different category types and tweak DBScan settings to compute clusters with the points of interest.
Read more about the options in the [HERE Maps Places Documentation](https://developer.here.com/documentation/places/topics/quick-start-find-text-string.html?cid=Places-Google-MM-T2-Dev-Brand-BMM&utm_source=Google&utm_medium=ppc&utm_campaign=Dev_PaidSearch_DevPortal_AlwaysOn).

## Prerequisites

To understand this tutorial, you should have a basic understand of the following:

- Knowledge of JavaScript; in particular we will generally be using [ES2016](http://es6-features.org/#Constants).
- A basic understanding of _Single-Page-Applications, ReactJS, JSX, Redux_ and _Leaflet_. We recommend the following [basic tutorial](https://redux.js.org/introduction/getting-started) which will give you a decent introduction about why and how to combine react with redux.
- A shell environment with preinstalled [Node.js](https://nodejs.org/en/download/) giving you the ability to use its package manager `npm`.
- A simple text editor such as [Sublime Text](https://www.sublimetext.com/) for coding.

## Step 1 - Set up your app folder structure and install dependencies

Open your shell and clone this repository which will be your working directory.

```sh
git clone https://github.com/gis-ops/dbscan-clustering.git dbscan-clustering && cd dbscan-clustering
```

Next up we will want to remove all files in the source folders as you will be creating these as part of this tutorial.
Don't be naughty - delete them all!

```sh
find src -type f -delete
```

Up next you will have to install all dependencies.
We have prepared a `package.json` which you can use, it resides in your working directory `dbscan-clustering`.

```sh
npm install
```

By the way, you might be wondering why we need these dependencies... TL;DR:

- [Axios](https://github.com/axios/axios), a promise based HTTP client for the browser and node.js
- [Leaflet](https://github.com/Leaflet/Leaflet) for the map & interaction
- [TurfJs](https://github.com/Turfjs/turf) for spatial operations
- [Semantic ui](https://react.semantic-ui.com/) for beautiful interfaces
- [Tachyons](https://tachyons.io/) helper css classes, just helpful
  ...

And you might be asking yourself why we aren't using react-leaflet bindings and the reason is simple: you should learn how leaflet works in its very core!

At this point your folder structure should now have the following folder layout:

```sh
.
├── node_modules
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── Controls
    ├── Map
    ├── actions
    ├── images
    └── reducers
```

We do not have to worry about the public folder but feel free to read more about [webpack](https://github.com/webpack/webpack) in general if you are interested how it bundles and builds the application [( tutorial)](https://tutorialzine.com/2017/04/learn-webpack-in-15-minutes).

## Step 2 - Let's create a map!

With the first step in place, we can start getting our hands dirty with the code of our first react components.
Navigate to our `src` folder which will hold the first couple of javascript source files.

### index.js

The parent javascript root file from which our application will be started is called `index.js`, so go ahead an create it:

```sh
cd src
touch index.js
```

Now please open `index.js` in your text editor and paste the following code:

```javascript
import React from 'react'
import { render } from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'

// yet to be created
import reducer from './reducers'
import App from './App'
import './index.css' // postCSS import of CSS module

const middleware = [thunk]

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(...middleware))
)

render(
  <Provider store={store}>
    {' '}
    <App />
  </Provider>,
  document.getElementById('root')
)
```

This file basically creates the entrypoint for the application.
At the beginning we import the required libraries which are needed, such as react and redux.
To make your life easy for debugging purposes we also use the [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) which provides redux state information in the browser.
We also use the [redux thunk library](https://github.com/reduxjs/redux-thunk) to make the dispatching of actions a little simpler (read more about thunks [on this stackoverflow thread](https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559)).

Furthermore we initialize our redux store within the constant `store` which will hold our state and inject our reducer which will be created in the next steps.

The `render` function calls our redux provider with the `App` constant as a child holding the logic and renders it in the root element with the id `root` which can be found in the `public/index.html`.

Don't be afraid, you will soon be able to connect the dots.

### index.css

Our stylesheets will live in the same folder `src` in a file we will name `index.css` (you can clearly see the import of this file in `index.js` above).
Go ahead and create the file itself with:

```sh
touch index.css
```

Afterwards paste this css markup:

```css
@import '~semantic-ui-css/semantic.css';
@import '~leaflet/dist/leaflet.css';
@import '~tachyons/css/tachyons.css';
@import '~react-semantic-toasts/styles/react-semantic-alert.css';

body {
  margin: 0;
  padding: 0;
}
```

As mentioned in the introduction we will make use of [Semantic UI](https://semantic-ui.com/) because of its fancy css classes.
Furthermore we will import leaflet's stylesheet for the map components as well as tachyons to adjust the layout with simple css classes.
We remove all margins and paddings, since we want the map to use the full viewport.

This leaves us with the following folder structure:

```sh
├── node_modules
│   ├── ...
│   ├── ...
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src
│   ├── Controls
│   ├── Map
│   ├── actions
│   ├── index.css
│   ├── index.js
│   └── reducers
└── yarn.lock
```

### App.jsx

In the previous step we imported the `App` component in `index.js`.
This component, however, doesn't exist yet which is why we now have to create a new file which also lives in the `src` folder.

```bash
touch App.jsx
```

This file is very basic and for now only imports the map component (which also doesn't exist yet):

```javascript
import React from 'react'
import Map from './Map/Map'

class App extends React.Component {
  render() {
    return (
      <div>
        <Map />
      </div>
    )
  }
}

export default App
```

### Map/Map.jsx

As the name suggests this class component will create our map and take care of all of our interactions within.
Step by step we will add some logic to this component but let's start with the basics first.
Looking at the code you will notice quite quickly that it looks quite similar to the `App.jsx` component we built above with the major difference that it makes use of our redux store (remember, we will require state!).
We import all required react and react-redux modules as well as leaflet which we use as our mapping library and a slighty adapted HERE TileLayer class from [Ivan Sanchez' repository](https://gitlab.com/IvanSanchez/Leaflet.TileLayer.HERE) to import any kind of map styles [**HERE Maps**](https://developer.here.com/products/maps) offers.
Please make sure that your `Map.jsx` lives in the `Map` folder.

To understand the specific code blocks please read the inline comments.

```javascript
import React from 'react'
import L from 'leaflet'
import HereTileLayers from './hereTileLayers'

// defining the container styles the map sits in
const style = {
  width: '100%',
  height: '100vh'
}

// using the reduced.day map styles, have a look at the imported hereTileLayers for more
const hereReducedDay = HereTileLayers.here({
  appId: 'your_heremaps_app_id',
  appCode: 'your_heremaps_app_code',
  scheme: 'reduced.day'
})

// for this app we create two leaflet layer groups to control, one for the isochrone centers and one for the isochrone contours
const placesLayer = L.featureGroup()
const clusterLayer = L.featureGroup()

// a leaflet map consumes parameters, I'd say they are quite self-explanatory
const mapParams = {
  center: [40.7569, -73.9837],
  zoomControl: false,
  maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
  zoom: 13,
  layers: [placesLayer, clusterLayer, hereReducedDay]
}

// this you have seen before, we define a react class component
class Map extends React.Component {
  // and once the component has mounted we add everything to it
  componentDidMount() {
    // our map!
    this.map = L.map('map', mapParams)

    // we create a leaflet pane which will hold all cluster polygons with a given opacity
    const clusterPane = this.map.createPane('clusterPane')
    clusterPane.style.opacity = 0.9

    // our basemap and add it to the map
    const baseMaps = {
      'HERE Maps Tiles: reduced day': hereReducedDay
    }

    // and overlay maps
    const overlayMaps = {
      'Points of interest': placesLayer,
      Clusters: clusterLayer
    }

    // lets add the layers to our layer control
    L.control.layers(baseMaps, overlayMaps).addTo(this.map)

    // we do want a zoom control
    L.control
      .zoom({
        position: 'topright'
      })
      .addTo(this.map)
  }

  render() {
    return <div id="map" style={style} />
  }
}

// we have to obviously export it
export default Map
```

And you may have noticed that in the head of this file we are importing the HERE TileLayers which you can directly download from github.

```bash
cd Map
curl -H 'Accept: application/vnd.github.v3.raw' -o hereTileLayers.js https://api.github.com/repos/gis-ops/dbscan-clustering/contents/src/Map/hereTileLayers.js
```

And to help you keep track of things, this is your new folder and file structure should more or less look like:

```sh
├── node_modules
│   ├── ...
│   ├── ...
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src
│   ├── Controls
│   ├── Map
│   │   ├── Map.jsx
│   │   └── hereTileLayers.js
│   ├── actions
│   ├── index.css
│   ├── index.js
│   ├── App.jsx
│   └── reducers
└── yarn.lock
```

To see your map in action simply call `npm start` in your shell and wait for the browser to open.

### Creating our initial redux state

In our map react class component you will have noticed that we are declaring a constant `mapStateToProps` which is used in the `react-redux connect` function which helps us inject the state into a specific component.

Our control center of this app will be a little widget with options to fetch different points of interest from HERE Maps and run the DBScan clustering algorithm.
This control panel will be our second React class component sitting along side the map component.
To keep it simple we will add one state object to our redux store; its state will be controlled by several actions originating from our control and map component.

Lets go ahead and:

- create a empty file `actions.js` in the `actions` folder and
- a file `index.js` in the reducers folder holding our state object for the controls

The constant `initialPlacesState` is the initial state object which is initially loaded and later be reduced depending on the specific action made by the user from the control pane or map respectively.

### reducers/index.js

```javascript
import { combineReducers } from 'redux'

// our initial state object with an empty boundingbox string, a lastCall Date field and an empty places object
const initialPlacesState = {
  boundingbox: '',
  lastCall: Date.now(),
  places: {}
}

// this is our switch clause which will reduce the actions depending on what is being called
const placesControls = (state = initialPlacesState, action) => {
  switch (action.type) {
    default:
      return state
  }
}
// we combine reducers here, in our case it is only one
const rootReducer = combineReducers({
  placesControls
})

export default rootReducer
```

Let's quickly summarize what we have achieved so far.
If you have followed the tutorial carefully you will have noticed that `src/index.js` is importing the reducer we have just created to initiate the redux store.
The `App` which is being called inside inherently has access to this store and obviously all child components also.
The 2 child components of our app handling all the logic will be our controls (which thus far don't exist) and the map component which has to listen to state changes and accordingly visualize state updates on the map.
And guess what: they are talking to each other via our redux store.

![The leaflet map](https://user-images.githubusercontent.com/10322094/53686550-d0a57000-3d28-11e9-99c7-20055b815cac.png 'The leaflet map')

## Step 3 - Let's add controls!

It's time to start with the fun stuff.
To conveniently fetch HERE Maps places we will need to be able to call their API with different category settings.
We will control this logic with a small component in the application; therefore please navigate to the `Controls` folder and create a file which we will name `Control.jsx`.
This will hold our react class component for our controls.

### Controls/Control.jsx

Our control has the following requirements:

1. Click different buttons depending on the desired places category
2. Compute DBScan clusters with the results fetched in 1.

This obviously requires some user interaction and as the name suggests we need to define a range of redux actions which will reduce our state.
So let's go ahead and start with the first requirement in `Control.jsx`: adding the logic to fetch places buttons.
Don't worry too much about the new bits and pieces inside this block of code, you will learn quite quickly what they are doing.
Please carefully go through the code line by line and read the inline comments with explanations.

```javascript
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Segment, Button, Label, Popup } from 'semantic-ui-react'

// our actions which yet have to be scripted!
import { fetchHerePlaces, clear } from '../actions/actions'

// some simple css styles which we could outsource to index.css but who cares for now ;-)
const segmentStyle = {
  zIndex: 999,
  position: 'absolute',
  width: '400px',
  top: '10px',
  left: '10px',
  maxHeight: 'calc(100vh - 3vw)',
  overflow: 'auto',
  padding: '20px'
}

// some HERE Maps places categories we want to be able to fetch with some cute colors
const herePlaces = {
  0: { name: 'shopping', color: 'red' },
  1: { name: 'accommodation', color: 'orange' },
  2: { name: 'administrative-areas-buildings', color: 'yellow' },
  3: { name: 'airport', color: 'olive' },
  4: { name: 'atm-bank-exchange', color: 'green' },
  5: { name: 'coffee-tea', color: 'teal' },
  6: { name: 'eat-drink', color: 'blue' },
  7: { name: 'going-out', color: 'violet' },
  8: { name: 'hospital-health-care-facility', color: 'purple' },
  9: { name: 'leisure-outdoor', color: 'pink' },
  10: { name: 'natural-geographical', color: 'brown' },
  11: { name: 'petrol-station', color: 'green' },
  12: { name: 'restaurant', color: 'grey' },
  13: { name: 'snacks-fast-food', color: 'black' },
  14: { name: 'sights-museums', color: 'red' },
  16: { name: 'toilet-rest-area', color: 'yellow' },
  17: { name: 'transport', color: 'olive' }
}

// we will use some functional react components to make our lives simple
const CustomLabel = ({ content, value }) => (
  <Popup content={content} trigger={<Label size="tiny">{value}</Label>} />
)

class Control extends React.Component {
  static propTypes = {
    places: PropTypes.object,
    dispatch: PropTypes.func.isRequired
  }

  // what happens if we click a places button
  handleClick = (event, data) => {
    const { dispatch } = this.props
    dispatch(fetchHerePlaces({ category: data.content, color: data.color }))
  }

  // and also what happens if we click the remove icon
  handleClickClear = () => {
    const { dispatch } = this.props
    dispatch(clear())
  }

  // some buttons can be disabled if no places exist..
  areButtonsDisabled = places => {
    let buttonsDisabled = true
    for (const key in places) {
      if (places.hasOwnProperty(key)) {
        if (places[key].hasOwnProperty('data') && places[key].data.length > 0) {
          buttonsDisabled = false
        }
      }
    }
    return buttonsDisabled
  }

  render() {
    // places coming directly from our redux state
    const { places } = this.props

    // another functional class component with a magnitude of props options
    // this component will be used multiple times in this application
    const CustomButton = ({
      content,
      circular,
      popupContent,
      handler,
      icon,
      value,
      disabled,
      basic,
      size,
      loading,
      color
    }) => (
      <Popup
        content={popupContent}
        size={size}
        trigger={
          <Button
            color={color}
            circular={circular}
            content={content}
            loading={loading}
            size={size}
            onClick={handler}
            basic={basic}
            disabled={disabled}
            icon={icon}
          />
        }
      />
    )

    // we will loop through the herePlaces object defined above and add semantic ui buttons this way
    return (
      <div>
        <Segment style={segmentStyle}>
          <div>
            {Object.keys(herePlaces).map((key, index) => {
              return (
                <div key={index} className="mt1 dib">
                  <CustomButton
                    icon={false}
                    popupContent={'Fetch places of this category'}
                    content={herePlaces[key].name}
                    disabled={false}
                    handler={this.handleClick}
                    color={herePlaces[key].color}
                    loading={
                      places[herePlaces[key].name]
                        ? places[herePlaces[key].name].isFetching
                        : false
                    }
                    size="tiny"
                  />
                </div>
              )
            })}
            <div className="mt2">
              <CustomButton
                icon={'remove'}
                size={'tiny'}
                popupContent={'Reset places and map'}
                handler={this.handleClickClear}
                disabled={this.areButtonsDisabled(places)}
              />
            </div>
          </div>
        </Segment>
      </div>
    )
  }
}

// connecting this class component to our react store!
const mapStateToProps = state => {
  const { places } = state.placesControls
  return {
    places
  }
}

export default connect(mapStateToProps)(Control)
```

We have added the buttons we want to be able to click to fetch categories from the HERE Maps places API.
So far so good.
You will quickly notice that nothing happens if you click the buttons, surprise surprise.. the actions are missing!
What do we want to accomplish?

1. we want to fire an action when a user clicks a button which..
2. fires a request to the HERE Maps places API.
3. and displays there places on the map
4. and possibly you as a user want to clear the map again

This logic is basically mapped to 2 actions, namely `fetchHerePlaces` and `clear` which are imported at the beginning of the file - which don't exist yet.
So let's open `actions.js` in the actions folder.

### actions/actions.js

This is probably the most tricky part to wrap your head around.
As outlined above the actions being called in `Control.jsx` are

- `fetchHerePlaces()`
- `clear()`

which you will find within this piece of actions code.

The `fetchHerePlaces()` action simply makes a call to HERE; please find more comprehensive details inline.

```javascript
// use these or add your own credentials, sign up at here maps for a developer account at https://account.here.com/sign-in
const hereAppCode = 'your_heremaps_app_code'
const hereAppId = 'your_heremaps_app_id'

// 3 new action types
export const RECEIVE_PLACES_RESULTS = 'RECEIVE_PLACES_RESULTS'
export const REQUEST_PLACES_RESULTS = 'REQUEST_PLACES_RESULTS'
export const CLEAR = 'CLEAR'

// this function takes care of the call to the HERE Maps API
export const fetchHerePlaces = payload => (dispatch, getState) => {
  // this simple dispatcher will make sure our loading icon spins ;-)
  dispatch(requestPlacesResults({ category: payload.category }))

  // here we have to access our state in the action to retrieve the boundingbox
  // of the map which will be reduced in the subsequent step
  const { boundingbox } = getState().placesControls

  // to learn more about the parameters use this link https://developer.here.com/documentation/places/topics/search-results-ranking.html
  const url = new URL(
    'https://places.demo.api.here.com/places/v1/discover/explore'
  )
  const params = {
    app_id: hereAppId,
    app_code: hereAppCode,
    // this will come from the map class component which yet has to be coded
    in: boundingbox,
    // the amount of places
    size: 100,
    // and the category clicked by the user
    cat: payload.category
  }

  url.search = new URLSearchParams(params)

  return fetch(url)
    .then(response => response.json())
    .then(data =>
      // once the data as json is returned we will dispatch the parsing of the data which will include the category and color passed through from the button properties
      dispatch(
        processPlacesResponse(
          data,
          payload.category,
          boundingbox,
          payload.color
        )
      )
    )
    .catch(error => console.error(error))
}

// to clear the places!
export const clear = () => ({
  type: CLEAR
})

const parsePlacesResponse = json => {
  if (json.results && json.results.items.length > 0) {
    return json.results.items
  }
  return []
}

const processPlacesResponse = (json, category, bbox, color) => dispatch => {
  const results = parsePlacesResponse(json)

  // the response is parsed and ready to be dispatched to our reducer
  dispatch(
    receivePlacesResults({
      data: results,
      category: category,
      boundingbox: bbox,
      color: color
    })
  )
}

export const receivePlacesResults = places => ({
  type: RECEIVE_PLACES_RESULTS,
  payload: places
})

export const requestPlacesResults = category => ({
  type: REQUEST_PLACES_RESULTS,
  payload: category
})
```

The actions are now in place which subsequently have to be reduced.
Please open your `index.js` in the reducer folder and import these actions right at the beginning of the file:

### reducers/index.js

```javascript
...

import {
  REQUEST_PLACES_RESULTS,
  RECEIVE_PLACES_RESULTS,
  CLEAR
} from '../actions/actions'

...
```

And please add the the following cases to our `switch clause` under `placesControls` in the same file to let the the reducer know what to reduce for which action:

```javascript
...

// as mentioned above we want to let our button know that it is doing something
case REQUEST_PLACES_RESULTS:
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

// if results are received we will start reducing our state
case RECEIVE_PLACES_RESULTS:
  return {
    ...state,
    // when was this data received
    lastCall: Date.now(),
    // updating our places object
    places: {
      ...state.places,
      // for the requested category
      [action.payload.category]: {
        ...state.places[action.payload.category],
        // this ternary operator decides if we will merge previous calls or not
        data: state.places[action.payload.category].hasOwnProperty('data')
          ? [
              ...state.places[action.payload.category].data,
              ...action.payload.data
            ]
          : action.payload.data,
        // of course we will want to save the boundingbox of this API request
        boundingbox: action.payload.boundingbox,
        // and the color (used for the map later!)
        color: action.payload.color,
        // and make sure our spinner is disabled again
        isFetching: false
      }
    }
  }

// self explanatory - I hope!
case CLEAR:
  return {
    ...state,
    places: {},
    lastCall: Date.now(),
    lastCompute: Date.now()
  }

...
```

To complete this step we have to import the controls to our application in `App.jsx`.

### App.jsx

- import the controls with `import Controls from './Controls/Control'`
- and render them by adding `<Controls />` inside the `<div>...</div>` section.

With all the changes in place you browser should update itself automatically.
If it doesn't happen then simply run `npm start` again.
You will now be able to click the buttons which should start and stop the spinner in the buttons.
If you open your network console you will also see that requests are being made and if you are using the redux developer tools you will see that your redux store has been reduced with places categories after the API call has been made.
But hang on, there is yet a little work to do.. the HERE API so far does not know which bounding box to look for places in.

Your application should look something like this:

![The map with places buttons](https://user-images.githubusercontent.com/10322094/63046979-be348280-bed3-11e9-8f41-9fe27711efdf.png 'The map with places buttons')

## Step 5 - Putting the places on the map!

We obviously want to be able to see our HERE Maps places on the map now.
If you followed the previous step carefully you will have seen that there is a parameter in API call called `in` which consumes the bounding box of the map.
Why? Well, HERE has to know where to look for places.
Open your `Map.jsx` file and look for the `componentDidMount()` function.
We will need new map listeners which will make sure that our state gets an idea of which bounding box the user is currently looking at.

### Map/Map.jsx

```javascript
...

// when the map is paned, update the bounding box in the redux store
this.map.on('moveend', () => {
  dispatch(doUpdateBoundingBox(this.map.getBounds()))
})

// and also on load
dispatch(doUpdateBoundingBox(this.map.getBounds()))

...
```

And another action which has to be dispatched.
I have called it `doUpdateBoundingBox()` which takes the `getBounds()` as an argument which is part of the Leaflet Map instance.
So let's add it _but remember_ to import it in your Map component `import { doUpdateBoundingBox } from '../actions/actions'`.

### actions/actions.js

```javascript

// a new action type to let our reducer know
export const UPDATE_BBOX = 'UPDATE_BBOX'

...

export const doUpdateBoundingBox = boundingbox => dispatch => {
  // here we simply build the bounding box string which is required for the HERE Maps API
  const bbox = [
    boundingbox._southWest.lng,
    boundingbox._southWest.lat,
    boundingbox._northEast.lng,
    boundingbox._northEast.lat
  ].join(',')

  dispatch(updateBoundingBox(bbox))
}

const updateBoundingBox = bbox => ({
  type: UPDATE_BBOX,
  payload: bbox
})

...
```

And last but not least we will add this functionality to our reducer.

### reducers/index.js

First of all import `UPDATE_BBOX` it in the head of `index.js` where all your other imported actions reside.
Then we will add a new simple case to our switch clause:

```javascript

...

case UPDATE_BBOX:
  return {
    ...state,
    boundingbox: action.payload
  }

...
```

This will make our http calls to the HERE Maps places API complete and return data.
However, we will have to make sure that they are plotted on the map, so let's go back there...

### Map/Map.jsx

We will add a new function `componentDidUpdate()` which is part of every React class component and will be called automatically if the state has updated - I guess you will have most likely seen this guy before.
Please add this in the class itself.
You will remember the `lastCall` parameter of our store which we can make use of here.
We basically want to know if this parameter has changed compared to the previous props.
If this is the case, we know a new request has been made to the API and we can update our map with the help of `addPlaces()`.

```javascript

...

componentDidUpdate(prevProps) {
  const { lastCall } = this.props
  // is the epoche timestamp later?
  if (lastCall > prevProps.lastCall) {
    // if so, then start adding places to the map
    this.addPlaces()
  }
}

addPlaces() {
  // let's clear the layers with the help of Leaflets mighty API
  placesLayer.clearLayers()

  // places will become part of our props but for this we have to connect this component to our state in the next step
  const { places } = this.props
  let cnt = 0
  // loop through our places
  for (const place in places) {
    // make sure data is there ;-)
    if (
      places[place].hasOwnProperty('data') &&
      places[place].data.length > 0
    ) {
      // for every place in data we will add a beautiful Leaflet circlemarker with a tooltip!
      for (const placeObj of places[place].data) {
        L.circleMarker([placeObj.position[0], placeObj.position[1]], {
          color: places[place].color,
          orig_color: places[place].color,
          radius: 5,
          id: cnt,
          weight: 1,
          opacity: 0.5
        })
          .addTo(placesLayer)
          .bindTooltip(placeObj.title)
        cnt += 1
      }
    }
  }
}

...
```

But where to the places come from?
Of course, from our redux store.
Let's connect this component with this following snippet but don't forget to remove the current `export default Map`!

```javascript

...

const mapStateToProps = state => {
  const { places, lastCall } = state.placesControls
  return {
    places,
    lastCall
  }
}

export default connect(mapStateToProps)(Map)

...
```

We have made it.
Refresh your application and request some places, you will see something beautiful like this:

![Some places on the map](https://user-images.githubusercontent.com/10322094/63048658-4700ed80-bed7-11e9-91ad-5f266c0df8d7.png 'Some places on the map!')

## Step 6 - Preparing our application for DBScan clustering

You may have guessed again.
There are 4 places where we will have to add further logic to make sure we can compute clusters with DBScan.
The actions, the reducers, the Map and of course the Controls.
Let's start enhancing our reducer to make sure it can cope with a little more state.

### reducers/index.js

DBScans main settings consist of a) minimum points and b) maximum distance, if you are interested to learn how these work please check the links we provided above.
Hence, we will add some basic initial state settings to the file and extend our switch clause in our reducer.
We want to both update our settings and also be able to compute the clusters and will need some actions which yet don't exist.

```javascript

...

// add these 2 actions in our import block
import {

  ...

  UPDATE_DBSCAN_SETTINGS,
  COMPUTE_DBSCAN
}

// and enhance our initial state object with these key and value pairs
const initialPlacesState = {

  ...

  dbscanSettings: {
    minPoints: 10,
    maxDistance: 500
  },
  // this lastCompute will help us again determine if a new computation should be made
  lastCompute: 0
}

...


// let's update the lastCompute key when this action is called
case COMPUTE_DBSCAN:
  return {
    ...state,
    lastCompute: Date.now()
  }

// and we want to update our dbscan settings when these are changed in the controller by the user
case UPDATE_DBSCAN_SETTINGS:
  return {
    ...state,
    dbscanSettings: {
      ...state.dbscanSettings,
      [action.payload.setting]: action.payload.value
    }
  }


...
```

The actions in our reducer are imported from our actions file, eureka, so go add them tiger.
It couldn't really get any simpler:

### actions/actions.js

```javascript

...

export const UPDATE_DBSCAN_SETTINGS = 'UPDATE_DBSCAN_SETTINGS'
export const COMPUTE_DBSCAN = 'COMPUTE_DBSCAN'

...

export const computeDbScan = () => ({
  type: COMPUTE_DBSCAN
})

export const updateDbScanSettings = settings => ({
  type: UPDATE_DBSCAN_SETTINGS,
  payload: { ...settings }
})


```

Last but not least we want to add this logic to the user interface, both controls and map.
We have defined our actions and reducers which we can now connect to the controls component.

### Controls/Control.jsx

```javascript

...

const mapStateToProps = state => {
  const {
    ...
    // new!
    dbscanSettings
  } = state.placesControls
  return {
    ...
    // new!
    dbscanSettings
  }
}

```

And we need some simple controls, usually sliders look quite nice.
Let's also add the `Header` and `Divider` class from semantic UI.
Furthermore you will have to import the newly added actions.

```javascript

...

import { Slider } from 'react-semantic-ui-range'

import {
  ...
  Divider,
  Header
} from 'semantic-ui-react'


import {
  ...
  updateDbScanSettings,
  computeDbScan,
} from '../actions/actions'

...

// this custom slider is a functional class component which we can re-use for both dbscan settings
const CustomSlider = ({ name, min, max, step, start, value, dispatch }) => (
  <Slider
    discrete
    color="grey"
    settings={{
      start: start,
      value: value,
      min: min,
      max: max,
      step: step,
      onChange: val => {
        // if the slider is changed dispatch an action!
        dispatch(
          updateDbScanSettings({
            setting: name,
            value: val
          })
        )
      }
    }}
  />
)

// and a functional component for the ui labels
const CustomLabel = ({ content, value }) => (
  <Popup content={content} trigger={<Label size="tiny">{value}</Label>} />
)

...

// the following snippets belong to our class component directly

// this function is executed once a user clicks the dbscan compute button
handleClickDbscan = () => {
  const { dispatch } = this.props
  dispatch(computeDbScan())
}

render() {

    // we will have to access our dbscan settings and the dispatch function from redux in our render() function
    const { ..., dbscanSettings, dispatch } = this.props

    ...

    // the sliders can sit on top of our colorful buttons
   <Header as="h5">DBScan settings</Header>
    // by the way, these are tachyons css classes
    <div className="flex flex-row">
      <div className="w-80">
        // our functional component using CustomSlider from above
        <CustomSlider
          name={'maxDistance'}
          min={100}
          max={5000}
          step={50}
          start={dbscanSettings.maxDistance}
          value={dbscanSettings.maxDistance}
          dispatch={dispatch}
        />
        <div className="mt2">
          // hopefully self explanatory
          <CustomLabel
            value={'Max. distance: ' + dbscanSettings.maxDistance}
            content={
              'Maximum Distance ε between any point of the cluster to generate the clusters'
            }
          />
        </div>
      </div>
      <div className="w-80">
        <CustomSlider
          name={'minPoints'}
          min={3}
          max={20}
          step={1}
          start={dbscanSettings.minPoints}
          value={dbscanSettings.minPoints}
          dispatch={dispatch}
        />

        <div className="mt2">
          // hopefully self explanatory aswell.
          <CustomLabel
            value={'Min. points: ' + dbscanSettings.minPoints}
            content={
              "Minimum number of points to generate a single cluster, points which do not meet this requirement will be classified as an 'edge' or 'noise'."
            }
          />
        </div>
      </div>
      <div className="w-20">
        // using the CustomButton functional component we already used for our colorful places buttons
        <CustomButton
          basic={true}
          size={'tiny'}
          icon={'whmcs'}
          circular={true}
          popupContent={'Compute DBScan'}
          disabled={this.areButtonsDisabled(places)}
          handler={this.handleClickDbscan}
        />
      </div>
    </div>
    <Divider />

    ...
    // our buttons code follows here..

```

We have 2 different actions which are dispatched in this class now, namely `handleClickDbscan()` and `updateDbScanSettings()`.
If you drag the sliders and change the values you will, in your redux state, notice that these are updated on the fly.
The computation of clusters we will make part of our `Map.jsx` which comes next.

## Step 7 - Computing clusters and adding them to the map

![DBScan settings panel](https://user-images.githubusercontent.com/10322094/63053069-29d11c80-bee1-11e9-8f9d-b85463ef604d.png 'DBScan settings panel!')

### Map/Map.jsx

With our `lastCompute` state we can let the map know if the user has clicked on the compute dbscan clusters button.
_TurfJS_ will help us compute density based clusters, so let's make sure we add this logic.

```javascript

...

import { makeClusterObjects, computeDbScan, prepareGeojson } from './utils'

...

```

`utils.js`? This guy is new.
We will use this file for a couple of functions to compute clusters and parse them.
This will make the Map class component a little easier to read as the code is slowly exploding.
Let's create it and add the following code block.

### Map/utils.js

```javascript
import { clustersDbscan, point } from '@turf/turf'
import L from 'leaflet'

// this should look simple - it is using our DBScan settings and we compute the clusters with TurfJS!
export const computeDbScan = (pointsGeojson, dbscanSettings) => {
  const maxDistance = dbscanSettings.maxDistance / 1000
  const minPoints = dbscanSettings.minPoints
  const clustered = clustersDbscan(pointsGeojson, maxDistance, {
    minPoints: minPoints
  })

  return clustered
}

// this function makes sure our different information in the clusters is processed for our needs
export const makeClusterObjects = data => {
  const clusters = {}

  for (const feature of data.features) {
    if (
      feature.properties.dbscan === 'noise' ||
      feature.properties.dbscan === 'edge'
    ) {
      if (clusters.hasOwnProperty(feature.properties.dbscan)) {
        clusters[feature.properties.dbscan].push(feature.geometry.coordinates)
      } else {
        clusters[feature.properties.dbscan] = []
      }
    } else if (feature.properties.dbscan === 'core') {
      if (clusters.hasOwnProperty(feature.properties.cluster)) {
        clusters[feature.properties.cluster].push(
          point(feature.geometry.coordinates)
        )
      } else {
        clusters[feature.properties.cluster] = []
      }
    }
  }

  return clusters
}

// and this is where we create the Leaflet objects for our map
export const prepareGeojson = (geojson, clusterSize, clusterObj) => {
  return L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => {
      switch (feature.properties.type) {
        case 'edge':
        case 'noise':
          return L.circleMarker(latlng)
      }
    },
    style: feature => {
      switch (feature.properties.type) {
        case 'cluster':
          return {
            radius: 8,
            fillColor: 'black',
            weight: 0,
            opacity: 1,
            color: 'black',
            pane: 'clusterPane'
          }
        case 'noise':
          return {
            radius: 8,
            fillColor: 'black',
            color: 'black',
            weight: 0,
            opacity: 1,
            fillOpacity: 0.3
          }
        case 'edge':
          return {
            radius: 8,
            fillColor: 'blue',
            color: 'blue',
            weight: 0,
            opacity: 1,
            fillOpacity: 0.3
          }
      }
    }
  }).bindTooltip(
    '<strong>DBScan information:</strong> ' +
      (!isNaN(clusterObj)
        ? 'Cluster ' + (parseInt(clusterObj) + 1)
        : clusterObj) +
      (!isNaN(clusterObj)
        ? '<br/> ' +
          '<strong>Amount of points in cluster:</strong> ' +
          clusterSize
        : ''),
    {
      permanent: false,
      sticky: true
    }
  )
  //.openTooltip()
}
```

And where is this piece of code called?
Of course, in our `componentDidUpdate()` in `Map.jsx`.
Straight forward, right?
It is basically using the same logic we used to determine whether to add `circleMarkers` to the map.

### Map/Map.jsx

```javascript

...

componentDidUpdate(prevProps) {

  const { ..., lastCompute, dbscanSettings } = this.props

  ...

  if (lastCompute > prevProps.lastCompute) {
    clusterLayer.clearLayers()
    const clusters = computeDbScan(placesLayer.toGeoJSON(), dbscanSettings)
  }
}

...

```

The DBScan computation has successfully returned clusters which have to be processed which is the very last step to visualize them on the map.
This step is a little cumbersome as it requires parsing the data returned by TurfJS to specific GeoJSON objects depending on whether they are **clusters (polygons)**, **noise** or **edge** points.

Let's dive back into the `componentDidUpdate()` function and below `const clusters..` add a new class component function which we can call with `this.processClusters(clusters)`.
To make our lives a little easier we will use multiple classes provided by _TurfJS_.

```javascript

...

import { concave, polygon, multiPoint, featureCollection } from '@turf/turf'

...


processClusters(clusterData) {

  // some postprocessing of the clusters, happens in utils.js
  const clustersNoiseEdges = makeClusterObjects(clusterData)

  // looping through the processed clusters, we either have to compute the concave hull for clusters greater than 3 points
  // for clusters with 3 points we create polygons
  // and for anything less we want to display them as MultiPoints
  for (const clusterObj in clustersNoiseEdges) {
    const clusterSize = clustersNoiseEdges[clusterObj].length
    let geojson
    if (clusterObj !== 'noise' && clusterObj !== 'edge') {
      switch (true) {
        case clusterSize <= 2: {
          geojson = multiPoint(
            featureCollection(clustersNoiseEdges[clusterObj]),
            {
              type: 'cluster'
            }
          )
          break
        }

        case clusterSize == 3: {
          geojson = polygon(
            featureCollection(clustersNoiseEdges[clusterObj]),
            {
              type: 'cluster'
            }
          )
          break
        }

        case clusterSize > 3: {
          geojson = concave(featureCollection(clustersNoiseEdges[clusterObj]))
          geojson.properties.type = 'cluster'

          break
        }
      }
    // if the cluster type is noise or edge we also use MultiPoints
    } else {
      geojson = multiPoint(clustersNoiseEdges[clusterObj], {
        type: clusterObj
      })
    }

    // This is our last utils function we use to create the Leaflet GeoJSON classes and add them directly to the map
    prepareGeojson(geojson, clusterSize, clusterObj).addTo(clusterLayer)
  }
}

...

```

Drum roll... you are done!
Your final folder structure should look something similar to this:

```javascript
.
├── node_modules
│   ├── ...
│   ├── ...
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── App.jsx
    ├── Controls
    │   └── Control.jsx
    ├── Map
    │   ├── Map.jsx
    │   ├── hereTileLayers.js
    │   └── utils.js
    ├── actions
    │   └── actions.js
    ├── index.css
    ├── index.js
    └── reducers
        └── index.js
```

### Wrap-up

At this point you have managed to build a simple web-app based on _React_, _Redux_, _TurfJS_ and _Leaflet_ which fetches and consumes places from \*HERE Maps\* and is able to compute DBScan clusters.
Congratulations!

As you may have already gathered from the documentation, the **HERE Maps Places API** is fairly feature rich and we haven't implemented all of the possible options and features.
To this end, if you are interested to enhance the code we built together in this tutorial with new features feel free to create a pull request.
And if you have ideas how to improve this tutorial or in case something didn't work as you expected please feel free to leave some lovely feedback on our [GitHub](https://github.com/gis-ops/tutorials/issues/new).

Thanks for working through this tutorial - **your GIS-OPS team**.

![DBScan clusters on your map](https://user-images.githubusercontent.com/10322094/63055497-4b80d280-bee6-11e9-8088-9287f89e76d4.png 'DBScan clusters on your map.')

/_ eslint-disable _/

# Building a DBScan Clustering Web(M)app with HERE Maps places, React, Leaflet and TurfJS

![HERE Maps Places and DBScan Clusters](https://user-images.githubusercontent.com/10322094/62734878-49bc9800-ba2a-11e9-9341-2d8215501c23.jpg)

In this tutorial you will learn how to use ReactJS, Redux, TurfJS and Leaflet to create a simple but powerful maps application which is capable of consuming the HERE Places API and with these able to compute clusters with [DBScan](https://en.wikipedia.org/wiki/DBSCAN).

Ummmh, so what are clustering algorithms good for? Let's have a look what wikipedia says.

_Cluster analysis or clustering is the task of grouping a set of objects in such a way that objects in the same group (called a cluster) are more similar (in some sense) to each other than to those in other groups (clusters). It is a main task of exploratory data mining, and a common technique for statistical data analysis, used in many fields, including machine learning, pattern recognition, image analysis, information retrieval, bioinformatics, data compression, and computer graphics. [Wikipedia](https://en.wikipedia.org/wiki/Cluster_analysis)._

This application consumes the useful **HERE Maps Places API** to fetch points of interest in the bounding box of the map.
As a user you have the possibilty to select different category types and tweak DBScan settings to compute clusters with the points of interest.
Read more about the options in the [HERE Maps Places Documentation](https://developer.here.com/documentation/places/topics/quick-start-find-text-string.html?cid=Places-Google-MM-T2-Dev-Brand-BMM&utm_source=Google&utm_medium=ppc&utm_campaign=Dev_PaidSearch_DevPortal_AlwaysOn).

## Prerequisites

To follow this tutorial, you will need the following:

- Knowledge of JavaScript; in particular we will generally be using [ES2016](http://es6-features.org/#Constants).
- A basic understanding of Single-Page-Applications, ReactJS, JSX, Redux and Leaflet. We recommend the following [basic tutorial](https://redux.js.org/introduction/getting-started) which will give you a decent introduction why and how to combine react with redux.
- A shell environment with preinstalled [Node.js](https://nodejs.org/en/download/) giving you the ability to use its package manager `npm` and `npx`.
- A simple text editor such as [Sublime Text](https://www.sublimetext.com/).

## Step 1 - Set up your app folder structure and install dependencies

Open your shell and clone this repository in your working directory.

```sh
git clone https://github.com/gis-ops/dbscan-clustering.git dbscan-clustering
```

Next up we will want to remove all files in the source folders as you will be creating these as part of this tutorial.

```sh
find src -type f -delete
```

Up next you will have to install all required dependencies.
We have prepared a `package.json` which you can use for installation which resides in your home folder `dbscan-clustering`.

```sh
npm install
```

By the way, you might be wondering why we need these dependencies... TL;DR:

- [axios](https://github.com/axios/axios), a promise based HTTP client for the browser and node.js
- [chroma-js](https://github.com/gka/chroma.js) for beautiful color ranges for our polygons
- [leaflet](https://github.com/Leaflet/Leaflet) for the map & interaction
- [turfjs](https://github.com/Turfjs/turf) for spatial operations
- [semantic ui](https://react.semantic-ui.com/) for beautiful interfaces
- [tachyons](https://tachyons.io/) helper css classes, just helpful
  ...

You might be asking yourself why we aren't using react-leaflet bindings and the reason is simple: you should learn how leaflet works in its very core!

You folder structure should now have the following folder layout:

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

We do not have to worry about the public folder but feel free to read more about [webpack](https://github.com/webpack/webpack) in general if you are interested how it bundles and builds the application, e.g. [this tutorial](https://tutorialzine.com/2017/04/learn-webpack-in-15-minutes).

## Step 2 - Let's create a map!

With the first steps in place, we can start getting our hands dirty with the code of our first react components.
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
This component, however, doesn't exist yet which is why we now have to create a new file which also lives in `src` folder.

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

### Map.jsx

As the name suggests this component will create our map and handle all of our interactions on it.
Step by step we will add some logic to this component but let's start with basics first.
Looking at the code you will notice quite quickly that it looks quite similar to the `App.jsx` component we built above with the major difference that it makes use of our redux store (remember, we will require state).
We import all required react and react-redux modules as well as leaflet which we use as our mapping library and a slighty adapted HERE TileLayer class from [Ivan Sanchez' repository](https://gitlab.com/IvanSanchez/Leaflet.TileLayer.HERE) to import any kind of map styles [**HERE Maps**](https://developer.here.com/products/maps) offers.
`Map.jsx` lives in the `Map` folder.

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
  appId: 'jKco7gLGf0WWlvS5n2fl',
  appCode: 'HQnCztY23zh2xiTPCFiTMA',
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

// this you have seen before, we define a react component
class Map extends React.Component {
  // and once the component has mounted we add everything to it
  componentDidMount() {
    // our map!
    this.map = L.map('map', mapParams)

    // we create a leaflet pane which will hold all isochrone polygons with a given opacity
    const clusterPane = this.map.createPane('clusterPane')
    clusterPane.style.opacity = 0.9

    // our basemap and add it to the map
    const baseMaps = {
      'HERE Maps Tiles: reduced day': hereReducedDay
    }

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

export default Map
```

In the head of this file we are importing the HERE TileLayers which you can directly download from github.

```bash
cd Map
curl -H 'Accept: application/vnd.github.v3.raw' -o hereTileLayers.js https://api.github.com/repos/gis-ops/dbscan-clustering/contents/src/Map/hereTileLayers.js
```

And to help you keep track of things, this is your new file structure:

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

To see your map in action simply execute `npm start`.

### Creating our initial redux state

#In our map component you will have noticed that we are declaring a constant `mapStateToProps` which is used in the `react-redux connect` function which helps us inject the state into a specific component.

Our control center of this app will be a little widget with options to fetch different points of interest from HERE Maps and run the DBScan clustering algorithm.
To keep a good overview of our state in this tutorial we will add one state object to our redux store; its state will be controlled by several actions originating from our control component.

Lets go ahead and

- create a empty file `actions.js` in the `actions` folder and
- a file `index.js` in the reducers folder holding our state object for the controls

The constant `initialPlacesState` is the initial state object which is initially loaded and later changed depending on the specific action made by the user from the control pane.

### reducers/index.js

```javascript
import { combineReducers } from 'redux'

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
    default:
      return state
  }
}

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

### Control.jsx

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
  11: { name: 'petrol-station' },
  12: { name: 'restaurant', color: 'grey' },
  13: { name: 'snacks-fast-food', color: 'black' },
  14: { name: 'sights-museums', color: 'red' },
  16: { name: 'toilet-rest-area', color: 'yellow' },
  17: { name: 'transport', color: 'olive' }
}

// we will use some functional react components to keep it simple
const CustomLabel = ({ content, value }) => (
  <Popup content={content} trigger={<Label size="tiny">{value}</Label>} />
)
CustomLabel.propTypes = {
  content: PropTypes.string,
  value: PropTypes.string
}

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
    // coming directly from our redux state
    const { places } = this.props

    // another functional component which will be used multiple times
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

    // here we will loop through the herePlaces object above and add buttons!
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

// connecting this class to our react store!
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

1. We want to fire an action when a user clicks a button which..
2. Fires a request to the HERE Maps places API.
3. And displays there places on the map
4. Possibly you as a user want to clear the map again

Both are mapped to 2 actions, namely `fetchHerePlaces` and `clear` which are imported at the beginning of the file - which don't exist yet.
So let's open `actions.js` in the actions folder.

### actions/actions.js

This is probably the most tricky part to wrap your head around.
As outlined above the actions being called in `Control.jsx` are

- `fetchHerePlaces`
- `clear`

which you can all find within this piece of actions code.

The `fetchHerePlaces` action simply makes a call to HERE.

Please find more comprehensive details inline.

```javascript
// use these or add your own credentials
const hereAppCode = 'your_heremaps_app_code'
const hereAppId = 'your_heremaps_app_id'

export const RECEIVE_PLACES_RESULTS = 'RECEIVE_PLACES_RESULTS'
export const REQUEST_PLACES_RESULTS = 'REQUEST_PLACES_RESULTS'
export const CLEAR = 'CLEAR'

// this function takes care of the call to the HERE Maps API
export const fetchHerePlaces = payload => (dispatch, getState) => {
  // this simple dispatcher will make sure our loading icon spins ;-)
  dispatch(requestPlacesResults({ category: payload.category }))

  // here we have to access our state to retrieve the boundingbox of the map which will be reduced in the subsequent step
  const { boundingbox } = getState().placesControls

  // to learn more about the parameters use this link https://developer.here.com/documentation/places/topics/search-results-ranking.html
  const url = new URL(
    'https://places.demo.api.here.com/places/v1/discover/explore'
  )
  const params = {
    app_id: hereAppId,
    app_code: hereAppCode,
    in: boundingbox,
    size: 100,
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
Please open your `index.js` in the reducer folder and import these actions right at the beginning of the file

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

// as mentioned above we want to let our button know that it is fetching
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
        // of course we will want to save the boundingbox
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
You will now be able to click the buttons which should start and stop spinning.
If you open your network console you will also see that requests are being made and if you are using the redux developer tools you will see that your redux store has been reduced with places categories.
It should look something like this:

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

First of all import `UPDATE_BBOX` it in the head where are your other imported actions reside.
Then we will add a new simple case to our switch

```javascript

...

case UPDATE_BBOX:
  return {
    ...state,
    boundingbox: action.payload
  }

...
```

This will make our http calls to the HERE Maps places API sound and return data.
However, we will have to make sure that they are plotted on the map, so let's go back there.

### Map/Map.jsx

We will add a new function `componentDidUpdate()` which is part of every React component class which is able to listen if the state has updated, you will most likely seen this guy before.
Add this in the class itself.
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
  const { places, lastCall, lastCompute, dbscanSettings } = state.placesControls
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

## Step 4 - Settings for the user

We now want to provide a rich set of options for the user to control the input parameters for the isochrones.
Let's define some requirements in the now to be created `Settings.jsx` under `Controls`:

1. Select mode pedestrian or car
2. Turn HERE Maps traffic settings on & off for the car profile
3. The range type should be able to handle time or distance
4. We want to set our maximum reachability and the intervals

With some beautiful semantic UI components and and some further actions to adapt the settings we could come up with something that looks like this.
By the way, to keep this tutorial more or less legible, this component is quite large; this being said, usually I would recommend to break this component up into smaller parts.
Please read the inline comments to understand what is going on in the logic.

### Controls/Settings.jsx

```javascript
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Slider } from 'react-semantic-ui-range'
import { Label, Button, Divider } from 'semantic-ui-react'

// we need just one action in this component to update settings made
import { updateSettings } from '../actions/actions'

class Settings extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    controls: PropTypes.object.isRequired
  }

  // dispatches the action
  updateSettings() {
    const { controls, dispatch } = this.props

    dispatch(
      updateSettings({
        settings: controls.settings
      })
    )
  }

  // we are making settings directly in the controls.settings object which is being passed on to the updateSettings() function up top
  handleSettings(settingName, setting) {
    const { controls } = this.props

    controls.settings[settingName] = setting

    this.updateSettings()
  }

  // this looks complex but it isn't, we basically want to make sure the the interval settings maximum can never be greater than the range maximum
  alignRangeInterval() {
    const { controls } = this.props

    if (
      controls.settings.range.value < controls.settings.interval.value ||
      controls.settings.interval.value === ''
    ) {
      controls.settings.interval.value = controls.settings.range.value
    }

    controls.settings.interval.max = controls.settings.range.value
  }

  render() {
    const { controls } = this.props

    // depending on what the user selected we obviously want to show the correct units
    const rangetype =
      controls.settings.rangetype === 'time' ? ' minutes' : ' kilometers'

    // our settings which are needed for the range slider, read more here https://github.com/iozbeyli/react-semantic-ui-range
    const rangeSettings = {
      settings: {
        ...controls.settings.range,
        min: 1,
        step: 1,
        start: controls.settings.range.value,
        // when the slider is moved, we want to update our settings and make sure the maximums align
        onChange: value => {
          controls.settings.range.value = value

          this.alignRangeInterval()
          this.updateSettings()
        }
      }
    }
    // same as above, just for the interval slider this time
    const intervalSettings = {
      settings: {
        ...controls.settings.interval,
        min: 1,
        step: 1,
        start: controls.settings.interval.value,
        onChange: value => {
          controls.settings.interval.value = value
          this.updateSettings()
        }
      }
    }
    // we have different kinds of settings in here. The components should be quite self-explanatory. Whenever a button is clicked we call handleSettings() and this way pass on our setting through to our state.
    return (
      <div className="mt3">
        <Divider />
        <Label size="small">{'Mode of transport'}</Label>
        <div className="mt3">
          <Button.Group basic size="small">
            {Object.keys({ pedestrian: {}, car: {} }).map((key, i) => (
              <Button
                active={key === controls.settings.mode}
                key={i}
                mode={key}
                onClick={() => this.handleSettings('mode', key)}>
                {key}
              </Button>
            ))}
          </Button.Group>
          {controls.settings.mode === 'car' && (
            <div>
              <Divider />
              <Label size="small">{'Traffic'}</Label>
              <div className="mt3">
                <Button.Group basic size="small">
                  {Object.keys({ enabled: {}, disabled: {} }).map((key, i) => (
                    <Button
                      active={key === controls.settings.traffic}
                      key={i}
                      mode={key}
                      onClick={() => this.handleSettings('traffic', key)}>
                      {key}
                    </Button>
                  ))}
                </Button.Group>
              </div>
            </div>
          )}
        </div>
        <Divider />
        <Label size="small">{'Range type'}</Label>
        <div className="mt3">
          <Button.Group basic size="small">
            {Object.keys({ distance: {}, time: {} }).map((key, i) => (
              <Button
                active={key === controls.settings.rangetype}
                key={i}
                mode={key}
                onClick={() => this.handleSettings('rangetype', key)}>
                {key}
              </Button>
            ))}
          </Button.Group>
        </div>
        <Divider />
        <Label size="small">{'Maximum range'}</Label>
        <div className="mt3">
          <Slider
            discrete
            color="grey"
            value={controls.settings.range.value}
            inverted={false}
            settings={rangeSettings.settings}
          />
          <div className="mt2">
            <Label className="mt2" color="grey" size={'mini'}>
              {controls.settings.range.value + rangetype}
            </Label>
          </div>
        </div>
        <Divider />
        <Label size="small">{'Interval step'}</Label>
        <div className="mt3">
          <Slider
            discrete
            color="grey"
            value={controls.settings.interval.value}
            inverted={false}
            settings={intervalSettings.settings}
          />
          <div className="mt2">
            <Label className="mt2" color="grey" size={'mini'}>
              {controls.settings.interval.value + rangetype}
            </Label>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  const controls = state.isochronesControls
  return {
    controls
  }
}

export default connect(mapStateToProps)(Settings)
```

And as you can imagine, we have to now implement our action!

### actions.js

You probably get it by now;
First of all we will export this action for our reducer..

```javascript
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
```

and export it for our settings component to access:

```javascript
...

export const updateSettings = payload => ({
  type: UPDATE_SETTINGS,
  ...payload
})

...
```

Last but not least, we will update our reducer.

### reducers/index.js

Go ahead and add this snippet:

```javascript
...

case UPDATE_SETTINGS:
  return {
    ...state,
    settings: action.settings
  }

...
```

How easy? But please don't forget to import the action which by now should look something like this:

```javascript
import {
  UPDATE_TEXTINPUT,
  UPDATE_CENTER,
  REQUEST_GEOCODE_RESULTS,
  RECEIVE_GEOCODE_RESULTS,
  // new
  UPDATE_SETTINGS
} from '../actions/actions'
```

You probably are able to guess what comes next.
Import the settings component to our `Controls/Control.jsx` and call it, you decide where!

```javascript
import Settings from './Settings'
```

&

```javascript
...

<div className="mt2"><Settings /></div>

...
```

With everything in place, you should be able to see the settings component in action which are interactive and thus update the state when selecting them.

![Settings in action](https://user-images.githubusercontent.com/10322094/53686571-12ceb180-3d29-11e9-9f93-e3577198f6ca.png 'Settings in action')

## Step 5 - Calling the isochrones API and plotting the result on our map

We are almost there.
By now we can input an address and make some settings.
The next step is to query the HERE Maps API for some wonderful looking isochrones.
What now is missing is

- a button to call the isochrones and
- the action behind which ultimately holds some logic to plot the response on our map.

We will handle this logic in our control component:

### Control.jsx

First of all we should add some new `propTypes` to our component.

```javascript
//class Control extends React.Component {
...
  isochronesCenter: PropTypes.object,
  isFetchingIsochrones: PropTypes.bool.isRequired
...

```

Additionally we need to import a new action `fetchHereIsochrones` which yet has to be defined:

```javascript
...
import {
  updateTextInput,
  fetchHereGeocode,
  updateCenter,
  // new
  fetchHereIsochrones
} from "../actions/actions";
...

```

Obviously this action has to be called from a button, which has to be inserted directly beneath our Search component with a click listener bound to it.
Hence the render function of our controls will look something like this:

```javascript
...

render() {
  const {
    isFetching,
    userTextInput,
    results,
    // new
    settings,
    isFetchingIsochrones
  } = this.props;

  // new
  // if an address is selected we will return true to enable our button!
  const isResultSelected = () => {
    if (settings.isochronesCenter.lat && settings.isochronesCenter.lng) return false
    return true

  };

  return (
    <div>
      <Segment style={segmentStyle}>
        <div>
          <span>
            Isochrones powered by <strong>HERE Maps</strong>
          </span>
        </div>
        <Divider />
        <div className="flex justify-between items-center mt3">
          <Search
            onSearchChange={this.handleSearchChange}
            onResultSelect={this.handleResultSelect}
            type="text"
            fluid
            input={{ fluid: true }}
            loading={isFetching}
            className="flex-grow-1 mr2"
            results={results}
            value={userTextInput}
            placeholder="Find Address ..."
          />
          // new
          <Button
            circular
            loading={isFetchingIsochrones}
            disabled={isResultSelected()}
            color="purple"
            icon="globe"
            onClick={this.handleFetchIsochrones}
          />
        </div>
        <div className="mt2"><Settings /></div>
      </Segment>
    </div>
  );
}

```

And our button is calling `handleFetchIsochrones` which looks like:

```javascript
...

handleFetchIsochrones = () => {
  const { dispatch, settings} = this.props;

  if (settings.isochronesCenter.lat && settings.isochronesCenter.lng) {
    dispatch(
      fetchHereIsochrones({settings})
    );
  }
};

...

```

And finally don't forget to amend the missing state mappings..

```javascript
...

const mapStateToProps = state => {
  const userTextInput = state.isochronesControls.userInput
  const results = state.isochronesControls.geocodeResults
  const isFetching = state.isochronesControls.isFetching

  // new
  const settings = state.isochronesControls.settings
  // new
  const isFetchingIsochrones = state.isochronesControls.isFetchingIsochrones

  return {
    userTextInput,
    results,
    isFetching,
    // new
    settings,
    // new
    isFetchingIsochrones
  };
};

...

```

Clicking the button won't do much at the moment as the actions and reducers are missing.
Similarly to the geocode requests we implemented before, we are calling the HERE isochrones API.
Due to the amount of settings we have created one additional function to help us build the request which is named `processIsolineSettings`.
Read the inline comments for more information.

### actions/actions.js

We are exporting 2 new actions.

```javascript
...

export const RECEIVE_ISOCHRONES_RESULTS = 'RECEIVE_ISOCHRONES_RESULTS'
export const REQUEST_ISOCHRONES_RESULTS = 'REQUEST_ISOCHRONES_RESULTS'

...
```

```javascript
...

export const fetchHereIsochrones = payload => dispatch => {

  // we let the app know that we are calling the isochrones API
  dispatch(requestIsochronesResults())

  // we generate our GET parameters from the settigns
  const isolineParameters = processIsolineSettings(payload.settings)

  // as seen before :)
  let url = new URL(
      'https://isoline.route.api.here.com/routing/7.2/calculateisoline.json'
    ),
    params = {
      app_id: hereAppId,
      app_code: hereAppCode,
      ...isolineParameters
    }

  url.search = new URLSearchParams(params)

  return fetch(url)
    .then(response => response.json())
    .then(data =>
      dispatch(processIsochronesResponse(data))
    )
    .catch(error => console.error(error))
}


const parseIsochronesResponse = json => {
  if (json.response && json.response.isoline.length > 0) {
    const isolinesReversed = json.response.isoline.reverse()
    return isolinesReversed
  }
  return []
}

const processIsochronesResponse = (json) => dispatch => {
  // a small trick: we reverse the polygons that the largest comes first :-)
  const results = parseIsochronesResponse(json)

  // we have received our results
  dispatch(receiveIsochronesResults(results))
}


export const receiveIsochronesResults = results => ({
  type: RECEIVE_ISOCHRONES_RESULTS,
  results: results
})

const processIsolineSettings = (settings) => {
  let isolineParameters = {}

  // we prepare the GET parameters according to the HERE Maps Isochrones API docs
  isolineParameters.mode = `fastest;${settings.mode};traffic:${settings.traffic};`
  isolineParameters.rangetype = settings.rangetype

  isolineParameters.start = settings.isochronesCenter.lat + ',' + settings.isochronesCenter.lng

  // seconds
  const ranges = []
  if (settings.rangetype === 'time') {
    let rangeInSeconds = settings.range.value * 60
    const intervalInSeconds = settings.interval.value * 60

    // to generate ranges!
    while (rangeInSeconds > 0) {
      ranges.push(rangeInSeconds)
      rangeInSeconds -= intervalInSeconds
    }

    isolineParameters.range = ranges.join(',')

  // meters
  } else if (settings.rangetype === 'distance') {
    let rangeInMeters = settings.range.value * 1000
    const intervalInMeters = settings.interval.value * 1000

    // to generate ranges!
    while (rangeInMeters > 0) {
      ranges.push(rangeInMeters)
      rangeInMeters -= intervalInMeters
    }

    isolineParameters.range = ranges.join(',')
  }
  return isolineParameters
}

export const requestIsochronesResults = () => ({
  type: REQUEST_ISOCHRONES_RESULTS
})

...
```

To be reduced:

### reducers/index.js

Import the actions:

```javascript

import {
  UPDATE_TEXTINPUT,
  UPDATE_CENTER,
  REQUEST_GEOCODE_RESULTS,
  RECEIVE_GEOCODE_RESULTS,
  UPDATE_SETTINGS,
  // new
  REQUEST_ISOCHRONES_RESULTS,
  // new
  RECEIVE_ISOCHRONES_RESULTS,
} from "../actions/actions"

...
```

And add your reduce cases:

```javascript

...

case REQUEST_ISOCHRONES_RESULTS:
  return {
    ...state,
    isFetchingIsochrones: true

  }
case RECEIVE_ISOCHRONES_RESULTS:
  return {
    ...state,
    isFetchingIsochrones: false,
    isochrones: {
      results: action.results
    }
  }

...

```

Drum roll...

Firing requests now works, so we now merely have to make our map listen to changes in our redux store which will be updated once a response is returned by HERE Maps.

### Map.jsx

Ok, so whenever isochrone results are returned we want to update the map.
With a handy function every react component can use we can let the map know when the state is updated.
Let's add this to our map component class.

```javascript

// class Map extends React.Component {
...
  componentDidUpdate() {
    this.addIsochronesCenter();
    this.addIsochrones();
  }
...
```

This is obviously calling 2 additional functions.
The first adds a marker to the map... which looks something like this:

```javascript
...

// class Map extends React.Component {
  addIsochronesCenter() {

    // clear the markers layer beforehand
    markersLayer.clearLayers();

    const isochronesCenter = this.props.isochronesControls.settings
      .isochronesCenter;

    // does this object contain a latitude and longitude?
    if (isochronesCenter.lat && isochronesCenter.lng) {
      // we are creating a leaflet circle marker with a minimal tooltip
      L.circleMarker(isochronesCenter)
        .addTo(markersLayer)
        .bindTooltip(
          "latitude: " +
            isochronesCenter.lat +
            ", " +
            "longitude: " +
            isochronesCenter.lng,
          {
            permanent: false
          }
        )
        .openTooltip();

      // set the map view
      this.map.setView(isochronesCenter, 7);
    }
  }

...

```

...and the second handles the visualization of isochrones.
This method uses chromajs which yet has to be imported with `import chroma from 'chroma-js'`.

```javascript
...
// class Map extends React.Component {
  addIsochrones() {

    isochronesLayer.clearLayers();

    const isochrones = this.props.isochronesControls.isochrones.results;

    // if we have polygons in our response
    if (isochrones.length > 0) {
      let cnt = 0;

      // let's define a beautiful color range
      const scaleHsl = chroma
        .scale(["#f44242", "#f4be41", "#41f497"])
        .mode("hsl")
        .colors(isochrones.length);

      // looping through all polygons and adding them to the map
      for (const isochrone of isochrones) {
        for (const isochroneComponent of isochrone.component) {
          L.polygon(
            isochroneComponent.shape.map(function(coordString) {
              return coordString.split(",");
            }),
            {
              fillColor: scaleHsl[cnt],
              weight: 2,
              opacity: 1,
              color: "white",
              pane: "isochronesPane"
            }
          ).addTo(isochronesLayer);
        }
        cnt += 1;
      }

      this.map.fitBounds(isochronesLayer.getBounds())
    }
  }
...

```

### Wrap-up

At this point you have managed to build a simple web-app based on react, redux and leaflet which fetches and consumes isochrones from HERE Maps. Congratulations!!

As you may have already gathered from the documentation, the HERE Maps Isochrones API is fairly feature rich and we haven't implemented all of the possible options and features yet.
To this end, if you are interested to enhance the code we built together in this tutorial with new features you might want to have a look at [https://gis-ops.github.io/reachability-analysis](https://gis-ops.github.io/reachability-analysis) which is using the code of this tutorial as a skeleton and building additional options on top.

If you have ideas how to improve this tutorial or in case something didn't work as you expected please feel free to leave some lovely feedback on our [GitHub](https://github.com/gis-ops/tutorials/issues/new).

Thanks for working through this tutorial - your GIS-OPS team.

![HERE Isochrones in Iceland](https://user-images.githubusercontent.com/10322094/53686593-49a4c780-3d29-11e9-963d-53896fd8aa54.png 'HERE Isochrones in Iceland')

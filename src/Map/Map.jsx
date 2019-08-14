import React from 'react'
import { connect } from 'react-redux'
import L from 'leaflet'
import PropTypes from 'prop-types'
import { concave, polygon, multiPoint, featureCollection } from '@turf/turf'
import { doUpdateBoundingBox } from '../actions/actions'
import { makeClusterObjects, computeDbScan, prepareGeojson } from './utils'
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
  static propTypes = {
    lastCall: PropTypes.number,
    lastCompute: PropTypes.number,
    dbscanSettings: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    places: PropTypes.object
  }

  // and once the component has mounted we add everything to it
  componentDidMount() {
    // our map!
    const { dispatch } = this.props

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

    L.control.layers(baseMaps, overlayMaps).addTo(this.map)

    // we do want a zoom control
    L.control
      .zoom({
        position: 'topright'
      })
      .addTo(this.map)

    //and for the sake of advertising your company, you may add a logo to the map
    const brand = L.control({
      position: 'bottomright'
    })
    brand.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'brand')
      div.innerHTML =
        '<a href="https://gis.ops.com" target="_blank"><div class="gis-ops-logo"></a>'
      return div
    }
    const hereLogo = L.control({
      position: 'bottomright'
    })
    hereLogo.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'brand')
      div.innerHTML =
        '<a href="https://developer.here.com/" target="_blank"><div class="here-logo"></div></a>'
      return div
    }
    this.map.addControl(brand)
    this.map.addControl(hereLogo)

    this.map.on('moveend', () => {
      dispatch(doUpdateBoundingBox(this.map.getBounds()))
    })

    dispatch(doUpdateBoundingBox(this.map.getBounds()))
  }

  processClusters(clusterData) {
    const clustersNoiseEdges = makeClusterObjects(clusterData)

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
      } else {
        geojson = multiPoint(clustersNoiseEdges[clusterObj], {
          type: clusterObj
        })
      }

      prepareGeojson(geojson, clusterSize, clusterObj).addTo(clusterLayer)
    }
  }

  componentDidUpdate(prevProps) {
    const { lastCall, lastCompute, dbscanSettings } = this.props
    if (lastCall > prevProps.lastCall) {
      this.addPlaces()
    }

    if (lastCompute > prevProps.lastCompute) {
      clusterLayer.clearLayers()
      const clusters = computeDbScan(placesLayer.toGeoJSON(), dbscanSettings)
      this.processClusters(clusters)
    }
  }

  addPlaces() {
    placesLayer.clearLayers()

    const { places } = this.props
    let cnt = 0
    for (const place in places) {
      if (
        places[place].hasOwnProperty('data') &&
        places[place].data.length > 0
      ) {
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

  render() {
    return <div id="map" style={style} />
  }
}

const mapStateToProps = state => {
  const { places, lastCall, lastCompute, dbscanSettings } = state.placesControls
  return {
    places,
    lastCall,
    lastCompute,
    dbscanSettings
  }
}

export default connect(mapStateToProps)(Map)

import { clustersDbscan, point } from '@turf/turf'
import L from 'leaflet'

export const computeDbScan = (pointsGeojson, dbscanSettings) => {
  const maxDistance = dbscanSettings.maxDistance / 1000
  const minPoints = dbscanSettings.minPoints
  const clustered = clustersDbscan(pointsGeojson, maxDistance, {
    minPoints: minPoints
  })

  return clustered
}

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

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Slider } from 'react-semantic-ui-range'
import { SemanticToastContainer, toast } from 'react-semantic-toasts'

import {
  Segment,
  Divider,
  Button,
  Header,
  Label,
  Popup
} from 'semantic-ui-react'

import {
  fetchHerePlaces,
  updateDbScanSettings,
  computeDbScan,
  clear
} from '../actions/actions'

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
CustomSlider.propTypes = {
  name: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  start: PropTypes.number,
  value: PropTypes.number,
  dispatch: PropTypes.func
}

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
    dbscanSettings: PropTypes.object,
    boundingbox: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    message: PropTypes.object
  }

  handleClick = (event, data) => {
    const { dispatch } = this.props
    dispatch(fetchHerePlaces({ category: data.name, color: data.color }))
  }

  handleClickDbscan = () => {
    const { dispatch } = this.props
    dispatch(computeDbScan())
  }

  handleClickClear = () => {
    const { dispatch } = this.props
    dispatch(clear())
  }
  componentDidUpdate = prevProps => {
    const { message } = this.props

    if (message.receivedAt > prevProps.message.receivedAt) {
      toast({
        type: message.type,
        icon: message.icon,
        title: message.topic,
        description: message.description,
        time: 5000
      })
    }
  }

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
    const { places, dbscanSettings, dispatch } = this.props
    const CustomButton = ({
      content,
      circular,
      popupContent,
      handler,
      name,
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
            name={name}
            size={size}
            onClick={handler}
            basic={basic}
            disabled={disabled}
            icon={icon}
          />
        }
      />
    )

    return (
      <div>
        <Segment style={segmentStyle}>
          <div>
            <span>
              <Header as="h4">DBScan with HERE Maps places and TurfJS</Header>
              <p>
                Density-based spatial clustering of applications with noise (
                <a
                  href="https://en.wikipedia.org/wiki/DBSCAN"
                  rel="noopener noreferrer"
                  target="_blank">
                  DBScan
                </a>
                ) is a data clustering algorithm. Given a set of points in some
                space, it groups together points that are closely packed
                together (points with many nearby neighbors), marking as
                outliers points that lie alone in low-density regions (whose
                nearest neighbors are too far away).
              </p>
              <p>
                This application consumes{' '}
                <a
                  href="https://developer.here.com/api-explorer/rest/places"
                  target="_blank"
                  rel="noopener noreferrer">
                  HERE Maps places API
                </a>{' '}
                for given categories as point input for the clustering algorithm
                which is implemented in
                <a
                  href="https://turfjs.org/docs/#clustersDbscan"
                  target="_blank"
                  rel="noopener noreferrer">
                  TurfJS
                </a>
                .
              </p>
            </span>
          </div>
          <Header as="h5">DBScan settings</Header>
          <div className="flex flex-row">
            <div className="w-80">
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
                max={50}
                step={1}
                start={dbscanSettings.minPoints}
                value={dbscanSettings.minPoints}
                dispatch={dispatch}
              />

              <div className="mt2">
                <CustomLabel
                  value={'Min. points: ' + dbscanSettings.minPoints}
                  content={
                    "Minimum number of points to generate a single cluster, points which do not meet this requirement will be classified as an 'edge' or 'noise'."
                  }
                />
              </div>
            </div>
            <div className="w-20">
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
          <div>
            {Object.keys(herePlaces).map((key, index) => {
              let content = herePlaces[key].name
              if (places[herePlaces[key].name]) {
                if (
                  !places[herePlaces[key].name].disabled &&
                  places[herePlaces[key].name].next
                ) {
                  content = 'fetch more..'
                }
              }
              return (
                <div key={index} className="mt1 dib">
                  <CustomButton
                    icon={false}
                    popupContent={'Fetch places of this category'}
                    content={content}
                    name={herePlaces[key].name}
                    handler={this.handleClick}
                    color={herePlaces[key].color}
                    disabled={
                      places[herePlaces[key].name]
                        ? places[herePlaces[key].name].disabled
                        : false
                    }
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
        <SemanticToastContainer position="bottom-center" />
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { places, dbscanSettings, boundingbox, message } = state.placesControls
  return {
    places,
    boundingbox,
    dbscanSettings,
    message
  }
}

export default connect(mapStateToProps)(Control)

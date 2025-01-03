import React, { Component } from 'react';
import { string, shape, number, object } from 'prop-types';
import mapboxgl from 'mapbox-gl';
import MultiTouch from 'mapbox-gl-multitouch';
import uniqueId from 'lodash/uniqueId';
import { circlePolyline } from '../../util/maps';

const mapMarker = () => {
  return new mapboxgl.Marker();
};

const circleLayer = (center, mapsConfig, layerId) => {
  const path = circlePolyline(center, mapsConfig.fuzzy.offset).map(([lat, lng]) => [lng, lat]);
  return {
    id: layerId,
    type: 'fill',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [path],
        },
      },
    },
    paint: {
      'fill-color': mapsConfig.fuzzy.circleColor,
      'fill-opacity': 0.2,
    },
  };
};

const generateFuzzyLayerId = () => {
  return uniqueId('fuzzy_layer_');
};

class DynamicMapboxMap extends Component {
  constructor(props) {
    super(props);

    this.mapContainer = null;
    this.map = null;
    this.centerMarker = null;
    this.fuzzyLayerId = generateFuzzyLayerId();

    this.updateFuzzyCirclelayer = this.updateFuzzyCirclelayer.bind(this);
  }

  componentDidMount() {
    const { center, zoom, mapsConfig } = this.props;
    const position = [center.lng, center.lat];

    // Set your Mapbox access token here
    mapboxgl.accessToken = 'your-mapbox-token-here';

    // Initialize the map
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v10',
      center: position,
      zoom,
      scrollZoom: false,
    });
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
    this.map.addControl(new MultiTouch());

    if (mapsConfig.fuzzy.enabled) {
      this.map.on('load', () => {
        this.map.addLayer(circleLayer(center, mapsConfig, this.fuzzyLayerId));
      });
    } else {
      this.centerMarker = mapMarker();
      this.centerMarker.setLngLat(position).addTo(this.map);
    }
  }

  componentWillUnmount() {
    if (this.map) {
      this.centerMarker = null;
      this.map.remove();
      this.map = null;
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.map) {
      return;
    }

    const { center, zoom, mapsConfig } = this.props;
    const { lat, lng } = center;
    const position = [lng, lat];

    if (zoom !== prevProps.zoom) {
      this.map.setZoom(this.props.zoom);
    }

    const centerChanged = lat !== prevProps.center.lat || lng !== prevProps.center.lng;

    if (this.centerMarker && centerChanged) {
      this.centerMarker.setLngLat(position);
      this.map.setCenter(position);
    }

    if (mapsConfig.fuzzy.enabled && centerChanged) {
      if (this.map.loaded()) {
        this.updateFuzzyCirclelayer();
      } else {
        this.map.on('load', this.updateFuzzyCirclelayer);
      }
    }
  }

  updateFuzzyCirclelayer() {
    if (!this.map) {
      return;
    }
    const { center, mapsConfig } = this.props;
    const { lat, lng } = center;
    const position = [lng, lat];

    this.map.removeLayer(this.fuzzyLayerId);

    this.fuzzyLayerId = generateFuzzyLayerId();
    this.map.addLayer(circleLayer(center, mapsConfig, this.fuzzyLayerId));

    this.map.setCenter(position);
  }

  render() {
    const { containerClassName, mapClassName } = this.props;
    return (
      <div className={containerClassName}>
        <div className={mapClassName} ref={el => (this.mapContainer = el)} />
      </div>
    );
  }
}

DynamicMapboxMap.defaultProps = {
  address: '',
  center: null,
};

DynamicMapboxMap.propTypes = {
  address: string,
  center: shape({
    lat: number.isRequired,
    lng: number.isRequired,
  }).isRequired,
  zoom: number.isRequired,
  mapsConfig: object.isRequired,
};

export default DynamicMapboxMap;

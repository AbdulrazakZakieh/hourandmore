import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; 
import classNames from 'classnames';
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';

// Import shared components
import { H3, ListingLink } from '../../../../components';
import EditListingLocationForm from './EditListingLocationForm';
import css from './EditListingLocationPanel.module.css';
import MapboxLocationSelector from '../../../../components/Map/MapboxLocationSelector';

const getInitialValues = props => {
  const { listing } = props;
  const { geolocation, publicData } = listing?.attributes || {};

  const locationFieldsPresent = publicData?.location?.address && geolocation;
  const location = publicData?.location || {}; // Fallback to an empty object if location is missing
  const { address, building } = location;

  // Fallback if geolocation or address is not present
  return {
    building,
    location: locationFieldsPresent
      ? {
          search: address,
          selectedPlace: { address, origin: geolocation },
        }
      : null,
  };
};



const EditListingLocationPanel = (props) => {
  const [state, setState] = useState({ initialValues: getInitialValues(props) });
  const { 
    className, rootClassName, listing, disabled, ready, onSubmit, submitButtonText, 
    panelUpdated, updateInProgress, errors 
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes.state !== LISTING_STATE_DRAFT;

  const handleLocationChange = (newLocation) => {
    console.log('Location selected from map:', newLocation);
  
    // Update state with the new location
    setState((prevState) => {
      // Prepare the new location structure based on the map selection
      const updatedLocation = {
        search: newLocation.address,  // Set the address selected from the map
        selectedPlace: {
          address: newLocation.address,
          origin: {
            lat: newLocation.lat,  // Set the latitude from the map
            lng: newLocation.lng,  // Set the longitude from the map
          },
        },
      };
  
      return {
        ...prevState,  // Preserve the rest of the state
        initialValues: {
          ...prevState.initialValues,
          location: updatedLocation,  // Update the location field
        },
      };
    });
  };
  

  const handleFormSubmit = (updateValues) => {
    const { location } = updateValues;
    const { address, origin } = location.selectedPlace;

    // New values for listing attributes
    const finalUpdateValues = {
      geolocation: origin,
      publicData: {
        location: {
          address,
          building: updateValues.building,
        },
      },
    };
    setState({
      initialValues: {
        building: updateValues.building,
        location: { search: address, selectedPlace: { address, origin } },
      },
    });
  
    // Submit the final updated values
    onSubmit(finalUpdateValues);
  };
  console.log("State Initial Values: ", state.initialValues);
  return (
    <div className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingLocationPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingLocationPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>

      {/* Pass onLocationChange prop to MapboxLocationSelector */}
      <MapboxLocationSelector onLocationChange={handleLocationChange} />

      <EditListingLocationForm
        className={css.form}
        initialValues={state.initialValues || {}}
        onSubmit={handleFormSubmit}
        saveActionMsg={submitButtonText}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
        autoFocus
        onLocationChange={handleLocationChange}  // Pass onLocationChange prop to EditListingLocationForm
      />
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingLocationPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};


EditListingLocationPanel.propTypes = {
  className: PropTypes.string,
  rootClassName: PropTypes.string,
  listing: PropTypes.object,
  disabled: PropTypes.bool.isRequired,
  ready: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  panelUpdated: PropTypes.bool.isRequired,
  updateInProgress: PropTypes.bool.isRequired,
  errors: PropTypes.object,
};

export default EditListingLocationPanel;

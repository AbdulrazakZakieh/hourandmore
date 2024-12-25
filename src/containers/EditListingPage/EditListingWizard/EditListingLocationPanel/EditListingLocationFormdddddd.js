import React, { Component } from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
} from '../../../../util/validators';

// Import shared components
import {
  FieldLocationAutocompleteInput,
  Button,
  FieldTextInput,
} from '../../../../components';

// Import the DynamicMapboxMap component
import DynamicMapboxMap from '../../../../components/Map/DynamicMapboxMap2';

// Import modules from this directory
import css from './EditListingLocationForm.module.css';

const identity = v => v;

class EditListingLocationFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: { lat: 0, lng: 0 }, // Initialize with a default location
    };
  }

  // Handler for when the location is selected from the autocomplete
  handleLocationChange = location => {
    if (location && location.latitude && location.longitude) {
      this.setState({
        center: { lat: location.latitude, lng: location.longitude },
      });
    }
  };

  render() {
    const {
      formId,
      autoFocus,
      className,
      disabled,
      ready,
      handleSubmit, // Ensure handleSubmit is passed from the parent
      intl,
      invalid,
      pristine,
      saveActionMsg,
      updated,
      updateInProgress,
      fetchErrors,
      values = {},  // Default to an empty object to avoid undefined errors
    } = this.props;

    const { center } = this.state;

    const addressRequiredMessage = intl.formatMessage({
      id: 'EditListingLocationForm.addressRequired',
    });
    const addressNotRecognizedMessage = intl.formatMessage({
      id: 'EditListingLocationForm.addressNotRecognized',
    });

    const optionalText = intl.formatMessage({
      id: 'EditListingLocationForm.optionalText',
    });

    const { updateListingError, showListingsError } = fetchErrors || {};

    const classes = classNames(css.root, className);
    const submitReady = (updated && pristine) || ready;
    const submitInProgress = updateInProgress;
    const submitDisabled = invalid || disabled || submitInProgress;

    return (
      <FinalForm
        className={classes}
        onSubmit={handleSubmit} // Pass onSubmit handler here
      >
        {updateListingError ? (
          <p className={css.error}>
            <FormattedMessage id="EditListingLocationForm.updateFailed" />
          </p>
        ) : null}

        {showListingsError ? (
          <p className={css.error}>
            <FormattedMessage id="EditListingLocationForm.showListingFailed" />
          </p>
        ) : null}

        <FieldLocationAutocompleteInput
          rootClassName={css.locationAddress}
          inputClassName={css.locationAutocompleteInput}
          iconClassName={css.locationAutocompleteInputIcon}
          predictionsClassName={css.predictionsRoot}
          validClassName={css.validLocation}
          autoFocus={autoFocus}
          name="location"
          label={intl.formatMessage({ id: 'EditListingLocationForm.address' })}
          placeholder={intl.formatMessage({
            id: 'EditListingLocationForm.addressPlaceholder',
          })}
          useDefaultPredictions={false}
          format={identity}
          valueFromForm={values.location || ''} // Safely access values.location
          validate={composeValidators(
            autocompleteSearchRequired(addressRequiredMessage),
            autocompletePlaceSelected(addressNotRecognizedMessage)
          )}
          onPlaceSelected={this.handleLocationChange} // Update the map center when a location is selected
        />

        <DynamicMapboxMap
          center={center}
          zoom={12} // Set the desired zoom level
          mapsConfig={{ fuzzy: { enabled: false } }} // Example config, update as needed
          containerClassName={css.mapContainer}
          mapClassName={css.map}
        />

        <FieldTextInput
          className={css.building}
          type="text"
          name="building"
          id={`${formId}building`}
          label={intl.formatMessage({ id: 'EditListingLocationForm.building' }, { optionalText })}
          placeholder={intl.formatMessage({
            id: 'EditListingLocationForm.buildingPlaceholder',
          })}
        />

        <Button
          className={css.submitButton}
          type="submit"
          inProgress={submitInProgress}
          disabled={submitDisabled}
          ready={submitReady}
        >
          {saveActionMsg}
        </Button>
      </FinalForm>
    );
  }
}

EditListingLocationFormComponent.defaultProps = {
  selectedPlace: null,
  fetchErrors: null,
  formId: 'EditListingLocationForm',
};

EditListingLocationFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired, // Ensure that onSubmit is passed correctly
  saveActionMsg: string.isRequired,
  selectedPlace: propTypes.place,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

export default compose(injectIntl)(EditListingLocationFormComponent);

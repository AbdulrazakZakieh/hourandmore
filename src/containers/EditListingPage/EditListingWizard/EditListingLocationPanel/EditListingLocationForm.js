import React, { useState } from 'react';
import { bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';

// Import shared components
import {
  Form,
  FieldLocationAutocompleteInput,
  Button,
  FieldTextInput,
} from '../../../../components';

// Import styles
import css from './EditListingLocationForm.module.css';

const identity = v => v;

export const EditListingLocationFormComponent = props => {
  const [locationData, setLocationData] = useState({
    address: '',
    lat: null,
    lng: null,
    fromMap: false, // Track if the address was selected from the map
  });

  const {
    formId,
    autoFocus,
    className,
    disabled,
    ready,
    handleSubmit,
    intl,
    invalid,
    pristine,
    saveActionMsg,
    updated,
    updateInProgress,
    fetchErrors,
    values,
    onLocationChange,
  } = props;

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

  // Define handleLocationChange locally
  const handleLocationChange = (location) => {
    setLocationData({
      address: location.address, // Only send the necessary data      
      fromMap: true,
    });
    onLocationChange(location);
  };

  const validateLocation = (value) => {
    // Ensure that 'value' is a string before applying trim
    if (typeof value !== 'string' || value.trim() === '') {
      return addressRequiredMessage;
    }
    return undefined; // No error if the value is valid
  };
  

  return (
    <FinalForm
      {...props}
      render={formRenderProps => {
        const {
          formId,
          autoFocus,
          className,
          disabled,
          ready,
          handleSubmit,
          intl,
          invalid,
          pristine,
          saveActionMsg,
          updated,
          updateInProgress,
          fetchErrors,
          values,
        } = formRenderProps;

        return (
          <Form className={classes} onSubmit={handleSubmit}>
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
              valueFromForm={locationData.address || values.location || ""} // Ensure correct value is passed
              onChange={handleLocationChange} // Trigger debounced location change
              onBlur={() => handleLocationChange(locationData)} // Use blur to finalize map selection
              validate={''} // Use validation
              readOnly={locationData.fromMap} // Disable typing when the location is from the map
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
              value={values.building || ""}
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
          </Form>
        );
      }}
    />
  );
};

EditListingLocationFormComponent.defaultProps = {
  selectedPlace: null,
  fetchErrors: null,
  formId: 'EditListingLocationForm',
};

EditListingLocationFormComponent.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
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
  onLocationChange: func.isRequired, // Add this prop for updating location in the parent component
};

export default compose(injectIntl)(EditListingLocationFormComponent);

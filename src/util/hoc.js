import React from 'react';
import { renderComponent, branch, withProps } from 'recompose';
import R from 'ramda';

const Spinner = () =>
  <div className="spinner-container">
    <div className="spinner">
      <div className="bounce1" />
      <div className="bounce2" />
      <div className="bounce3" />
    </div>
  </div>;

export const spinnerWhileLoading = isLoading =>
  branch(isLoading, renderComponent(Spinner));

const Error = ({ errorMessage }) =>
  <div>
    <h4>{errorMessage}</h4>
  </div>;

export const handleError = mapPropsToErrorMessage =>
  branch(
    props => !!mapPropsToErrorMessage(props),
    R.compose(
      withProps(props => ({ errorMessage: mapPropsToErrorMessage(props) })),
      renderComponent(Error)
    )
  );

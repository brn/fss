/**
 * @fileOverview
 * @name index.tsx
 * @author Taketoshi Aono
 * @license
 */

import React from 'react';
import { render } from 'react-dom';
import { FileStorageService } from './components/ecosystem/FileStorageService';
import { Provider } from 'react-redux';
import reducers from './reducers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

render(
  <Provider store={createStore(reducers, applyMiddleware(thunk))}>
    <FileStorageService />
  </Provider>,
  document.querySelector('#app'),
);

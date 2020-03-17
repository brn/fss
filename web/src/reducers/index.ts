/**
 * @fileOverview
 * @name index.ts<reducers>
 * @author Taketoshi Aono
 * @license
 */

import { combineReducers } from 'redux';
import { fileStorage } from './fileStorage';

export default combineReducers({ fileStorage });

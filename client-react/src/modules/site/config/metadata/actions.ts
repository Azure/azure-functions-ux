import { createStandardAction } from 'typesafe-actions';

import { ArmObj } from '../../../../models/WebAppModels';
import {
  METADATA_FETCH_FAILURE,
  METADATA_FETCH_REQUEST,
  METADATA_FETCH_SUCCESS,
  METADATA_UPDATE_FAILURE,
  METADATA_UPDATE_REQUEST,
  METADATA_UPDATE_SUCCESS,
} from './actionTypes';
import { Metadata } from './reducer';

export const fetchMetadataRequest = createStandardAction(METADATA_FETCH_REQUEST)();
export const fetchMetadataSuccess = createStandardAction(METADATA_FETCH_SUCCESS).map((metadata: ArmObj<Metadata>) => ({
  metadata,
}));
export const fetchMetadataFailure = createStandardAction(METADATA_FETCH_FAILURE).map((error: Error) => ({
  error,
}));

export const updateMetadataRequest = createStandardAction(METADATA_UPDATE_REQUEST).map((metadata: ArmObj<Metadata>) => ({
  metadata,
}));
export const updateMetadataSuccess = createStandardAction(METADATA_UPDATE_SUCCESS).map((metadata: ArmObj<Metadata>) => ({
  metadata,
}));
export const updateMetadataFailure = createStandardAction(METADATA_UPDATE_FAILURE).map((error: Error) => ({
  error,
}));

import React from 'react';
import { FunctionAppEditMode } from './models/portal-models';
import { ArmObj } from './models/arm-obj';
import { Site } from './models/site/site';

export class SiteCommunicator {
  private static _stopped: boolean;
  private static _siteAppEditState: FunctionAppEditMode;
  private static _site: ArmObj<Site> | undefined;

  public constructor() {
    SiteCommunicator._stopped = false;
    SiteCommunicator._siteAppEditState = FunctionAppEditMode.ReadWrite;
    SiteCommunicator._site = undefined;
  }

  public setSite(site: ArmObj<Site>) {
    SiteCommunicator._site = site;
  }

  public getSite() {
    return SiteCommunicator._site;
  }

  public setSiteStopped(stopped: boolean) {
    SiteCommunicator._stopped = stopped;
  }

  public isSiteStopped() {
    return SiteCommunicator._stopped;
  }

  public setSiteAppEditState(state: FunctionAppEditMode) {
    SiteCommunicator._siteAppEditState = state;
  }

  public getSiteAppEditState() {
    return SiteCommunicator._siteAppEditState;
  }
}

export const SiteCommunicatorContext = React.createContext<SiteCommunicator>(new SiteCommunicator());

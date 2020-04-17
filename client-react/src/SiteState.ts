import React from 'react';
import { FunctionAppEditMode } from './models/portal-models';
import { ArmObj } from './models/arm-obj';
import { Site } from './models/site/site';

export class SiteState {
  private static _stopped: boolean;
  private static _siteAppEditState: FunctionAppEditMode;
  private static _site: ArmObj<Site> | undefined;

  public constructor() {
    SiteState._stopped = false;
    SiteState._siteAppEditState = FunctionAppEditMode.ReadWrite;
    SiteState._site = undefined;
  }

  public setSite(site: ArmObj<Site>) {
    SiteState._site = site;
  }

  public getSite() {
    return SiteState._site;
  }

  public setSiteStopped(stopped: boolean) {
    SiteState._stopped = stopped;
  }

  public isSiteStopped() {
    return SiteState._stopped;
  }

  public setSiteAppEditState(state: FunctionAppEditMode) {
    SiteState._siteAppEditState = state;
  }

  public getSiteAppEditState() {
    return SiteState._siteAppEditState;
  }
}

export const SiteStateContext = React.createContext<SiteState>(new SiteState());

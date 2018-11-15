import { updateCurrentSiteWebConfig, updateCurrentSiteWebConfigNoCache } from './actions';
import { checkCacheValid } from 'redux-cache';
import axios from 'axios';
import { SiteConfig, ArmObj, VirtualApplication } from '../../../../models/WebAppModels';
import { fetchMetadata, updateMetadata } from '../metadata/thunks';
import IState from '../../../types';

export function fetchConfig() {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    if (!startupInfo) {
      return null;
    }
    const armToken = startupInfo.token;
    const armEndpoint = startupInfo.armEndpoint;
    const resourceId = `${startupInfo.resourceId}/config/web`;
    const currentWebconfig = getState().webConfig.config;
    const isCacheValid = checkCacheValid(getState, 'webConfig');
    if (isCacheValid && resourceId === currentWebconfig.id) {
      return currentWebconfig;
    }
    dispatch(updateCurrentSiteWebConfigNoCache({ loading: true }));
    const configFetch = axios.get(`${armEndpoint}${resourceId}?api-version=2016-03-01`, {
      headers: {
        Authorization: `Bearer ${armToken}`,
      },
    });
    const metadataFetch = dispatch(fetchMetadata());
    const [configRes, metadata] = await Promise.all([configFetch, metadataFetch]);
    const configResult = configRes.data;
    const currentlySelectedStack = getCurrentStackString(configResult, metadata);

    dispatch(
      updateCurrentSiteWebConfig({
        currentlySelectedStack,
        virtualApplications: flattenVirtualApplicationsList(configResult.properties.virtualApplications),
        loading: false,
        config: configResult,
      })
    );
    return configResult;
  };
}

export function updateConfig(value: ArmObj<SiteConfig>, currentlySelectedStack: string, virtualApplications?: VirtualApplication[]) {
  return async (dispatch: any, getState: () => IState) => {
    const startupInfo = getState().portalService.startupInfo;
    const armToken = startupInfo!.token;
    const armEndpoint = startupInfo!.armEndpoint;
    dispatch(updateCurrentSiteWebConfigNoCache({ currentlySelectedStack, saving: true }));
    try {
      if (virtualApplications) {
        value.properties.virtualApplications = unFlattenVirtualApplicationsList(virtualApplications);
      }
      const { metadata } = getState().metadata;
      if (
        metadata &&
        metadata.properties &&
        metadata.properties.CURRENT_STACK !== currentlySelectedStack &&
        currentlySelectedStack !== 'java'
      ) {
        metadata.properties.CURRENT_STACK = currentlySelectedStack;
        await dispatch(updateMetadata(metadata));
      }
      const siteUpdate = await axios.put<ArmObj<SiteConfig>>(
        `${armEndpoint}${startupInfo!.resourceId}/config/web?api-version=2016-03-01`,
        setStackData(currentlySelectedStack, value),
        {
          headers: {
            Authorization: `Bearer ${armToken}`,
          },
        }
      );
      const configResult = siteUpdate.data;
      dispatch(
        updateCurrentSiteWebConfig({
          virtualApplications: flattenVirtualApplicationsList(configResult.properties.virtualApplications),
          saving: true,
          config: configResult,
        })
      );
    } catch (err) {
      dispatch(
        updateCurrentSiteWebConfig({
          saving: false,
        })
      );
    }
  };
}

function unFlattenVirtualApplicationsList(virtualApps: VirtualApplication[]) {
  if (!virtualApps) {
    return [];
  }
  const virtualApplications = virtualApps.filter(x => !x.virtualDirectory)!;
  const virtualDirectories = virtualApps.filter(x => x.virtualDirectory);

  virtualApplications.sort((a, b) => b.virtualPath.length - a.virtualPath.length);

  virtualDirectories.forEach(virtualDirectory => {
    let appFound = false;
    const dirPathLen = virtualDirectory.virtualPath.length;
    for (let i = 0; i < virtualApplications.length && !appFound; i = i + 1) {
      const appPathLen = virtualApplications[i].virtualPath.length;
      if (appPathLen < dirPathLen && virtualDirectory.virtualPath.startsWith(virtualApplications[i].virtualPath)) {
        appFound = true;
        virtualDirectory.virtualPath = virtualDirectory.virtualPath.substring(appPathLen);
        virtualApplications[i].virtualDirectories!.push(virtualDirectory);
      }
    }
  });
  return virtualApplications;
}

function flattenVirtualApplicationsList(virtualApps: VirtualApplication[]) {
  const newList: VirtualApplication[] = [];
  if (!virtualApps) {
    return newList;
  }
  virtualApps.forEach(va => {
    newList.push({ ...va, virtualDirectory: false, virtualDirectories: [] });
    if (va.virtualDirectories && va.virtualDirectories.length > 0) {
      va.virtualDirectories.forEach(element => {
        newList.push({
          ...element,
          virtualPath: `${va.virtualPath}${element.virtualPath}`,
          virtualDirectory: true,
        });
      });
    }
  });
  return newList;
}

function getCurrentStackString(config: ArmObj<SiteConfig>, metadata: ArmObj<{ [key: string]: string }>): string {
  if (!!config.properties.javaVersion) {
    return 'java';
  }
  if (metadata && metadata.properties && metadata.properties.CURRENT_STACK) {
    return metadata.properties.CURRENT_STACK;
  }
  return 'dotnet';
}

function setStackData(currentlySelectedStack: string, config: ArmObj<SiteConfig>) {
  if (currentlySelectedStack !== 'java') {
    return {
      ...config,
      properties: {
        ...config.properties,
        javaVersion: '',
        javaContainer: '',
        javaContainerVersion: '',
      },
    };
  }
  return {
    ...config,
    properties: {
      ...config.properties,
      javaContainer: config.properties.javaContainer.toLowerCase(),
    },
  };
}

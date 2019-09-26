import { createContext } from 'react';
import { SiteRouterData } from './SiteRouter.data';

export const siteRouterData = new SiteRouterData();
export const SiteRouterContext = createContext(siteRouterData);

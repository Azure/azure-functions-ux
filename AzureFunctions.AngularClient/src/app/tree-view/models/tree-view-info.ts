import { DashboardType } from './dashboard-type';
import { TreeNode } from '../tree-node';

export interface TreeViewInfo<T> {
    resourceId: string;
    dashboardType: DashboardType;
    node: TreeNode;
    data: T;
}

export interface SiteData{
    siteTabRevealedTraceKey?: string;
    siteTabFullReadyTraceKey?: string;
}
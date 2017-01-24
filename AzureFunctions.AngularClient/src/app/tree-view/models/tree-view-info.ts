import {DashboardType} from './dashboard-type';

export interface TreeViewInfo{
    resourceId : string;
    dashboardType : DashboardType;
    data? : any;
}
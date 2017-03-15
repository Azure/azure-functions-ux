import {DashboardType} from './dashboard-type';
import {TreeNode} from '../tree-node';

export interface TreeViewInfo{
    resourceId : string;
    dashboardType : DashboardType;
    node : TreeNode;
    data : any;
}
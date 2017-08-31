import { VSTSLogMessageType } from './DeploymentEnums';
export interface HeaderObject {
    id?: string;
    class?: string;
    label?: string;
}

export interface MessageLink {
    icon: string;
    label: string;
    onClick: () => void;
}
export interface VSTSTableRow {
    type: VSTSLogMessageType;
    status: string;
    message: string;
    messageLinks: MessageLink[];
    time: string;
}

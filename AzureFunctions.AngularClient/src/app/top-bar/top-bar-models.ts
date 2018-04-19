export interface TopBarNotification{
    id : string;
    message : string;
    iconClass : string;
    learnMoreLink : string;
    clickCallback : () => void;
}

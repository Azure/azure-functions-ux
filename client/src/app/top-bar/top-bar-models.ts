export interface TopBarNotification {
  level?: 'warning' | 'info';
  id: string;
  message: string;
  iconClass: string;
  learnMoreLink: string;
  clickUrl?: string;
  clickCallback?: () => void;
}

/// <reference types="react-scripts" />

import { ITeachingBubbleProps } from 'office-ui-fabric-react';

declare module 'office-ui-fabric-react/lib/Coachmark' {
  const Coachmark: React.StatelessComponent<ICoachmarkProps>;
}

declare module 'office-ui-fabric-react/lib/TeachingBubble' {
  const TeachingBubbleContent: React.StatelessComponent<ITeachingBubbleProps>;
}

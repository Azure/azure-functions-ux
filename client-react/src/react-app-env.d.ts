/// <reference types="react-scripts" />

import { ITeachingBubbleProps } from 'office-ui-fabric-react';

declare module 'office-ui-fabric-react/lib/Coachmark' {
  const Coachmark: React.StatelessComponent<ICoachmarkProps>;
}

declare module 'office-ui-fabric-react/lib/TeachingBubble' {
  const TeachingBubbleContent: React.StatelessComponent<ITeachingBubbleProps>;
}

declare global {
  interface Window {
    /**
     * Formats a string based on its key value pair object.
     *
     * @param args The list of arguments format arguments. For example: "String with params {0} and {1}".format("val1", "val2");.
     * @return Formatted string.
     */
    authToken?: string;
    armEndpoint?: string;
    updateAuthToken?: (type: string) => Promise<string>;
  }
}

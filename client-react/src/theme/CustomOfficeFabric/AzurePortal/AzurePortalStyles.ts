import { DropdownStyles } from './Styles/Dropdown.styles';

// Roll up all style overrides in a single "Ibiza theme" object

// TODO: "any" is used here to get around "is using xxx but cannot be named" TS error. Should be able to remove
//        this 'any' once we upgrade to TS3.1+
// tslint:disable-next-line:no-any
export const AzurePortalStyles: any = {
  Dropdown: {
    styles: DropdownStyles,
  },
};

import { SearchBox } from '@fluentui/react';
import { IconConstants } from '../../utils/constants/IconConstants';
import { filterTextFieldStyle } from './formControl.override.styles';

export const getSearchFilter = (
  id: string,
  setFilerValue: (value: string) => void,
  placeHolder?: string,
  disabled?: boolean,
  autoFocus?: boolean
): JSX.Element => {
  return (
    <>
      <SearchBox
        id={id}
        onChange={(_e, newValue) => setFilerValue(newValue || '')}
        placeholder={placeHolder}
        iconProps={{ iconName: IconConstants.IconNames.Filter }}
        className="ms-slideDownIn20"
        styles={filterTextFieldStyle}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </>
  );
};

import { SearchBox } from '@fluentui/react';
import { filterTextFieldStyle } from './formControl.override.styles';

export const getSearchFilter = (
  id: string,
  setFilerValue: (value: string) => void,
  placeHolder?: string,
  disabled?: boolean
): JSX.Element => {
  return (
    <SearchBox
      id={id}
      onChange={(_e, newValue) => setFilerValue(newValue || '')}
      placeholder={placeHolder}
      autoFocus
      iconProps={{ iconName: 'Filter' }}
      className="ms-slideDownIn20"
      styles={filterTextFieldStyle}
      disabled={disabled}
    />
  );
};

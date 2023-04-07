/* eslint-disable react-hooks/rules-of-hooks */
import { SearchBox } from '@fluentui/react';
import { debounce } from 'lodash';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    <SearchBox
      id={id}
      onChange={(_e, newValue) => setFilerValue(newValue || '')}
      placeholder={placeHolder}
      iconProps={{ iconName: IconConstants.IconNames.Filter }}
      className="ms-slideDownIn20"
      styles={filterTextFieldStyle}
      disabled={disabled}
      autoFocus={autoFocus}
      onSearch={() => {
        /** @note (joechung): Ignore Enter key press. */
      }}
    />
  );
};

// Note(liuqi): replace all places other than configurations that use getSearchFilter with getSearchFilterWithResultAnnouncement
export const SearchFilterWithResultAnnouncement = memo(
  (props: {
    id: string;
    setFilterValue: (value: string) => void;
    gridItemsCount: number;
    filter: string;
    placeHolder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
  }): JSX.Element => {
    const { id, setFilterValue, gridItemsCount, filter, placeHolder, disabled, autoFocus } = props;
    const { t } = useTranslation();

    // Add onSearch as ariaLabel is only announced if onSearch is triggered
    const onSearch = useCallback(
      val => {
        setFilterValue(val || '');
      },
      [setFilterValue]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onChange = useCallback(
      debounce((_e: React.ChangeEvent<HTMLInputElement>, val?: string) => {
        onSearch(val);
      }, 200),
      [onSearch]
    );

    const ariaLabel = useMemo(() => {
      if (gridItemsCount === 0) {
        return filter.length > 0 ? t('gridItemsCountAriaLabelNoResults').format(filter) : t('gridItemsCountAriaLabelNoFilterNoResults');
      } else {
        return filter.length > 0
          ? t('gridItemsCountAriaLabel').format(gridItemsCount, gridItemsCount === 1 ? t('result') : t('results'), filter)
          : t('gridItemsCountAriaLabelNoFilter').format(gridItemsCount, gridItemsCount === 1 ? t('result') : t('results'));
      }
    }, [gridItemsCount, filter, t]);

    return (
      <SearchBox
        id={id}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={placeHolder}
        iconProps={{ iconName: IconConstants.IconNames.Filter }}
        className="ms-slideDownIn20"
        styles={filterTextFieldStyle}
        disabled={disabled}
        autoFocus={autoFocus}
        ariaLabel={ariaLabel}
      />
    );
  }
);

SearchFilterWithResultAnnouncement.displayName = 'SearchFilterWithResultAnnouncement';

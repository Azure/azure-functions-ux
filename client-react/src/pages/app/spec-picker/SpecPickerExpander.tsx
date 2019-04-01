import React, { useState } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useTranslation } from 'react-i18next';
import { expanderDivStyle } from './SpecPicker.styles';

interface SpecPickerExpanderProps {
  onClick: () => void;
  isExpanded: boolean;
}

const SpecPickerExpander: React.FC<SpecPickerExpanderProps> = props => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(props.isExpanded);

  return (
    <div className={expanderDivStyle}>
      <ActionButton
        onClick={() => {
          setIsExpanded(!isExpanded);
          props.onClick();
        }}
        iconProps={{ iconName: isExpanded ? 'ChevronUp' : 'ChevronDown' }}>
        {isExpanded ? t('seeRecommendedOptions') : t('seeAllOptions')}
      </ActionButton>
    </div>
  );
};

export default SpecPickerExpander;

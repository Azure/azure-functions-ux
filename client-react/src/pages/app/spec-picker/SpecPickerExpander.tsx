import React from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { WithTranslation, withTranslation } from 'react-i18next';
import { expanderDivStyle } from './SpecPicker.styles';

interface SpecPickerExpanderProps {
  onClick: () => void;
  isExpanded: boolean;
}

interface ISpecPickerExpanderState {
  isExpanded: boolean;
}

type SpecPickerExpanderPropsCombined = SpecPickerExpanderProps & WithTranslation;
class SpecPickerExpander extends React.Component<SpecPickerExpanderPropsCombined, ISpecPickerExpanderState> {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: props.isExpanded,
    };
  }

  public render() {
    const { t } = this.props;
    const { isExpanded } = this.state;

    return (
      <div className={expanderDivStyle}>
        <ActionButton onClick={this._onClick} iconProps={{ iconName: isExpanded ? 'ChevronUp' : 'ChevronDown' }}>
          {isExpanded ? t('seeRecommendedOptions') : t('seeAllOptions')}
        </ActionButton>
      </div>
    );
  }

  private _onClick = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
    this.props.onClick();
  };
}

export default withTranslation('translation')(SpecPickerExpander);

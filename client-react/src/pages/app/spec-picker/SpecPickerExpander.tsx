import * as React from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { compose } from 'recompose';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { style } from 'typestyle';

interface SpecPickerExpanderProps {
  onClick: () => void;
  isExpanded: boolean;
}

interface ISpecPickerExpanderState {
  isExpanded: boolean;
}

const expanderDivStyle = style({
  width: '100%',
});

type SpecPickerExpanderPropsCombined = SpecPickerExpanderProps & InjectedTranslateProps;
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

export default compose<SpecPickerExpanderPropsCombined, SpecPickerExpanderProps>(translate('translation'))(SpecPickerExpander);

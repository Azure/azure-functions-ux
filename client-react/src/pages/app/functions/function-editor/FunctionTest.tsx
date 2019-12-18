import React from 'react';
import { addEditFormStyle } from '../../../../components/form-controls/formControl.override.styles';
import ActionBar from '../../../../components/ActionBar';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { style } from 'typestyle';

export interface FunctionTestProps {
  run: () => void;
  cancel: () => void;
}

const pivotWrapper = style({
  paddingLeft: '8px',
});

// TODO (krmitta): Add Content for Function test panel
const FunctionTest: React.SFC<FunctionTestProps> = props => {
  const { t } = useTranslation();
  const { run, cancel } = props;

  const actionBarPrimaryButtonProps = {
    id: 'run',
    title: t('run'),
    onClick: run,
    disable: false,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };

  return (
    <form className={addEditFormStyle}>
      <Pivot>
        <PivotItem className={pivotWrapper} />
        <PivotItem className={pivotWrapper} />
      </Pivot>
      <ActionBar
        id="connection-string-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
      />
    </form>
  );
};

export default FunctionTest;

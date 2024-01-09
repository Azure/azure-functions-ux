import {
  ColumnActionsMode,
  ContextualMenu,
  DefaultButton,
  DetailsList,
  Dialog,
  DialogFooter,
  DialogType,
  IColumn,
  IContextualMenuProps,
  IDetailsList,
  IDetailsListProps,
  ITextField,
  PrimaryButton,
  ShimmeredDetailsList,
  TextField,
  ThemeProvider,
} from '@fluentui/react';
import React, { useContext, useRef, useState } from 'react';
import { style } from 'typestyle';
import { ThemeContext } from '../../ThemeContext';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { detailListHeaderStyle } from '../form-controls/formControl.override.styles';
import { shimmerTheme } from '../shimmer/Shimmer.styles';
import { useTranslation } from 'react-i18next';

export interface ShimmerProps {
  lines: number;
  show: boolean;
}
export interface DisplayTableWithEmptyMessageProps {
  emptyMessage?: string;
  shimmer?: ShimmerProps;
}
const emptyTableMessageStyle = (theme: ThemeExtended) =>
  style({
    textAlign: 'center',
    width: '100%',
    fontSize: '12px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.neutralSecondaryAlt}`,
    backgroundColor: theme.semanticColors.listBackground,
  });

const initialShimmerTableStyle = (shimmerVisible: boolean) =>
  style({
    overflow: shimmerVisible ? 'hidden' : 'inherit',
  });

export const defaultCellStyle = style({
  fontSize: '12px',
  height: '15px',
});
type Props = DisplayTableWithEmptyMessageProps & IDetailsListProps;
const DisplayTableWithEmptyMessage: React.SFC<Props> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { emptyMessage, shimmer, columns, ...rest } = props;

  const detailsListRef = useRef<IDetailsList>(null);
  const resizeColumnTextFieldRef = useRef<ITextField>(null);
  const columnRef = useRef<IColumn>();
  const [contextualMenuProps, setContextualMenuProps] = React.useState<IContextualMenuProps>();
  const [isDialogHidden, setIsDialogHidden] = useState(true);

  const hideDialog = () => setIsDialogHidden(true);

  const showDialog = () => setIsDialogHidden(false);

  const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column?: IColumn) => {
    if (column && column.columnActionsMode !== ColumnActionsMode.disabled && column.isResizable) {
      columnRef.current = column;
      setContextualMenuProps({
        items: [{ key: 'resize', text: t('resize'), onClick: showDialog }],
        target: ev.currentTarget as HTMLElement,
        gapSpace: 10,
        isBeakVisible: true,
        onDismiss: () => setContextualMenuProps(undefined),
      });
    }
  };

  const confirmColumnResizeDialog = () => {
    if (columnRef.current && detailsListRef.current && resizeColumnTextFieldRef.current?.value) {
      const width = Number(resizeColumnTextFieldRef.current?.value);
      detailsListRef.current.updateColumn(columnRef.current, { width: width });
    }

    columnRef.current = undefined;
    hideDialog();
  };

  const updatedColumns = (columns || []).map(column => {
    const allHeaderClassName = `${detailListHeaderStyle} ${column.headerClassName || ''}`;
    column.headerClassName = allHeaderClassName;
    return column;
  });

  return (
    <>
      {shimmer ? (
        <ThemeProvider theme={shimmerTheme}>
          <ShimmeredDetailsList
            enableShimmer={shimmer.show}
            shimmerLines={shimmer.lines}
            className={initialShimmerTableStyle(shimmer.show)}
            removeFadingOverlay={true}
            columns={updatedColumns}
            detailsListStyles={rest.styles}
            {...rest}
          />
        </ThemeProvider>
      ) : (
        <DetailsList columns={updatedColumns} {...rest} componentRef={detailsListRef} onColumnHeaderClick={onColumnClick} />
      )}
      {contextualMenuProps && <ContextualMenu {...contextualMenuProps} />}
      <Dialog
        hidden={isDialogHidden}
        onDismiss={hideDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: t('resizeColumnDialogTitle'),
        }}>
        <TextField componentRef={resizeColumnTextFieldRef} label={t('resizeColumnDialogTextFieldLabel')} />
        <DialogFooter>
          <PrimaryButton onClick={confirmColumnResizeDialog} text={t('ok')} />
          <DefaultButton onClick={hideDialog} text={t('cancel')} />
        </DialogFooter>
      </Dialog>
      {props.items.length === 0 && !!emptyMessage && (!shimmer || !shimmer.show) && (
        <div className={emptyTableMessageStyle(theme)}>{emptyMessage}</div>
      )}
    </>
  );
};

export default DisplayTableWithEmptyMessage;

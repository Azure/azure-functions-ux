import React, { useContext } from 'react';
import { FieldProps } from 'formik';
import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import { IDropdownProps, DialogType, Dialog, Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
import { NewConnectionDialogProps } from './DialogProperties';
import CustomTabRenderer from '../../../app-settings/Sections/CustomTabRenderer';
import { ThemeContext } from '../../../../../ThemeContext';
import { useTranslation } from 'react-i18next';
import EventHubPivot from './EventHubPivot';

export enum PivotState {
  eventHub = 'eventHub',
  iotHub = 'iotHub',
  custom = 'custom',
}

const NewEventHubConnectionDialogProps: React.SFC<NewConnectionDialogProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const { setIsDialogVisible } = props;

  return (
    <Dialog
      minWidth={600}
      hidden={false}
      onDismiss={() => setIsDialogVisible(false)}
      modalProps={{
        isBlocking: false,
        styles: { main: { minHeight: 400 } },
      }}
      dialogContentProps={{
        type: DialogType.close,
        title: 'New Event Hub Connection',
      }}>
      <Pivot getTabId={getPivotTabId}>
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme)
          }
          itemKey={PivotState.eventHub}
          headerText={t('eventHubPicker_eventHub')}>
          <EventHubPivot {...props} />
        </PivotItem>
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme)
          }
          itemKey={PivotState.iotHub}
          headerText={t('eventHubPicker_IOTHub')}
        />
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme)
          }
          itemKey={PivotState.custom}
          headerText={t('eventHubPicker_custom')}
        />
      </Pivot>
    </Dialog>
  );
};

const getPivotTabId = (itemKey: string) => {
  switch (itemKey) {
    case PivotState.eventHub:
      return 'new-eventhub-connection-eventhub-tab';
    case PivotState.iotHub:
      return 'new-eventhub-connection-iothub-tab';
    case PivotState.custom:
      return 'new-eventhub-connection-custom-tab';
  }
  return '';
};

export default NewEventHubConnectionDialogProps;

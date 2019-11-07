import React, { useContext } from 'react';
import { FieldProps } from 'formik';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react';
import { NewConnectionCalloutProps } from './Callout.properties';
import CustomTabRenderer from '../../../app-settings/Sections/CustomTabRenderer';
import { ThemeContext } from '../../../../../ThemeContext';
import { useTranslation } from 'react-i18next';
import EventHubPivotDataLoader from './eventHubPivot/EventHubPivotDataLoader';

export enum PivotState {
  eventHub = 'eventHub',
  iotHub = 'iotHub',
  custom = 'custom',
}

const NewEventHubConnectionCalloutProps: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <Pivot getTabId={getPivotTabId}>
      <PivotItem
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme)
        }
        itemKey={PivotState.eventHub}
        headerText={t('eventHubPicker_eventHub')}>
        <EventHubPivotDataLoader {...props} />
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

export default NewEventHubConnectionCalloutProps;

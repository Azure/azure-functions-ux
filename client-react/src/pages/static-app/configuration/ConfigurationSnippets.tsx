import { useState, useCallback, useContext, useMemo } from 'react';
import { useBoolean } from '@fluentui/react-hooks';
import { useTranslation } from 'react-i18next';
import {
  Link,
  ProgressIndicator,
  PanelType,
  IColumn,
  TooltipHost,
  IconButton,
  ActionButton,
  DetailsListLayoutMode,
  SelectionMode,
  DetailsRow,
  Checkbox,
  DetailsHeader,
  ICommandBarItemProps,
} from '@fluentui/react';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../utils/FwLinks';
import { useStyles } from './Configuration.styles';
import { ApplicableEnvironmentsMode, ConfigurationSnippetsProps, Snippet } from './Configuration.types';
import ConfigurationSnippetsAddEdit from './ConfigurationSnippetsAddEdit';
import CustomPanel from '../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { getSearchFilter } from '../../../components/form-controls/SearchBox';
import { commandBarSeparator } from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar.style';
import { ThemeContext } from '../../../ThemeContext';
import ConfigurationData from './Configuration.data';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import { PortalContext } from '../../../PortalContext';
import { getTelemetryInfo } from '../StaticSiteUtility';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';

const ConfigurationSnippets: React.FC<ConfigurationSnippetsProps> = ({
  hasWritePermissions,
  isLoading,
  formProps,
  disabled,
  resourceId,
  refresh,
}: ConfigurationSnippetsProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const { values } = formProps;
  const [isOpen, { setTrue: openAddEditPanel, setFalse: dismissAddEditPanel }] = useBoolean(false);
  const [filter, setFilter] = useState('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet>();
  const [isDeleteConfirmDialogVisible, { setTrue: showDiscardConfirmDialog, setFalse: hideDeleteConfirmDialog }] = useBoolean(false);

  const setSnippetAndOpenPanel = (currentSnippet: Snippet) => {
    setSelectedSnippet(currentSnippet);
    openAddEditPanel();
  };

  const setSnippetAndDismissPanel = () => {
    setSelectedSnippet(undefined);
    dismissAddEditPanel();
  };

  const filteredItems = useMemo(() => {
    return (
      values.snippets?.filter(snippet => {
        return !filter || snippet.name.toLowerCase().includes(filter.toLowerCase());
      }) ?? []
    );
  }, [filter, values.snippets]);

  const onRenderColumnItem = useCallback(
    (item: Snippet, index: number, column: IColumn) => {
      if (!column || !item) {
        return null;
      }
      if (column.key === 'edit') {
        return (
          <TooltipHost content={t('edit')} id={`snippet-edit-tooltip-${index}`} calloutProps={{ gapSpace: 0 }} closeDelay={500}>
            <IconButton
              className={styles.defaultCellStyle}
              disabled={false}
              id={`snippet-${index}`}
              iconProps={{ iconName: 'Edit' }}
              ariaLabel={t('edit')}
              onClick={() => setSnippetAndOpenPanel(item)}
            />
          </TooltipHost>
        );
      }

      if (column.key === 'name') {
        return (
          <ActionButton
            className={styles.defaultCellStyle}
            disabled={false}
            id={`snippet-${index}`}
            onClick={() => setSnippetAndOpenPanel(item)}>
            <span aria-live="assertive" role="region">
              {item[column.fieldName!]}
            </span>
          </ActionButton>
        );
      }

      if (column.key === 'type') {
        return (
          <ActionButton
            className={styles.defaultCellStyle}
            disabled={false}
            id={`snippet-${index}`}
            onClick={() => setSnippetAndOpenPanel(item)}>
            <span aria-live="assertive" role="region">
              {item.location}
            </span>
          </ActionButton>
        );
      }

      if (column.key === 'appliesto') {
        return (
          <ActionButton
            className={styles.defaultCellStyle}
            disabled={false}
            id={`snippet-${index}`}
            onClick={() => setSnippetAndOpenPanel(item)}>
            <span aria-live="assertive" role="region">
              {getItemEnvironmentContent(item)}
            </span>
          </ActionButton>
        );
      }

      if (column.key === 'content') {
        return (
          <ActionButton
            className={styles.defaultCellStyle}
            disabled={false}
            id={`snippet-${index}`}
            onClick={() => setSnippetAndOpenPanel(item)}>
            <span aria-live="assertive" role="region">
              {item.content}
            </span>
          </ActionButton>
        );
      }

      return <div className={styles.defaultCellStyle}>{item[column.fieldName!]}</div>;
    },
    [styles]
  );

  const getItemEnvironmentContent = (item: Snippet) => {
    if (item.applicableEnvironmentsMode === ApplicableEnvironmentsMode.AllEnvironments) {
      return t('staticSite_allEnvironments');
    }
    if (item.applicableEnvironmentsMode === ApplicableEnvironmentsMode.StagingEnvironments) {
      return t('staticSite_stagingEnvironments');
    }
    if (item.environments?.length === 1) {
      const env = formProps.values.environments?.find(env => env.name === item.environments[0]);
      if (env) {
        return ConfigurationData.getEnvironmentName(env);
      } else {
        return item.environments[0];
      }
    }
    return `${item.environments?.length ?? 0} ${t('staticSite_environments')}`;
  };

  const defaultColumns = useMemo((): IColumn[] => {
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 220,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'type',
        name: t('staticSite_typeTitle'),
        fieldName: 'location',
        minWidth: 75,
        maxWidth: 150,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'content',
        name: t('value'),
        fieldName: 'content',
        minWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'appliesto',
        name: t('staticSite_appliesTo'),
        fieldName: 'applicableEnvironmentsMode',
        minWidth: 150,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'edit',
        name: t('edit'),
        fieldName: 'edit',
        minWidth: 35,
        maxWidth: 35,
        isRowHeader: false,
        isResizable: false,
        isCollapsible: false,
        onRender: onRenderColumnItem,
      },
    ];
  }, []);

  const onRenderRow = rowProps => {
    const { item } = rowProps;
    return <DetailsRow {...rowProps} onRenderCheck={() => onRenderRowItemCheckbox(item)} />;
  };

  const onRenderDetailsHeader = headerProps => {
    return <DetailsHeader {...headerProps} onRenderDetailsCheckbox={onRenderHeaderItemCheckbox} />;
  };

  const getCheckedValueForCheckBox = useCallback(
    (disabled: boolean) => {
      const selectedSnippets = values.snippets?.filter(snippet => snippet.checked) ?? [];
      return !disabled && selectedSnippets.length === values.snippets?.length;
    },
    [values.snippets, disabled]
  );

  const onRenderHeaderItemCheckbox = useCallback(() => {
    const disabled = values.snippets?.length === 0;
    const checked = getCheckedValueForCheckBox(disabled);
    return (
      <Checkbox
        disabled={disabled}
        checked={checked}
        onChange={() => {
          onHeaderItemCheckboxChange(!checked);
        }}
        label={''}
        ariaLabel={t('staticSite_headerCheckboxAriaLabel')}
      />
    );
  }, [values.snippets]);

  const onRenderRowItemCheckbox = (item: any) => {
    return (
      <Checkbox
        checked={item.checked}
        onChange={() => {
          onRowItemCheckboxChange(item);
        }}
        label={''}
        ariaLabel={t('staticSite_rowCheckboxAriaLabel')}
      />
    );
  };

  const onRowItemCheckboxChange = (item: Snippet) => {
    const updatedSnippets = values.snippets ? values.snippets : [];
    formProps.setFieldValue(
      'snippets',
      updatedSnippets.map(snippet => {
        if (snippet.name.toLocaleLowerCase() === item.name.toLocaleLowerCase()) {
          snippet.checked = !item.checked;
        }
        return snippet;
      })
    );
  };

  const onHeaderItemCheckboxChange = (updatedChecked: boolean) => {
    const updatedSnippets = values.snippets ? values.snippets : [];
    formProps.setFieldValue(
      'snippets',
      updatedSnippets.map(snippet => {
        snippet.checked = updatedChecked;
        return snippet;
      })
    );
  };

  const isDeleteButtonDisabled: boolean = useMemo(() => {
    return !hasWritePermissions || !values.snippets || values.snippets.filter(snippet => snippet.checked).length <= 0;
  }, [hasWritePermissions, values.snippets]);

  const isAddButtonDisabled: boolean = useMemo(() => {
    return !hasWritePermissions;
  }, [hasWritePermissions]);

  const commandBarItems: ICommandBarItemProps[] = useMemo(() => {
    return [
      {
        key: 'add-new-snippet',
        onClick: openAddEditPanel,
        disabled: isAddButtonDisabled,
        iconProps: { iconName: 'Add' },
        name: t('add'),
        ariaLabel: t('add'),
      },
      {
        key: 'snippet-variable-bulk-delete',
        onClick: showDiscardConfirmDialog,
        disabled: isDeleteButtonDisabled,
        iconProps: { iconName: 'Delete' },
        text: t('delete'),
        ariaLabel: t('delete'),
        className: commandBarSeparator(theme),
      },
    ];
  }, [isDeleteButtonDisabled]);

  const deleteSnippets = useCallback(async () => {
    hideDeleteConfirmDialog();
    const snippetsToDelete: string[] =
      values.snippets
        ?.filter(snippet => {
          if (snippet.checked) {
            return snippet;
          }
        })
        .map(snippet => snippet.name) ?? [];

    const notificationIds: Map<string, string> = new Map();
    snippetsToDelete.forEach(snippetName => {
      const notificationMessage = t('staticSite_deletingSnippet').format(snippetName);
      notificationIds.set(snippetName, portalContext.startNotification(notificationMessage, notificationMessage));
    });

    const snippetResponses = await Promise.all(
      snippetsToDelete.map(snippetName => StaticSiteService.deleteStaticSiteSnippet(resourceId, snippetName))
    );
    const snippetResponsesWithUser = snippetResponses.map((res, name) => ({
      snippetName: snippetsToDelete[name],
      snippetResponse: res,
    }));

    snippetResponsesWithUser.forEach(value => {
      if (value.snippetResponse.metadata.success) {
        portalContext.stopNotification(
          notificationIds.get(value.snippetName) ?? '',
          true,
          t('staticSite_deletingSnippetSuccess').format(value.snippetName)
        );
      } else {
        const errorMessage = value.snippetResponse.metadata.error?.Message
          ? t('staticSite_deletingSnippetFailureWithMessage').format(value.snippetName, value.snippetResponse.metadata.error?.Message)
          : t('staticSite_deletingSnippetFailure').format(value.snippetName);
        portalContext.log(
          getTelemetryInfo('error', 'deleteStaticSiteSnippet', 'failed', {
            error: value.snippetResponse.metadata.error,
            name: value.snippetName,
          })
        );
        portalContext.stopNotification(notificationIds.get(value.snippetName) ?? '', false, errorMessage);
      }
    });

    refresh();
  }, [values.snippets]);

  return (
    <div className={styles.formStyle}>
      {isLoading ? (
        <ProgressIndicator description={t('staticSite_loadingSnippets')} ariaValueText={t('staticSite_loadingSnippets')} />
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.description}>
              <span id="snippets-description">{t('staticSite_SnippetsDescription')} </span>
              <Link
                aria-labelledby="snippets-description"
                className={learnMoreLinkStyle}
                underline={true}
                href={Links.staticSiteSnippetsLearnMore}
                target="_blank">
                {t('learnMore')}
              </Link>
            </div>
          </section>
          <DisplayTableWithCommandBar
            commandBarItems={commandBarItems}
            columns={defaultColumns}
            items={filteredItems}
            isHeaderVisible={true}
            ariaLabelForSelectionColumn={t('toggleSnippetSelectionAriaLabel')}
            ariaLabelForSelectAllCheckbox={t('selectSnippetAriaLabel')}
            checkButtonAriaLabel={t('toggleAllSnippetsAriaLabel')}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.multiple}
            selectionPreservedOnEmptyClick={true}
            emptyMessage={t('staticSite_noSnippets')}
            shimmer={{ lines: 2, show: isLoading }}
            onRenderRow={onRenderRow}
            onRenderDetailsHeader={onRenderDetailsHeader}>
            <ConfirmDialog
              title={t('staticSite_deleteSnippetConfirmationTitle')}
              content={t('staticSite_deleteSnippetConfirmation')}
              hidden={!isDeleteConfirmDialogVisible}
              onDismiss={hideDeleteConfirmDialog}
              defaultActionButton={{
                title: t('cancel'),
                onClick: hideDeleteConfirmDialog,
              }}
              primaryActionButton={{
                title: t('ok'),
                onClick: () => {
                  deleteSnippets();
                },
              }}
            />
            {getSearchFilter('snippets-search', setFilter, t('staticSite_filterSnippets'), false)}
          </DisplayTableWithCommandBar>
          <CustomPanel type={PanelType.medium} isOpen={isOpen} onDismiss={setSnippetAndDismissPanel}>
            <ConfigurationSnippetsAddEdit
              hasWritePermissions={hasWritePermissions}
              resourceId={resourceId}
              refresh={refresh}
              formProps={formProps}
              isLoading={isLoading}
              disabled={disabled}
              dismissPanel={() => setSnippetAndDismissPanel()}
              selectedSnippet={selectedSnippet}
            />
          </CustomPanel>
        </>
      )}
    </div>
  );
};

export default ConfigurationSnippets;

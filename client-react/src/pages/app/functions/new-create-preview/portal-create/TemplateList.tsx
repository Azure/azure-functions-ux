import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';

import {
  CheckboxVisibility,
  DetailsListLayoutMode,
  IColumn,
  IDetailsRowProps,
  IRenderFunction,
  Link,
  MessageBarType,
  Selection,
  SelectionMode,
} from '@fluentui/react';

import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import DisplayTableWithCommandBar from '../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { SearchFilterWithResultAnnouncement } from '../../../../../components/form-controls/SearchBox';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { HostStatus } from '../../../../../models/functions/host-status';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { PortalContext } from '../../../../../PortalContext';
import { ThemeContext } from '../../../../../ThemeContext';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../../utils/ArmTemplateHelper';
import { Links } from '../../../../../utils/FwLinks';
import { LogCategories } from '../../../../../utils/LogCategories';
import StringUtils from '../../../../../utils/string';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../../common/CreateFunctionFormBuilder';
import { getTelemetryInfo } from '../../common/FunctionsUtility';
import FunctionCreateData from '../FunctionCreate.data';
import { containerStyle, tableRowStyle, templateListNameColumnStyle, templateListStyle } from '../FunctionCreate.styles';
import { sortTemplate } from '../FunctionCreate.types';
import { FunctionCreateContext } from '../FunctionCreateContext';

import TemplateDetail from './TemplateDetail';

export interface TemplateListProps {
  formProps: FormikProps<CreateFunctionFormValues>;
  resourceId: string;
  setBuilder: (builder?: CreateFunctionFormBuilder) => void;
  setHostStatus: (hostStatus?: ArmObj<HostStatus>) => void;
  setSelectedTemplate: (template?: FunctionTemplate) => void;
  setTemplates: (template?: FunctionTemplate[] | null) => void;
  armResources?: IArmResourceTemplate[];
  builder?: CreateFunctionFormBuilder;
  hostStatus?: ArmObj<HostStatus>;
  selectedTemplate?: FunctionTemplate;
  setArmResources?: TSetArmResourceTemplates;
  templates?: FunctionTemplate[] | null;
}

const TemplateList: React.FC<TemplateListProps> = ({
  formProps,
  resourceId,
  setBuilder,
  setHostStatus,
  setSelectedTemplate,
  setTemplates,
  armResources,
  builder,
  hostStatus,
  selectedTemplate,
  setArmResources,
  templates,
}: TemplateListProps) => {
  const { t } = useTranslation();

  const [filterValue, setFilterValue] = useState('');

  const functionCreateContext = useContext(FunctionCreateContext);
  const portalCommunicator = useContext(PortalContext);
  const theme = useContext(ThemeContext);

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          if (selectedItems[0]) {
            setSelectedTemplate(selectedItems[0] as FunctionTemplate);
          }
        },
        selectionMode: SelectionMode.single,
      }),
    [setSelectedTemplate]
  );

  const columns = useMemo(() => {
    const onRenderItemColumn = (item: FunctionTemplate, _: number, column: IColumn): JSX.Element | null => {
      if (!column || !item) {
        return null;
      }

      if (column.key === 'template') {
        const runtimeVersion = hostStatus ? StringUtils.getRuntimeVersionString(hostStatus.properties.version) : '';
        return (
          <div className={templateListNameColumnStyle}>
            {runtimeVersion === RuntimeExtensionMajorVersions.v1 ? `${item.name}: ${item.language}` : item.name}
          </div>
        );
      }

      return column.fieldName ? <div>{item[column.fieldName]}</div> : null;
    };

    return [
      {
        key: 'template',
        name: t('template'),
        fieldName: 'template',
        minWidth: 100,
        maxWidth: 225,
        isResizable: true,
        isMultiline: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'description',
        name: t('description'),
        fieldName: 'description',
        minWidth: 100,
        isResizable: true,
        isMultiline: true,
        onRender: onRenderItemColumn,
      },
    ];
  }, [hostStatus, t]);

  const items = useMemo(() => {
    return (
      templates
        ?.filter(template => {
          const lowerCasedFilterValue = filterValue?.toLocaleLowerCase() ?? '';
          return (
            template.name.toLocaleLowerCase().includes(lowerCasedFilterValue) ||
            template.description?.toLocaleLowerCase().includes(lowerCasedFilterValue)
          );
        })
        .sort((templateA: FunctionTemplate, templateB: FunctionTemplate) => sortTemplate(templateA, templateB)) ?? []
    );
  }, [filterValue, templates]);

  const onItemInvoked = useCallback(
    (item?: FunctionTemplate) => {
      if (item) {
        setSelectedTemplate(item);
      }
    },
    [setSelectedTemplate]
  );

  const isDisabled = useMemo(() => {
    return !!functionCreateContext.creatingFunction;
  }, [functionCreateContext.creatingFunction]);

  const onRenderRow = useCallback<IRenderFunction<IDetailsRowProps>>(
    (rowProps, defaultRenderer) => {
      return (
        <>
          {!!rowProps && (
            <div>
              {defaultRenderer?.({
                ...rowProps,
                styles: tableRowStyle(theme, !!selectedTemplate && rowProps.item.id === selectedTemplate.id, isDisabled),
              })}
            </div>
          )}
        </>
      );
    },
    [isDisabled, selectedTemplate, theme]
  );

  useEffect(() => {
    FunctionCreateData.getHostStatus(resourceId).then(response => {
      if (response.metadata.success) {
        setHostStatus(response.data);
      } else {
        portalCommunicator.log(
          getTelemetryInfo('info', LogCategories.localDevExperience, 'getHostStatus', {
            errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
            message: getErrorMessage(response.metadata.error),
          })
        );
      }
    });

    FunctionCreateData.getTemplates(resourceId).then(response => {
      if (response.metadata.success) {
        setTemplates(response.data.properties);
      } else {
        setTemplates(null);
        portalCommunicator.log(
          getTelemetryInfo('info', LogCategories.localDevExperience, 'getTemplates', {
            message: getErrorMessage(response.metadata.error),
            errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
          })
        );
      }
    });
  }, [portalCommunicator, resourceId, setHostStatus, setTemplates]);

  return (
    <div className={containerStyle}>
      <h3>{t('selectTemplate')}</h3>
      <p>
        {t('selectTemplateDescription')}
        <Link href={Links.functionCreateTemplateLearnMore} rel="noopener" target="_blank">
          {t('learnMore')}
        </Link>
      </p>
      <SearchFilterWithResultAnnouncement
        id="filter-template-text-field"
        disabled={isDisabled}
        gridItemsCount={templates?.length ?? 0}
        filter={filterValue}
        placeHolder={t('filter')}
        setFilterValue={setFilterValue}
      />
      {templates !== null ? (
        <DisplayTableWithCommandBar
          commandBarItems={[]}
          columns={columns}
          items={items}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.single}
          selectionPreservedOnEmptyClick={true}
          selection={selection}
          emptyMessage={t('noResults')}
          checkboxVisibility={CheckboxVisibility.hidden}
          className={templateListStyle}
          onItemInvoked={onItemInvoked}
          shimmer={{ lines: 2, show: !templates }}
          disableSelectionZone={isDisabled}
          onRenderRow={onRenderRow}
        />
      ) : /* TODO(krmitta): Add Error Banner here */ null}
      {!!hostStatus && !hostStatus.properties.version.startsWith('1') && !hostStatus.properties.extensionBundle && (
        <div>
          <CustomBanner
            type={MessageBarType.warning}
            message={t('functionCreate_extensionBundlesRequired')}
            learnMoreLink={Links.extensionBundlesRequiredLearnMore}
          />
        </div>
      )}
      {!!selectedTemplate && (
        <TemplateDetail
          resourceId={resourceId}
          selectedTemplate={selectedTemplate}
          formProps={formProps}
          setBuilder={setBuilder}
          builder={builder}
          armResources={armResources}
          setArmResources={setArmResources}
        />
      )}
    </div>
  );
};

export default TemplateList;

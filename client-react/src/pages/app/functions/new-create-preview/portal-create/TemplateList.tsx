import { CheckboxVisibility, DetailsListLayoutMode, IColumn, Link, MessageBarType, Selection, SelectionMode } from '@fluentui/react';
import { FormikProps } from 'formik';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import DisplayTableWithCommandBar from '../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { getSearchFilter } from '../../../../../components/form-controls/SearchBox';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { HostStatus } from '../../../../../models/functions/host-status';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { ThemeContext } from '../../../../../ThemeContext';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../../utils/ArmTemplateHelper';
import { Links } from '../../../../../utils/FwLinks';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import StringUtils from '../../../../../utils/string';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../../common/CreateFunctionFormBuilder';
import FunctionCreateData from '../FunctionCreate.data';
import { containerStyle, tableRowStyle, templateListNameColumnStyle, templateListStyle } from '../FunctionCreate.styles';
import { sortTemplate } from '../FunctionCreate.types';
import { FunctionCreateContext } from '../FunctionCreateContext';
import TemplateDetail from './TemplateDetail';

export interface TemplateListProps {
  resourceId: string;
  formProps: FormikProps<CreateFunctionFormValues>;
  setBuilder: (builder?: CreateFunctionFormBuilder) => void;
  setSelectedTemplate: (template?: FunctionTemplate) => void;
  setTemplates: (template?: FunctionTemplate[] | null) => void;
  setHostStatus: (hostStatus?: ArmObj<HostStatus>) => void;
  templates?: FunctionTemplate[] | null;
  hostStatus?: ArmObj<HostStatus>;
  selectedTemplate?: FunctionTemplate;
  builder?: CreateFunctionFormBuilder;
  armResources?: IArmResourceTemplate[];
  setArmResources?: TSetArmResourceTemplates;
}

const TemplateList: React.FC<TemplateListProps> = (props: TemplateListProps) => {
  const {
    resourceId,
    formProps,
    setBuilder,
    builder,
    selectedTemplate,
    setSelectedTemplate,
    templates,
    setTemplates,
    hostStatus,
    setHostStatus,
    armResources,
    setArmResources,
  } = props;
  const { t } = useTranslation();

  const [filterValue, setFilterValue] = useState('');

  const functionCreateContext = useContext(FunctionCreateContext);
  const theme = useContext(ThemeContext);

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          if (selectedItems && selectedItems.length > 0) {
            setSelectedTemplate(selectedItems[0] as FunctionTemplate);
          }
        },
        selectionMode: SelectionMode.single,
      }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const fetchData = async () => {
    await getHostStatus();
    getTemplates();
  };

  const getHostStatus = async () => {
    const hostStatusResponse = await FunctionCreateData.getHostStatus(resourceId);
    if (hostStatusResponse.metadata.success) {
      setHostStatus(hostStatusResponse.data);
    } else {
      LogService.trackEvent(
        LogCategories.localDevExperience,
        'getHostStatus',
        `Failed to get hostStatus: ${getErrorMessageOrStringify(hostStatusResponse.metadata.error)}`
      );
    }
  };

  const getTemplates = async () => {
    const templateResponse = await FunctionCreateData.getTemplates(resourceId);
    if (templateResponse.metadata.success) {
      setTemplates(templateResponse.data.properties);
    } else {
      setTemplates(null);
      LogService.trackEvent(
        LogCategories.localDevExperience,
        'getTemplates',
        `Failed to get templates: ${getErrorMessageOrStringify(templateResponse.metadata.error)}`
      );
    }
  };

  const onRenderItemColumn = (item: FunctionTemplate, index: number, column: IColumn) => {
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

  const getColumns = () => {
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
  };

  const getItems = () => {
    return (
      templates
        ?.filter(template => {
          const lowerCasedFilterValue = filterValue?.toLocaleLowerCase() ?? '';
          return (
            template.name.toLocaleLowerCase().includes(lowerCasedFilterValue) ||
            (template.description && template.description.toLocaleLowerCase().includes(lowerCasedFilterValue))
          );
        })
        .sort((templateA: FunctionTemplate, templateB: FunctionTemplate) => sortTemplate(templateA, templateB)) ?? []
    );
  };

  const onItemInvoked = (item?: FunctionTemplate) => {
    if (item) {
      setSelectedTemplate(item);
    }
  };

  const isDisabled = () => {
    return !!functionCreateContext.creatingFunction;
  };

  const onRenderRow = (rowProps, defaultRenderer) => {
    return (
      <div>
        {defaultRenderer({
          ...rowProps,
          styles: tableRowStyle(theme, !!selectedTemplate && rowProps.item.id === selectedTemplate.id, isDisabled()),
        })}
      </div>
    );
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={containerStyle}>
      <h3>{t('selectTemplate')}</h3>
      <p>
        {t('selectTemplateDescription')}
        <Link href={Links.functionCreateTemplateLearnMore}>{t('learnMore')}</Link>
      </p>
      {getSearchFilter('filter-template-text-field', setFilterValue, t('filter'), isDisabled())}
      {templates !== null ? (
        <DisplayTableWithCommandBar
          commandBarItems={[]}
          columns={getColumns()}
          items={getItems()}
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
          disableSelectionZone={isDisabled()}
          onRenderRow={onRenderRow}
        />
      ) : (
        <>{/**TODO (krmitta): Add Error Banner here**/}</>
      )}

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

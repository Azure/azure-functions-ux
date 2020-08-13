import React, { useEffect, useState, useMemo } from 'react';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { useTranslation } from 'react-i18next';
import TemplateDetail from './TemplateDetail';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import FunctionCreateData from '../FunctionCreate.data';
import { Link, DetailsListLayoutMode, SelectionMode, CheckboxVisibility, IColumn, Selection, SearchBox } from 'office-ui-fabric-react';
import DisplayTableWithCommandBar from '../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { templateListStyle, templateListNameColumnStyle, filterTextFieldStyle, containerStyle } from '../FunctionCreate.styles';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../../common/CreateFunctionFormBuilder';
import { FormikProps } from 'formik';
import { ArmObj } from '../../../../../models/arm-obj';
import { HostStatus } from '../../../../../models/functions/host-status';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import StringUtils from '../../../../../utils/string';
import { RuntimeExtensionMajorVersions } from '../../../../../models/functions/runtime-extension';
import { sortTemplate } from '../FunctionCreate.types';

export interface TemplateListProps {
  resourceId: string;
  formProps: FormikProps<CreateFunctionFormValues>;
  setBuilder: (builder?: CreateFunctionFormBuilder) => void;
  setSelectedTemplate: (template?: FunctionTemplate) => void;
  selectedTemplate?: FunctionTemplate;
  builder?: CreateFunctionFormBuilder;
}

const TemplateList: React.FC<TemplateListProps> = props => {
  const { resourceId, formProps, setBuilder, builder, selectedTemplate, setSelectedTemplate } = props;
  const { t } = useTranslation();

  const [templates, setTemplates] = useState<FunctionTemplate[] | undefined | null>(undefined);
  const [filter, setFilter] = useState('');
  const [hostStatus, setHostStatus] = useState<ArmObj<HostStatus> | undefined>(undefined);

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
    await getTemplates();
  };

  const getHostStatus = async () => {
    const hostStatusResponse = await FunctionsService.getHostStatus(resourceId);
    if (hostStatusResponse.metadata.success) {
      setHostStatus(hostStatusResponse.data);
    } else {
      LogService.trackEvent(
        LogCategories.functionCreate,
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
        LogCategories.functionCreate,
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

    return <div>{item[column.fieldName!]}</div>;
  };

  const getColumns = () => {
    return [
      {
        key: 'template',
        name: t('template'),
        fieldName: 'template',
        minWidth: 100,
        maxWidth: 170,
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
    return !!templates
      ? templates
          .filter(template => {
            const lowerCasedFilterValue = !!filter ? filter.toLocaleLowerCase() : '';
            return (
              template.name.toLocaleLowerCase().includes(lowerCasedFilterValue) ||
              (template.description && template.description.toLocaleLowerCase().includes(lowerCasedFilterValue))
            );
          })
          .sort((templateA: FunctionTemplate, templateB: FunctionTemplate) => sortTemplate(templateA, templateB))
      : [];
  };

  const onItemInvoked = (item?: FunctionTemplate, index?: number) => {
    if (!!item) {
      setSelectedTemplate(item);
    }
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
        {/* TODO(krmitta): Add learn more link */}
        <Link>{t('learnMore')}</Link>
      </p>
      <SearchBox
        id="filter-template-text-field"
        className="ms-slideDownIn20"
        iconProps={{ iconName: 'Filter' }}
        styles={filterTextFieldStyle}
        placeholder={t('filter')}
        value={filter}
        onChange={newValue => setFilter(newValue)}
      />
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
        />
      ) : (
        <>{/**TODO (krmitta): Add Error Banner here**/}</>
      )}
      {!!selectedTemplate && (
        <TemplateDetail
          resourceId={resourceId}
          selectedTemplate={selectedTemplate}
          formProps={formProps}
          setBuilder={setBuilder}
          builder={builder}
        />
      )}
    </div>
  );
};

export default TemplateList;

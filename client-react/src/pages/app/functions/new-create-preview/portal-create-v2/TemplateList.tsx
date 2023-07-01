import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';

import { CheckboxVisibility, DetailsListLayoutMode, Link, MessageBarType, SelectionMode } from '@fluentui/react';

import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import DisplayTableWithCommandBar from '../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { SearchFilterWithResultAnnouncement } from '../../../../../components/form-controls/SearchBox';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { HostStatus } from '../../../../../models/functions/host-status';
import { Links } from '../../../../../utils/FwLinks';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { containerStyle, templateListStyle } from '../FunctionCreate.styles';

import TemplateDetail from './TemplateDetail';
import { useTemplateList } from './useTemplateList';

interface TemplateListProps {
  formProps: FormikProps<BindingEditorFormValues>;
  onTemplateSelect(template: FunctionTemplateV2): void;
  resourceId: string;
  hostStatus?: ArmObj<HostStatus>;
}

const TemplateList: React.FC<TemplateListProps> = ({ formProps, hostStatus, onTemplateSelect, resourceId }: TemplateListProps) => {
  const { t } = useTranslation();

  const { columns, disabled, filter, items, onRenderRow, selectedTemplate, selection, setFilter, templates } = useTemplateList(
    resourceId,
    onTemplateSelect,
    hostStatus
  );

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
        disabled={disabled}
        filter={filter}
        gridItemsCount={templates?.length ?? 0}
        placeHolder={t('filter')}
        setFilterValue={setFilter}
      />
      <DisplayTableWithCommandBar
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columns}
        className={templateListStyle}
        disableSelectionZone={disabled}
        emptyMessage={t('noResults')}
        isHeaderVisible
        items={items}
        layoutMode={DetailsListLayoutMode.justified}
        onRenderRow={onRenderRow}
        selection={selection.current}
        selectionMode={SelectionMode.single}
        selectionPreservedOnEmptyClick
        shimmer={{ lines: 2, show: !templates }}
      />
      {hostStatus && !hostStatus.properties.version.startsWith('1') && !hostStatus.properties.extensionBundle ? (
        <div>
          <CustomBanner
            learnMoreLink={Links.extensionBundlesRequiredLearnMore}
            message={t('functionCreate_extensionBundlesRequired')}
            type={MessageBarType.warning}
          />
        </div>
      ) : null}
      {selectedTemplate ? <TemplateDetail formProps={formProps} resourceId={resourceId} selectedTemplate={selectedTemplate} /> : null}
    </div>
  );
};

export default TemplateList;

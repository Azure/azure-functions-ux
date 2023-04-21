import { IDropdownOption, IDropdownProps, IDropdownStyles, ILinkStyles, IRenderFunction, Icon, Link } from '@fluentui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { Links } from '../../../../utils/FwLinks';
import Url from '../../../../utils/url';
import { useFunctionsQuery } from '../function/hooks/useFunctionsQuery';
import { useSiteConfigQuery } from '../function/hooks/useSiteConfigQuery';

const programmingModelDropdownStyles: Partial<IDropdownStyles> = {
  dropdown: {
    flex: '0 0 384px',
    maxWidth: '80%',
    width: '80%',
  },
  dropdownOptionText: {
    fontSize: '13px',
    lineHeight: '18px',
  },
  root: {
    alignItems: 'center',
    display: 'flex',
    flexFlow: 'row wrap',
    gap: 8,
    width: '80%',
  },
  title: {
    fontSize: '13px',
    lineHeight: '30px',
  },
};

const programmingModelLinkStyles: ILinkStyles = {
  root: {
    flex: '0 0 192px',
    fontSize: '13px',
    lineHeight: '30px',
  },
};

const enableNewProgrammingModel = !!Url.getFeatureValue(CommonConstants.FeatureFlags.enableNewProgrammingModel);

export function useProgrammingModel(resourceId: string) {
  const { t } = useTranslation();

  const { functions, programmingModel: selectedProgrammingModel } = useFunctionsQuery(resourceId);
  const { isPythonLanguage, pythonVersion } = useSiteConfigQuery(resourceId);

  /** @todo Check what versions of Python support the v2 programming model. */
  const isSupported = isPythonLanguage === undefined ? undefined : isPythonLanguage && pythonVersion === '3.10';

  const [programmingModelDisabled, setProgrammingModelDisabled] = useState(false);

  const [programmingModel, setProgrammingModel] = useState<number | string | null>(null);

  const onProgrammingModelChange = useCallback<NonNullable<IDropdownProps['onChange']>>((_, option?) => {
    if (option?.key) {
      setProgrammingModel(option.key);
    }
  }, []);

  const onProgrammingModelRenderLabel = useCallback<IRenderFunction<IDropdownProps>>(
    () => (
      <Link
        id="programming-model-label"
        href={Links.functionCreateProgrammingModelLearnMore}
        target="_blank"
        styles={programmingModelLinkStyles}>
        {`${t('programmingModel')} `}
        <Icon iconName="NavigateExternalInline" />
      </Link>
    ),
    [t]
  );

  const programmingModelOptions = useMemo<IDropdownOption<unknown>[]>(
    () => [
      { key: 1, text: t('v1ProgrammingModel') },
      { key: 2, text: t('v2ProgrammingModel') },
    ],
    [t]
  );

  const programmingModelVisible = enableNewProgrammingModel && isSupported;

  /** @note Do not disable or initialize the dropdown until all APIs have completed. */
  useEffect(() => {
    if (selectedProgrammingModel !== undefined && functions !== undefined && isSupported !== undefined) {
      /** @note Disable the dropdown if there is already a selected programming model. */
      setProgrammingModelDisabled(selectedProgrammingModel !== null);

      /** @note Initialize the dropdown to the selected programming model. Otherwise default to the new programming model is enabled and supported. Otherwise default to the old programming model. */
      setProgrammingModel(selectedProgrammingModel ?? (enableNewProgrammingModel && isSupported ? 2 : 1));
    }
  }, [selectedProgrammingModel, functions, isSupported]);

  return {
    onProgrammingModelChange,
    onProgrammingModelRenderLabel,
    programmingModel,
    programmingModelDisabled,
    programmingModelDropdownStyles,
    programmingModelOptions,
    programmingModelVisible,
  };
}

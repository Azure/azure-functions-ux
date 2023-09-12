import {
  IDropdownOption,
  IDropdownProps,
  IDropdownStyleProps,
  IDropdownStyles,
  ILinkStyles,
  IRenderFunction,
  IStyleFunctionOrObject,
  Icon,
  Link,
} from '@fluentui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../utils/CommonConstants';
import { Links } from '../../../../utils/FwLinks';
import { useAppSettingsQuery } from '../common/useAppSettingsQuery';
import { useFunctionsQuery } from '../function/hooks/useFunctionsQuery';
import { useSiteConfigQuery } from '../function/hooks/useSiteConfigQuery';
import Url from '../../../../utils/url';

const programmingModelDropdownStyles: IStyleFunctionOrObject<IDropdownStyleProps, IDropdownStyles> = ({ disabled, theme }) => {
  return {
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
    title: [
      {
        fontSize: '13px',
        lineHeight: '30px',
      },
      disabled && {
        backgroundColor: (theme as ThemeExtended)?.semanticColors.disabledControlBackground,
        border: '1px solid ${(theme as ThemeExtended)?.semanticColors.disabledText}',
        color: (theme as ThemeExtended)?.semanticColors.textColor,
        cursor: 'default',
      },
    ],
  };
};

const programmingModelLinkStyles: ILinkStyles = {
  root: {
    flex: '0 0 192px',
    fontSize: '13px',
    lineHeight: '30px',
  },
};

const enableNewNodeEditMode = !!Url.getFeatureValue(CommonConstants.FeatureFlags.enableNewNodeEditMode);

export function useProgrammingModel(resourceId: string) {
  const { t } = useTranslation();

  const { functions, programmingModel: selectedProgrammingModel } = useFunctionsQuery(resourceId);

  /** @note The v2 Python programming model is supported for all versions of Python supported on the ~4 runtime. */
  const { isPythonLanguage, language, siteConfig, version } = useSiteConfigQuery(resourceId);

  /** @note The v4 Node.js programming model is supported only for Node.js 18 on the ~4 runtime. */
  // Ignore `isNode18` when `linuxFxVersion` is not set.
  const isNode18 = !language || !version ? undefined : /^node$/i.test(language) && version === '18';

  // Ignore `isSupportedNodeVersion` when `FUNCTIONS_WORKER_RUNTIME` or `WEBSITE_NODE_DEFAULT_VERSION` app settings are missing.
  const { appSettings } = useAppSettingsQuery(resourceId);
  const workerRuntime = appSettings?.properties[CommonConstants.AppSettingNames.functionsWorkerRuntime];
  const websiteNodeDefaultVersion = appSettings?.properties[CommonConstants.AppSettingNames.websiteNodeDefaultVersion];
  const isSupportedNodeVersion =
    !workerRuntime || !websiteNodeDefaultVersion
      ? undefined
      : workerRuntime === WorkerRuntimeLanguages.nodejs && websiteNodeDefaultVersion === '~18';

  const isNode = isNode18 || isSupportedNodeVersion;

  const isSupported = isPythonLanguage === undefined ? undefined : isPythonLanguage || (enableNewNodeEditMode && isNode);

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

  const programmingModelVisible = isSupported;

  /** @note Do not disable or initialize the dropdown until all APIs have completed. */
  useEffect(() => {
    if (selectedProgrammingModel !== undefined && functions !== undefined && appSettings !== undefined && siteConfig !== undefined) {
      /** @note Disable the dropdown if there is already a selected programming model. */
      setProgrammingModelDisabled(selectedProgrammingModel !== null);

      /**
       * @note Initialize the dropdown to the selected programming model, if functions already exist.
       * Otherwise default to the v2 programming model, if supported (v4 Node.js or v2 Python).
       * Otherwise default to the v1 programming model.
       */
      if (selectedProgrammingModel) {
        setProgrammingModel(selectedProgrammingModel);
      } else {
        setProgrammingModel(isSupported ? 2 : 1);
      }
    }
  }, [appSettings, functions, isSupported, selectedProgrammingModel, siteConfig]);

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

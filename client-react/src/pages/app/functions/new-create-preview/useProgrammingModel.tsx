import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Icon,
  IDropdownOption,
  IDropdownProps,
  IDropdownStyleProps,
  IDropdownStyles,
  ILinkStyles,
  IRenderFunction,
  IStyleFunctionOrObject,
  Link,
} from '@fluentui/react';

import { ThemeExtended } from '../../../../theme/SemanticColorsExtended';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { Links } from '../../../../utils/FwLinks';
import { NationalCloudEnvironment } from '../../../../utils/scenario-checker/national-cloud.environment';
import Url from '../../../../utils/url';
import { useFunctionsQuery } from '../function/hooks/useFunctionsQuery';
import { useSiteConfigQuery } from '../function/hooks/useSiteConfigQuery';

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

export function useProgrammingModel(resourceId: string) {
  const { t } = useTranslation();

  const { functions, programmingModel: selectedProgrammingModel } = useFunctionsQuery(resourceId);
  const { isPythonLanguage } = useSiteConfigQuery(resourceId);

  /** @todo Add more checks when they go GA, e.g., Node.js, .NET. */
  const isSupported = isPythonLanguage;

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
    if (selectedProgrammingModel !== undefined && functions !== undefined && isSupported !== undefined) {
      /** @note Disable the dropdown if there is already a selected programming model. */
      setProgrammingModelDisabled(selectedProgrammingModel !== null);

      /**
       * @note Initialize the dropdown to the selected programming model, if functions already exist.
       * Otherwise default to the v2 programming model, if supported (Python only).
       * Otherwise default to the v1 programming model.
       */
      if (selectedProgrammingModel) {
        setProgrammingModel(selectedProgrammingModel);
      } else {
        setProgrammingModel(isSupported ? 2 : 1);
      }
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

import { IDropdownStyles, ILinkStyles, Icon, Link } from '@fluentui/react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Links } from '../../../../utils/FwLinks';

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

const programmingModelLinkStles: ILinkStyles = {
  root: {
    flex: '0 0 192px',
    fontSize: '13px',
    lineHeight: '30px',
  },
};

export function useProgrammingModel(initialDisabled = false, initialSelectedKey: number | string | null = null) {
  const { t } = useTranslation();
  const [programmingModelDisabled] = useState(initialDisabled);
  const [programmingModel, setProgrammingModel] = useState<number | string | null>(initialSelectedKey);

  const onProgrammingModelChange = useCallback((_, option?) => {
    if (option?.key) {
      setProgrammingModel(option.key);
    }
  }, []);

  const onProgrammingModelRenderLabel = useCallback(
    () => (
      <Link
        id="programming-model-label"
        href={Links.functionCreateProgrammingModelLearnMore}
        target="_blank"
        styles={programmingModelLinkStles}>
        {`${t('programmingModel')} `}
        <Icon iconName="NavigateExternalInline" />
      </Link>
    ),
    [t]
  );

  const programmingModelOptions = useMemo(
    () => [
      { key: 1, text: t('v1ProgrammingModel') },
      { key: 2, text: t('v2ProgrammingModel') },
    ],
    [t]
  );

  return {
    onProgrammingModelChange,
    onProgrammingModelRenderLabel,
    programmingModel,
    programmingModelDisabled,
    programmingModelDropdownStyles,
    programmingModelOptions,
  };
}

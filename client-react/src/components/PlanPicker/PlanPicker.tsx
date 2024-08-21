import { DefaultButton, IChoiceGroupOption, Icon, PrimaryButton } from '@fluentui/react';
import React, { createElement, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buttonFooterStyle,
  buttonPadding,
  descriptionStyle,
  gridContextPaneContainerStyle,
  iconStyle,
  planFeatureItemStyle,
  planFeaturesTitleStyle,
  radioButtonStyle,
  skuDescriptionStyle,
  skuTitleStyle,
} from '../../pages/static-app/skupicker/StaticSiteSkuPicker.styles';
import { ThemeContext } from '../../ThemeContext';
import RadioButtonNoFormik from '../form-controls/RadioButtonNoFormik';

interface PlanPickerProps {
  description?: React.ReactNode;
  footer: React.ReactNode;
  grid: React.ReactNode;
  header: React.ReactNode;
}

const PlanPicker: React.FC<PlanPickerProps> = ({ description, footer, grid, header }) => {
  return (
    <>
      {header}
      {description}
      {grid}
      {footer}
    </>
  );
};

interface PlanPickerAcceptIconProps {
  iconClassName?: string;
}

const PlanPickerAcceptIcon: React.FC<PlanPickerAcceptIconProps> = ({ iconClassName }) => {
  const theme = useContext(ThemeContext);
  const className = useMemo(() => iconClassName ?? iconStyle(theme), [iconClassName, theme]);

  return <Icon iconName="Accept" className={className} />;
};

interface PlanPickerDescriptionProps {
  children: React.ReactNode;
  className?: string;
  id: string;
}

const PlanPickerDescription: React.FC<PlanPickerDescriptionProps> = ({ children, className, id }) => {
  const descriptionClassName = useMemo(() => className ?? descriptionStyle, [className]);

  return (
    <div className={descriptionClassName} id={id}>
      {children}
    </div>
  );
};

enum PlanPickerFooterMode {
  save,
  select,
}

interface PlanPickerFooterProps {
  buttonClassName?: string;
  disabled: boolean;
  footerClassName?: string;
  mode: PlanPickerFooterMode;
  onCancelClick(): void;
  onOKClick(): void;
}

const PlanPickerFooter: React.FC<PlanPickerFooterProps> = ({
  buttonClassName,
  disabled,
  footerClassName,
  mode,
  onCancelClick,
  onOKClick,
}) => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const $buttonClassName = useMemo(() => buttonClassName ?? buttonPadding, [buttonClassName]);
  const $footerClassName = useMemo(() => footerClassName ?? buttonFooterStyle(theme), [footerClassName, theme]);
  const primaryButtonText = mode === PlanPickerFooterMode.select ? t('select') : t('save');

  return (
    <div className={$footerClassName}>
      <PrimaryButton
        ariaLabel={primaryButtonText}
        className={$buttonClassName}
        disabled={mode === PlanPickerFooterMode.save && disabled}
        text={primaryButtonText}
        onClick={onOKClick}
      />
      <DefaultButton text={t('cancel')} className={$buttonClassName} ariaLabel={t('cancel')} onClick={onCancelClick} />
    </div>
  );
};

interface PlanPickerGridProps {
  className?: string;
  header: React.ReactNode;
  rows: React.ReactNode;
}

const PlanPickerGrid: React.FC<PlanPickerGridProps> = ({ className, header, rows }) => {
  const gridClassName = useMemo(() => className ?? gridContextPaneContainerStyle, [className]);

  return (
    <div className={gridClassName}>
      {header}
      {rows}
    </div>
  );
};

interface PlanPickerGridHeaderRowProps {
  ariaLabel: string;
  className?: string;
  features: React.ReactNode;
  sections: React.ReactNode;
}

const PlanPickerGridHeaderRow: React.FC<PlanPickerGridHeaderRowProps> = ({ ariaLabel, className, features, sections }) => {
  const theme = useContext(ThemeContext);
  const headerRowClassName = useMemo(() => className ?? planFeaturesTitleStyle(theme), [className, theme]);

  return (
    <>
      <div className={headerRowClassName} aria-label={ariaLabel}>
        {features}
      </div>
      {sections}
    </>
  );
};

interface PlanPickerGridRowProps {
  title: React.ReactNode;
  titleClassName?: string;
  values: React.ReactNode[];
  valuesClassNames: string[];
  valuesKeys: string[];
}

const PlanPickerGridRow: React.FC<PlanPickerGridRowProps> = ({ title, titleClassName, values, valuesClassNames, valuesKeys }) => {
  const theme = useContext(ThemeContext);
  const gridRowTitleClassName = useMemo(() => titleClassName ?? planFeatureItemStyle(theme), [theme, titleClassName]);

  return (
    <>
      <div className={gridRowTitleClassName} aria-hidden={true}>
        {title}
      </div>
      {values.map((value, index) => (
        <div key={valuesKeys[index]} className={valuesClassNames[index]} aria-hidden={true}>
          {value}
        </div>
      ))}
    </>
  );
};

enum PlanPickerHeaderMode {
  choose,
  create,
}

interface PlanPickerHeaderProps {
  children: React.ReactNode;
  className: string;
  mode: PlanPickerHeaderMode;
}

const PlanPickerHeader: React.FC<PlanPickerHeaderProps> = ({ children, className, mode }) => {
  const tag: keyof React.ReactHTML = mode === PlanPickerHeaderMode.create ? 'h2' : 'h3';

  return createElement(tag, { className }, children);
};

interface PlanPickerTitleSectionProps {
  buttonAriaLabel: string;
  buttonClassName?: string;
  className: string;
  description: React.ReactNode;
  descriptionClassName?: string;
  id: string;
  name: string;
  selectedSku: string;
  sku: string;
  title: React.ReactNode;
  titleClassName?: string;
  onChange(e: React.FormEvent<HTMLElement>, configOption: IChoiceGroupOption): void;
}

const PlanPickerTitleSection: React.FC<PlanPickerTitleSectionProps> = ({
  buttonAriaLabel,
  buttonClassName,
  className,
  description,
  descriptionClassName,
  id,
  name,
  selectedSku,
  sku,
  title,
  titleClassName,
  onChange,
}) => {
  const options = useMemo(
    () => [
      {
        key: sku,
        text: '',
      },
    ],
    [sku]
  );
  const planDescriptionClassName = useMemo(() => descriptionClassName ?? skuDescriptionStyle, [descriptionClassName]);
  const planTitleClassName = useMemo(() => titleClassName ?? skuTitleStyle, [titleClassName]);
  const radioButtonClassName = useMemo(() => buttonClassName ?? radioButtonStyle, [buttonClassName]);

  return (
    <div className={className}>
      <div className={radioButtonClassName}>
        <RadioButtonNoFormik
          aria-label={buttonAriaLabel}
          id={id}
          name={name}
          options={options}
          selectedKey={selectedSku}
          onChange={onChange}
        />
      </div>
      <div className={planTitleClassName} aria-hidden={true}>
        {title}
      </div>
      <div className={planDescriptionClassName} aria-hidden={true}>
        {description}
      </div>
    </div>
  );
};

export default PlanPicker;
export {
  PlanPickerAcceptIcon,
  PlanPickerDescription,
  PlanPickerFooter,
  PlanPickerFooterMode,
  PlanPickerGrid,
  PlanPickerGridHeaderRow,
  PlanPickerGridRow,
  PlanPickerHeader,
  PlanPickerHeaderMode,
  PlanPickerTitleSection,
};

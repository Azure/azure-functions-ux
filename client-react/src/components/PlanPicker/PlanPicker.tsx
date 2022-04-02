import { DefaultButton, IChoiceGroupOption, PrimaryButton } from '@fluentui/react';
import React, { createElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RadioButtonNoFormik from '../form-controls/RadioButtonNoFormik';

interface PlanPickerProps {
  description: React.ReactNode;
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

interface PlanPickerDescriptionProps {
  children: React.ReactNode;
  className: string;
  id: string;
}

const PlanPickerDescription: React.FC<PlanPickerDescriptionProps> = ({ children, className, id }) => {
  return (
    <div className={className} id={id}>
      {children}
    </div>
  );
};

enum PlanPickerFooterMode {
  save,
  select,
}

interface PlanPickerFooterProps {
  buttonClassName: string;
  disabled: boolean;
  footerClassName: string;
  mode: PlanPickerFooterMode;
  onCancelClick(): void;
  onOKClick(): void;
}

const PlanPickerFooter: React.FC<PlanPickerFooterProps> = ({
  footerClassName,
  buttonClassName,
  disabled,
  mode,
  onCancelClick,
  onOKClick,
}) => {
  const { t } = useTranslation();
  const primaryButtonText = mode === PlanPickerFooterMode.select ? t('select') : t('save');
  return (
    <div className={footerClassName}>
      <PrimaryButton
        ariaLabel={primaryButtonText}
        className={buttonClassName}
        disabled={mode === PlanPickerFooterMode.save && disabled}
        text={primaryButtonText}
        onClick={onOKClick}
      />
      <DefaultButton text={t('cancel')} className={buttonClassName} ariaLabel={t('cancel')} onClick={onCancelClick} />
    </div>
  );
};

interface PlanPickerGridProps {
  className: string;
  header: React.ReactNode;
  rows: React.ReactNode;
}

const PlanPickerGrid: React.FC<PlanPickerGridProps> = ({ className, header, rows }) => {
  return (
    <div className={className}>
      {header}
      {rows}
    </div>
  );
};

interface PlanPickerGridHeaderRowProps {
  ariaLabel: string;
  className: string;
  features: React.ReactNode;
  sections: React.ReactNode;
}

const PlanPickerGridHeaderRow: React.FC<PlanPickerGridHeaderRowProps> = ({ ariaLabel, className, features, sections }) => {
  return (
    <>
      <div className={className} aria-label={ariaLabel}>
        {features}
      </div>
      {sections}
    </>
  );
};

interface PlanPickerGridRowProps {
  title: React.ReactNode;
  titleClassName: string;
  values: React.ReactNode[];
  valuesClassNames: string[];
  valuesKeys: string[];
}

const PlanPickerGridRow: React.FC<PlanPickerGridRowProps> = ({ title, titleClassName, values, valuesClassNames, valuesKeys }) => {
  return (
    <>
      <div className={titleClassName} aria-hidden={true}>
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
  const tag = mode === PlanPickerHeaderMode.create ? 'h2' : 'h3';
  return createElement(tag, { className }, children);
};

interface PlanPickerTitleSectionProps {
  buttonAriaLabel: string;
  buttonClassName: string;
  className: string;
  description: React.ReactNode;
  descriptionClassName: string;
  id: string;
  name: string;
  selectedSku: string;
  sku: string;
  title: React.ReactNode;
  titleClassName: string;
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

  return (
    <div className={className}>
      <div className={buttonClassName}>
        <RadioButtonNoFormik
          aria-label={buttonAriaLabel}
          id={id}
          name={name}
          options={options}
          selectedKey={selectedSku}
          onChange={onChange}
        />
      </div>
      <div className={titleClassName} aria-hidden={true}>
        {title}
      </div>
      <div className={descriptionClassName} aria-hidden={true}>
        {description}
      </div>
    </div>
  );
};

export default PlanPicker;
export {
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

import { IDropdownOption } from '@fluentui/react';
import { Field } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../components/form-controls/ReactiveFormControl';
import { VfsObject } from '../../../../../models/functions/vfs';
import { horizontalLabelStyle } from '../../common/BindingFormBuilder.styles';
import { useFiles } from './useFiles';

interface ExistingFileDropdownProps {
  id: string;
  label: string;
  required: boolean;
  resourceId: string;
  help?: string;
}

const ExistingFileDropdown: React.FC<ExistingFileDropdownProps> = ({
  id,
  help,
  label,
  required,
  resourceId,
}: ExistingFileDropdownProps) => {
  const { isLoading, options, validate } = useExistingFileDropdown(resourceId, required);

  return (
    <Field
      id={id}
      component={Dropdown}
      customLabelClassName={horizontalLabelStyle}
      customLabelStackClassName={horizontalLabelStyle}
      dirty={false}
      isLoading={isLoading}
      label={label}
      layout={Layout.Horizontal}
      mouseOverToolTip={help}
      name={id}
      onPanel
      options={options}
      required={required}
      resourceId={resourceId}
      validate={validate}
    />
  );
};

function useExistingFileDropdown(resourceId: string, required: boolean) {
  const { t } = useTranslation();

  const { getFileContent } = useFiles(resourceId);

  const [files, setFiles] = useState<VfsObject[]>();
  const [isLoading, setIsLoading] = useState(false);

  const options = useMemo<IDropdownOption<unknown>[] | undefined>(
    () =>
      files?.map(file => ({
        key: file.name,
        text: file.name,
      })),
    [files]
  );

  const validate = useCallback(
    (value?: string): string | undefined => {
      if (!value) {
        if (required) {
          return t('fieldRequired');
        }
      }
    },
    [required, t]
  );

  useEffect(() => {
    let isMounted = true;

    if (resourceId) {
      setIsLoading(true);
      getFileContent('')
        .then(objects => {
          if (isMounted) {
            if (Array.isArray(objects)) {
              setFiles(objects);
            }
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [getFileContent, resourceId]);

  return {
    isLoading,
    options,
    validate,
  };
}

export default ExistingFileDropdown;

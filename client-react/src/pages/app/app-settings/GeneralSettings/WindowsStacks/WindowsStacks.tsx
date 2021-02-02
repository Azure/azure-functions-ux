import { Field, FormikProps } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import DotNetStack from './DotNetStack';
import JavaStack from './JavaStack';
import PhpStack from './PhpStack';
import PythonStack from './PythonStack';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import { IDropdownOption } from 'office-ui-fabric-react';
import { RuntimeStacks } from '../../../../../utils/stacks-utils';

export type StackProps = FormikProps<AppSettingsFormValues>;

const WindowsStacks: React.FC<StackProps> = props => {
  const { values, initialValues } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const readonly = !app_write;
  const disableAllControls = readonly || !editable || saving;
  const javaSelected = values.currentlySelectedStack === RuntimeStacks.java;
  const showNonJavaAnyway = readonly && !javaSelected;

  const [initialStackDropdownValue, setInitialStackDropdownValue] = useState<string | undefined>(undefined);

  const supportedStacks = useContext(WebAppStacksContext);

  const filterStackOptions = (): IDropdownOption[] => {
    return supportedStacks
      .filter(stack => {
        const stackValue = stack.value.toLocaleLowerCase();
        // NOTE(krmitta): General Settings for Windows web app stacks only supports dotnet, python, php and java for now.
        // I will be adding the node support at a later time.
        return (
          stackValue === RuntimeStacks.java ||
          stackValue === RuntimeStacks.php ||
          stackValue === RuntimeStacks.python ||
          stackValue === RuntimeStacks.dotnet
        );
      })
      .map(stack => {
        return {
          key: stack.value.toLowerCase(),
          text: stack.displayText,
        };
      });
  };

  const setInitialDropdownValues = (values: AppSettingsFormValues) => {
    setInitialStackDropdownValue(
      values.currentlySelectedStack.toLowerCase() === RuntimeStacks.dotnetcore ? RuntimeStacks.dotnet : values.currentlySelectedStack
    );
  };

  useEffect(() => {
    setInitialDropdownValues(initialValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.currentlySelectedStack]);
  return (
    <>
      <Field
        name="currentlySelectedStack"
        dirty={values.currentlySelectedStack !== initialValues.currentlySelectedStack}
        component={Dropdown}
        fullpage
        disabled={disableAllControls}
        options={filterStackOptions()}
        label={t('stack')}
        id="app-settings-stack-dropdown"
        defaultSelectedKey={initialStackDropdownValue}
      />
      {values.currentlySelectedStack === RuntimeStacks.dotnet ||
      values.currentlySelectedStack === RuntimeStacks.dotnetcore ||
      showNonJavaAnyway ? (
        <DotNetStack {...props} />
      ) : null}
      {values.currentlySelectedStack === RuntimeStacks.php || showNonJavaAnyway ? <PhpStack {...props} /> : null}
      {values.currentlySelectedStack === RuntimeStacks.python || showNonJavaAnyway ? <PythonStack {...props} /> : null}
      {javaSelected ? <JavaStack {...props} /> : null}
    </>
  );
};

export default WindowsStacks;

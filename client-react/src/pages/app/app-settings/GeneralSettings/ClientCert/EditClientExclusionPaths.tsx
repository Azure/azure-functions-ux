import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '../../../../../components/IconButton/IconButton';
import { TextField } from 'office-ui-fabric-react';
import ActionBar from '../../../../../components/ActionBar';
import { newButtonOfficeFabricStyle, textBoxListStyle, textBoxInListStyle, textBoxInListDeleteButtonStyle } from '../../AppSettings.styles';

interface Props {
  clientExclusionPaths: string;
  save: (clientExclusionPaths: string) => void;
  cancel: () => void;
}
const EditClientExclusionPaths: React.FC<Props> = props => {
  const { clientExclusionPaths, save, cancel } = props;
  const [focusLast, setFocusLast] = useState(false);
  const [values, setValues] = useState(clientExclusionPaths ? clientExclusionPaths.split(';') : []);
  const { t } = useTranslation();
  let lastFieldRef: any;
  // This is a hook that is run after render if finished
  useEffect(() => {
    if (focusLast) {
      lastFieldRef.focus();
      setFocusLast(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusLast]);

  const removeItem = (index: number) => {
    setValues(values.filter((v, i) => i !== index));
  };

  const onChange = (index: number) => (e: any, newValue: string) => {
    const valuesCopy = [...values];
    valuesCopy[index] = newValue;
    setValues(valuesCopy);
  };
  const createNewItem = () => {
    setFocusLast(true);
    setValues([...values, '']);
  };

  const actionBarPrimaryButtonProps = {
    id: 'save',
    title: t('ok'),
    onClick: () => {
      save(values.join(';'));
    },
    disable: false,
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: cancel,
    disable: false,
  };
  return (
    <>
      <ActionButton
        id="app-settings-new-client-exclusion-path"
        onClick={createNewItem}
        styles={newButtonOfficeFabricStyle}
        iconProps={{ iconName: 'Add' }}>
        {t('newPath')}
      </ActionButton>
      <ol>
        {values.map((value, index) => (
          <li key={index} className={textBoxListStyle}>
            <div className={textBoxInListStyle}>
              <TextField
                componentRef={field => {
                  lastFieldRef = field;
                }}
                value={value}
                onChange={onChange(index)}
                label=""
                id={`app-settings-exclusion-path-text-${index}`}
                ariaLabel={t('defaultDocuments')}
                underlined
                {...props}
              />
            </div>
            <IconButton
              id={`app-settings-exclusion-path-delete-${index}`}
              className={textBoxInListDeleteButtonStyle}
              iconProps={{ iconName: 'Delete' }}
              title={t('delete')}
              onClick={() => removeItem(index)}
            />
          </li>
        ))}
      </ol>
      <ActionBar
        id="exclusion-path-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
      />
    </>
  );
};

export default EditClientExclusionPaths;

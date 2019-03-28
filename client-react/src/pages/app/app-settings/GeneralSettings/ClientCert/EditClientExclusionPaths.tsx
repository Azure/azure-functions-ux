import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '../../../../../components/IconButton/IconButton';
import { TextField } from 'office-ui-fabric-react';
import ActionBar from '../../../../../components/ActionBar';

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
  });

  const removeItem = (index: number) => {
    setValues(values.splice(index, 1));
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
    title: t('update'),
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
        styles={{ root: { marginTop: '5px' } }}
        iconProps={{ iconName: 'Add' }}>
        {t('newPath')}
      </ActionButton>
      <ol>
        {values.map((value, index) => (
          <li key={index} style={{ marginBottom: '5px', marginLeft: '0px', listStyle: 'none' }}>
            <div
              style={{
                display: 'inline-block',
                width: 'calc(100% - 20px)',
              }}>
              <TextField
                componentRef={field => {
                  lastFieldRef = field;
                }}
                value={value}
                onChange={onChange(index)}
                label=""
                id={`app-settings-document-text-${index}`}
                ariaLabel={t('defaultDocuments')}
                underlined
                {...props}
              />
            </div>
            <IconButton
              id={`app-settings-document-delete-${index}`}
              style={{ display: 'inline-block', width: '16px' }}
              iconProps={{ iconName: 'Delete' }}
              title={t('delete')}
              onClick={() => removeItem(index)}
            />
          </li>
        ))}
      </ol>
      <ActionBar
        id="virtual-applications-edit-footer"
        primaryButton={actionBarPrimaryButtonProps}
        secondaryButton={actionBarSecondaryButtonProps}
      />
    </>
  );
};

export default EditClientExclusionPaths;

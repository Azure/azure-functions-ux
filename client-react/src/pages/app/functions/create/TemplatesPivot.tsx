import React from 'react';

// import { useTranslation } from 'react-i18next';
// import { Stack } from 'office-ui-fabric-react';
import { FunctionCreateProps } from './FunctionCreate';
import CreateCard from './CreateCard';
// import { ActionButton } from 'office-ui-fabric-react';
// import { FormikProps } from 'formik';
// import { ThemeContext } from '../../../../ThemeContext';

const TemplatesPivot: React.FC<FunctionCreateProps> = props => {
  // const { t } = useTranslation();
  // const theme = useContext(ThemeContext);
  const { functionTemplates } = props;
  return (
    <>
      {!!functionTemplates &&
        functionTemplates.map(template => {
          if (template.metadata && template.metadata.name && template.metadata.language) {
            return <CreateCard functionTemplate={template} />;
          }
        })}
    </>
  );
};

export default TemplatesPivot;

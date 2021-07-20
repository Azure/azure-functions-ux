import React, { useState } from 'react';
import { Stack, IconButton, Link } from 'office-ui-fabric-react';
import { TextUtilitiesService } from '../../../../../../../utils/textUtilities';
import { style } from 'typestyle';
import { BindingDirection } from '../../../../../../../models/functions/binding';
import { useEffect } from 'react';
import { useContext } from 'react';
import { PortalContext } from '../../../../../../../PortalContext';
// import { useTranslation } from 'react-i18next';

const codeBoxStyles = style({
  border: '1px solid #E1DFDD',
  boxSizing: 'border-box',
  borderRadius: '2px',
  padding: '14px 18px',
  fontFamily: 'Consolas',
  whiteSpace: 'pre-wrap', // Supports newlines/tabs in the codeText
});

const CodeBox = props => {
  const { codeText } = props;
  return (
    <div className={codeBoxStyles}>
      <p>{codeText}</p>
    </div>
  );
};

interface ICosmosDbIntegrationProps {
  type: BindingDirection;
  resourceId: string | undefined;
  dbAcctName: string | undefined;
}

const CosmosDbIntegration = (props: ICosmosDbIntegrationProps) => {
  const { type, resourceId, dbAcctName } = props;
  // const { t } = useTranslation(); // TODO: implement localization when content is finalized
  const [codeText] = useState(`# placeholder text\n\n# ☆*:.｡.o(≧▽≦)o.｡.:*☆`);
  const [title, setTitle] = useState('');
  const [subtext] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nun in congue sapien, nec volutpat libero. Proin ut suscipit urna. Nunc commodo.'
  );
  const portalCommunicator = useContext(PortalContext);

  const copyToClipboard = () => {
    TextUtilitiesService.copyContentToClipboard((codeText as string) || '');
  };

  const goToCosmosDatabaseAccountBlade = () => {
    if (!resourceId || !dbAcctName) return;

    const rscIdPrefix = resourceId.split('/Microsoft.Web')[0];

    portalCommunicator.openBlade(
      {
        // TODO: May need to account for different Cosmos DB account *types*
        detailBlade: 'DatabaseAccountTemplateBladeForGlobalDb',
        // TODO: May (or may not) need to account for CDB accounts in different subscriptions/resource groups than the function
        detailBladeInputs: { id: `${rscIdPrefix}/Microsoft.DocumentDB/databaseAccounts/${dbAcctName}` },
        extension: 'Microsoft_Azure_DocumentDB',
      },
      'databaseAccountBlade'
    );
  };

  useEffect(() => {
    if (type === BindingDirection.trigger) {
      setTitle('Cosmos DB Trigger');
    } else if (type === BindingDirection.in) {
      setTitle('Cosmos DB input');
    } else {
      setTitle('Cosmos DB output');
    }
  }, []);

  return (
    <div key={`cosmosDb-${type}`}>
      <h3>{title}</h3>
      <p>{subtext}</p>

      <CodeBox codeText={codeText} />
      <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
        <Stack horizontal verticalAlign="center">
          <IconButton iconProps={{ iconName: 'Copy' }} onClick={copyToClipboard} />
          <span>Copy</span>
        </Stack>

        <Link onClick={goToCosmosDatabaseAccountBlade}>Go to your Cosmos DB account</Link>
      </Stack>
    </div>
  );
};

export default CosmosDbIntegration;

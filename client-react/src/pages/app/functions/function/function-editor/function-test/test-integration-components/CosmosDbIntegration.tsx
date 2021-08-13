import React, { useState } from 'react';
import { Stack, IconButton, Link } from 'office-ui-fabric-react';
import { TextUtilitiesService } from '../../../../../../../utils/textUtilities';
import { BindingDirection } from '../../../../../../../models/functions/binding';
import { useEffect } from 'react';
import { useContext } from 'react';
import { PortalContext } from '../../../../../../../PortalContext';
import { codeBoxStyles } from './CommonTestIntegration.styles';
import { useTranslation } from 'react-i18next';

const TestIntegrationInstructions = props => {
  const { codeText } = props;
  return (
    <div className={codeBoxStyles}>
      <code>{codeText}</code>
    </div>
  );
};

interface ICosmosDbIntegrationProps {
  type: BindingDirection;
  resourceId?: string;
  dbAcctName?: string;
}

const CosmosDbIntegration = (props: ICosmosDbIntegrationProps) => {
  const { type, resourceId, dbAcctName } = props;
  const { t } = useTranslation();
  const [codeText] = useState(`# placeholder text\n\n# ☆*:.｡.o(≧▽≦)o.｡.:*☆`);
  const [title, setTitle] = useState('');
  const [subtext] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nun in congue sapien, nec volutpat libero. Proin ut suscipit urna. Nunc commodo.'
  );
  const portalCommunicator = useContext(PortalContext);

  const copyToClipboard = () => {
    TextUtilitiesService.copyContentToClipboard((codeText as string) || '');
  };

  const getRscIdForCosmosDbAcct = () => {
    if (!resourceId || !dbAcctName) return;

    const rscIdPrefix = resourceId.split('/Microsoft.Web')[0];
    return `${rscIdPrefix}/Microsoft.DocumentDB/databaseAccounts/${dbAcctName}`;
  };

  const goToCosmosDatabaseAccountBlade = () => {
    if (!resourceId || !dbAcctName) return;

    portalCommunicator.openBlade(
      {
        // TODO: May need to account for different Cosmos DB account *types*
        detailBlade: 'DatabaseAccountTemplateBladeForGlobalDb',
        // TODO: May (or may not) need to account for CDB accounts in different subscriptions/resource groups than the function
        detailBladeInputs: { id: getRscIdForCosmosDbAcct() },
        extension: 'Microsoft_Azure_DocumentDB',
      },
      'databaseAccountBlade'
    );
  };

  useEffect(() => {
    if (type === BindingDirection.trigger) {
      setTitle(t('cosmosDbTrigger'));
    } else if (type === BindingDirection.in) {
      setTitle(t('cosmosDbInput'));
    } else {
      setTitle(t('cosmosDbOutput'));
    }
  }, []);

  return (
    <div key={`cosmosDb-${type}`}>
      <h3>{title}</h3>
      <p>{subtext}</p>
      <TestIntegrationInstructions codeText={codeText} />
      <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
        <Stack horizontal verticalAlign="center">
          <IconButton iconProps={{ iconName: 'Copy' }} onClick={copyToClipboard} />
          <span>{t('copypre_copy')}</span>
        </Stack>

        <Link onClick={goToCosmosDatabaseAccountBlade}>Go to your Cosmos DB account</Link>
      </Stack>
    </div>
  );
};

export default CosmosDbIntegration;

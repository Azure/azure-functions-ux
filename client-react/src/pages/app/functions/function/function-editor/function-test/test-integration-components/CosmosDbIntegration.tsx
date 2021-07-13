import React, { useState } from 'react';
import { Stack, IconButton, Link } from 'office-ui-fabric-react';
import { TextUtilitiesService } from '../../../../../../../utils/textUtilities';
import { style } from 'typestyle';
import { BindingDirection } from '../../../../../../../models/functions/binding';
import { useEffect } from 'react';
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
}

const CosmosDbIntegration = (props: ICosmosDbIntegrationProps) => {
  const { type } = props;
  // const { t } = useTranslation(); // TODO: implement localization when content is finalized
  const [codeText] = useState(`# placeholder text\n\n# ☆*:.｡.o(≧▽≦)o.｡.:*☆`);
  const [title, setTitle] = useState('');
  const [subtext] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nun in congue sapien, nec volutpat libero. Proin ut suscipit urna. Nunc commodo.'
  );

  const copyToClipboard = () => {
    TextUtilitiesService.copyContentToClipboard((codeText as string) || '');
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

        <Link href="">Go to your Cosmos DB account</Link>

        {/* TODO: see if Link here can open new blade, otherwise open in new tab
                    
                    The below function may give some clues:

                    const getEventGridSubscriptionUrl = (code: string) => {
                        const eventGridSubscriptionUrlEndPoint =
                        !!runtimeVersion && runtimeVersion === RuntimeExtensionMajorVersions.v1
                            ? CommonConstants.EventGridSubscriptionEndpoints.v1
                            : CommonConstants.EventGridSubscriptionEndpoints.v2;
                        return !!siteStateContext.site
                        ? `${Url.getMainUrl(siteStateContext.site)}/${eventGridSubscriptionUrlEndPoint}?functionName=${
                            functionInfo.properties.name
                            }&code=${code}`
                        : '';
                    };
                    
                */}
      </Stack>
    </div>
  );
};

export default CosmosDbIntegration;

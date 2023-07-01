import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import KeyVaultService from '../../../ApiHelpers/KeyVaultService';
import InformationLabel from '../../../components/InformationLabel/InformationLabel';
import { Reference } from '../../../models/site/config';
import { PortalContext } from '../../../PortalContext';
import { SiteStateContext } from '../../../SiteState';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../ThemeContext';
import { ArmSubcriptionDescriptor } from '../../../utils/resourceDescriptors';
import Url from '../../../utils/url';

import { bladeLinkStyle } from './AppSettings.styles';
import { ReferenceStatus } from './AppSettings.types';
import {
  getReferenceStatus,
  getReferenceStatusIconProps,
  isKeyVaultReferenceUnResolved as isReferenceUnResolved,
} from './AppSettingsFormData';

export interface ReferenceComponentProps {
  appSettingReference: Reference;
  resourceId: string;
}

const elementWrapperStyle = (theme: ThemeExtended) =>
  style({
    borderTop: `1px solid ${theme.palette.neutralDark}`,
    marginTop: '40px',
    paddingTop: '20px',
  });

const ReferenceComponent: React.FC<ReferenceComponentProps> = props => {
  const { t } = useTranslation();
  const [referenceResourceId, setReferenceResourceId] = useState<string | undefined>(undefined);
  const [initialLoading, setInitialLoading] = useState(true);
  const { resourceId, appSettingReference } = props;
  const { status, vaultName = '', secretName = '', secretVersion = '', details, identityType = '' } = appSettingReference;

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);

  const isValidValue = (value: string): boolean => {
    return !!value && value.length > 0;
  };

  const getIdentityValue = (): string => {
    return identityType.toLocaleLowerCase() === 'userassigned' ? 'User' : 'System';
  };

  const detailsHeadingValue = appSettingReference.secretName ? t('keyVaultReferenceDetails') : t('appConfigurationReferenceDetails');

  const appReferenceHeaderStyle = style({
    textDecoration: 'none',
  });

  const vaultNameUri = vaultName ? `https://${vaultName}.vault.azure.net/` : '';
  const secretNameUri = secretName ? `${vaultNameUri}secrets/${secretName}/` : '';
  const secretVersionUri = secretVersion ? `${secretNameUri}/${secretVersion}` : '';

  /**
   * TODO: [krmitta] Move this to separate file while making the changes for the WI: Task 5460706
   */
  const fetchKeyVaultData = async () => {
    const armSubcriptionDescriptor = new ArmSubcriptionDescriptor(resourceId);
    if (vaultNameUri) {
      const keyVaultReference = await KeyVaultService.fetchKeyVaultReference(armSubcriptionDescriptor.getSubsriptionId(), vaultNameUri);
      if (keyVaultReference && keyVaultReference[0]) {
        setReferenceResourceId(keyVaultReference[0].id);
      }
    }
    setInitialLoading(false);
  };

  const onVaultNameClick = async () => {
    if (referenceResourceId) {
      await portalContext.openBlade({
        detailBlade: 'VaultBlade',
        detailBladeInputs: { id: referenceResourceId },
        extension: 'Microsoft_Azure_KeyVault',
      });
    }
  };

  const onSecretNameClick = async () => {
    if (referenceResourceId) {
      await portalContext.openBlade({
        detailBlade: 'ListSecretVersionsBlade',
        detailBladeInputs: { id: secretNameUri, vaultId: referenceResourceId },
        extension: 'Microsoft_Azure_KeyVault',
      });
    }
  };

  const onSecretVersionClick = async () => {
    if (referenceResourceId) {
      await portalContext.openBlade({
        detailBlade: 'SecretVersionBlade',
        detailBladeInputs: { id: secretVersionUri, vaultId: referenceResourceId },
        extension: 'Microsoft_Azure_KeyVault',
      });
    }
  };

  const getStatusLabel = () => {
    if (getReferenceStatus(appSettingReference) === ReferenceStatus.initialized && !!siteStateContext.site) {
      const scmUri = Url.getScmUrl(siteStateContext.site);
      return (
        <InformationLabel
          value={t('keyVaultReferenceInitializedStatus')}
          id="key-status"
          label={t('status')}
          labelProps={getReferenceStatusIconProps(appSettingReference)}
          linkWithLabel={{
            href: scmUri,
            value: t('clickHereToAccessSite'),
          }}
        />
      );
    } else {
      return (
        <InformationLabel
          value={status}
          id="key-status"
          label={t('status')}
          labelProps={getReferenceStatusIconProps(appSettingReference)}
        />
      );
    }
  };

  useEffect(() => {
    fetchKeyVaultData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initialLoading) {
    return <></>;
  }

  return (
    <>
      <div id="app-settings-key-vault" className={elementWrapperStyle(theme)}>
        <h3 className={appReferenceHeaderStyle}>{detailsHeadingValue}</h3>
        <div>
          {isValidValue(vaultName) && (
            <InformationLabel
              value={vaultName}
              id="key-vault-name"
              className={referenceResourceId ? bladeLinkStyle(theme) : ''}
              onClick={() => {
                if (referenceResourceId) {
                  onVaultNameClick();
                }
              }}
              label={t('keyVaultName')}
            />
          )}
          {isValidValue(secretName) && (
            <InformationLabel
              value={secretName}
              id="key-secret-name"
              className={referenceResourceId ? bladeLinkStyle(theme) : ''}
              onClick={() => {
                if (referenceResourceId) {
                  onSecretNameClick();
                }
              }}
              label={t('keyVaultSecretName')}
            />
          )}
          {isValidValue(secretVersion) && (
            <InformationLabel
              value={secretVersion}
              id="key-secret-version"
              className={referenceResourceId ? bladeLinkStyle(theme) : ''}
              onClick={() => {
                if (referenceResourceId) {
                  onSecretVersionClick();
                }
              }}
              label={t('keyVaultSecretVersion')}
            />
          )}
          {isValidValue(identityType) && (
            <InformationLabel value={`${getIdentityValue()} assigned managed identity`} id="key-identity" label={t('identity')} />
          )}
          {getStatusLabel()}
          {isReferenceUnResolved(appSettingReference) && (
            <InformationLabel value={details} id="key-error-details" label={t('errorDetails')} />
          )}
        </div>
      </div>
    </>
  );
};
export default ReferenceComponent;

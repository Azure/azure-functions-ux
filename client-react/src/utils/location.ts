import { isEqual } from 'lodash-es';

export function getCanonicalLocation(userFriendlyLocation?: string): string {
  return userFriendlyLocation
    ? userFriendlyLocation
        .replace(/\s+/g, '')
        .replace('(', '')
        .replace(')', '')
        .toLowerCase()
    : '';
}

export function isSameLocation(locationA?: string, locationB?: string): boolean {
  const canonicalLocationA = getCanonicalLocation(locationA);
  const canonicalLocationB = getCanonicalLocation(locationB);

  return isEqual(canonicalLocationA.toLocaleLowerCase(), canonicalLocationB.toLocaleLowerCase());
}

export function getUserFriendlyLocation(location: string): string {
  return locationsMap[location] || location;
}

const locationsMap: Record<string, string> = {
  brazilsouth: 'Brazil South',
  brazilsoutheast: 'Brazil Southeast',
  centralus: 'Central US',
  centraluseuap: 'Central US EUAP',
  eastus2: 'East US 2',
  eastus2euap: 'East US 2 EUAP',
  eastus: 'East US',
  japaneast: 'Japan East',
  japanwest: 'Japan West',
  northcentralus: 'North Central US',
  northcentralusstage: 'North Central US (Stage)',
  northeurope: 'North Europe',
  southeastasia: 'Southeast Asia',
  eastasia: 'East Asia',
  westeurope: 'West Europe',
  westus: 'West US',
  francecentral: 'France Central',
  francesouth: 'France South',
  australiasoutheast: 'Australia Southeast',
  australiaeast: 'Australia East',
  australiacentral: 'Australia Central',
  australiacentral2: 'Australia Central 2',
  southcentralus: 'South Central US',
  westindia: 'West India',
  centralindia: 'Central India',
  southindia: 'South India',
  ukwest: 'UK West',
  uksouth: 'UK South',
  westcentralus: 'West Central US',
  canadacentral: 'Canada Central',
  canadaeast: 'Canada East',
  koreacentral: 'Korea Central',
  koreasouth: 'Korea South',
  westus2: 'West US 2',
  westus3: 'West US 3',
  southafricanorth: 'South Africa North',
  switzerlandnorth: 'Switzerland North',
  germanywestcentral: 'Germany West Central',
  uaecentral: 'UAE Central',
  uaenorth: 'UAE North',
  germanynorth: 'Germany North',
  norwayeast: 'Norway East',
  norwaywest: 'Norway West',
  swedencentral: 'Sweden Central',
  swedensouth: 'Sweden South',
  qatarcentral: 'Qatar Central',
  malaysiasouth: 'Malaysia South',
  polandcentral: 'Poland Central',
  //FairFax
  usdodcentral: 'USDoD Central',
  usdodeast: 'USDoD East',
  usgovarizona: 'USGov Arizona',
  usgoviowa: 'USGov Iowa',
  usgovtexas: 'USGov Texas',
  usgovvirginia: 'USGov Virginia',
  //Mooncake
  chinanorth: 'China North',
  chinaeast: 'China East',
  chinanorth2: 'China North 2',
  chinaeast2: 'China East 2',
  chinanorth3: 'China North 3',
  chinaeast3: 'China East 3',

  //USNat
  usnateast: 'USNat East',
  usnatwest: 'USNat West',
  //USSec
  usseceast: 'USSec East',
  ussecwest: 'USSec West',
};

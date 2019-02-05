export interface VSORepo {
  remoteUrl: string;
  name: string;
  project: VsoProject;
  id: string;
}

export interface VSOAccount {
  isAccountOwner: boolean;
  accountName: string;
  accountId: string;
  accountTenantId: string;
}

export interface VsoProject {
  id: string;
  name: string;
  url: string;
  collection: Collection;
  state: string;
  defaultTeam: DefaultTeam;
  revision: number;
  capabilities: Capabilities;
  visibility: string;
}

interface Capabilities {
  processTemplate: ProcessTemplate;
  versioncontrol: Versioncontrol;
}

interface Versioncontrol {
  sourceControlType: string;
  gitEnabled: string;
  tfvcEnabled: string;
}

interface ProcessTemplate {
  templateName: string;
  templateTypeId: string;
}

interface DefaultTeam {
  id: string;
  name: string;
  url: string;
}

interface Collection {
  id: string;
  name: string;
  url: string;
  collectionUrl: string;
}

export interface PublishingUser {
  publishingUserName: string;
  publishingPassword: string;
  name?: string;
  publishingPasswordHash?: string;
  publishingPasswordHashSalt?: string;
  metadata?: any;
  isDeleted?: boolean;
  scmUri?: string;
}

export interface PublishingCredentials {
  name: string;
  publishingUserName: string;
  publishingPassword: string;
  scmUri: string;
}

export enum PublishMethod {
  MSDeploy = 'MSDeploy',
  FTP = 'FTP',
}

// NOTE(michinoy): The publishing profile interface and helper has been copied over from the angular codebase.
// Am not fully sure regarding the details on implementation. Would like to keep it similar as I port over the
// functionality. I can optimize later as needed.

export interface PublishingProfile {
  msdeploySite: string;
  profileName: string;
  publishMethod: PublishMethod;
  publishUrl: string;
  userName: string;
  userPWD: string;
}

export function parsePublishProfileXml(profileXmlString: string): PublishingProfile[] {
  const oParser = new DOMParser();
  const oDOM = oParser.parseFromString(profileXmlString, 'text/xml');
  const publishProfileElements = oDOM.getElementsByTagName('publishProfile');
  const itemCount = publishProfileElements.length;
  const publishProfileItems: any = [];
  for (let i = 0; i < itemCount; i = i + 1) {
    const item = publishProfileElements.item(i);
    const attributes = item ? item.attributes : new NamedNodeMap();
    const attributeItem = {};
    for (let j = 0; j < attributes.length; j = j + 1) {
      const attr = attributes.item(j);
      if (attr) {
        attributeItem[attr.name] = attr.value;
      }
    }
    publishProfileItems.push(attributeItem);
  }
  return publishProfileItems;
}

export class PublishingProfile {
  msdeploySite: string;
  profileName: string;
  publishMethod: 'MSDeploy' | 'FTP';
  publishUrl: string;
  userName: string;
  userPWD: string;

  static parsePublishProfileXml(profileXmlString: string): PublishingProfile[] {
    const oParser = new DOMParser();
    const oDOM = oParser.parseFromString(profileXmlString, 'text/xml');
    const publishProfileElements = oDOM.getElementsByTagName('publishProfile');
    const itemCount = publishProfileElements.length;
    const PublishProfileItems: any = [];
    for (let i = 0; i < itemCount; i++) {
      const item = publishProfileElements.item(i);
      const attributes = item.attributes;
      const attributeItem = {};
      for (let j = 0; j < attributes.length; j++) {
        const attr = attributes.item(j);
        attributeItem[attr.name] = attr.value;
      }
      PublishProfileItems.push(attributeItem);
    }
    return PublishProfileItems;
  }
}

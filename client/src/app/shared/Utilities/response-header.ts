export class ResponseHeader {
  // For certain APIs (github, docker, and ACR) the next link is part of the response header
  // in "link" property. This property contains an array of links along with their link relation (rel=)
  // the links could be 'next', 'last', etc.
  public static getLinksFromLinkHeader(linksHeader: string[]): { [key: string]: string } {
    const links: { [key: string]: string } = {};

    if (linksHeader) {
      // Parse each part into a named link
      linksHeader.forEach(part => {
        const section = part.split(';');
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      });
    }

    return links;
  }
}

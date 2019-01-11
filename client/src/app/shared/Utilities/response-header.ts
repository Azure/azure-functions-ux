export class ResponseHeader {
  // For certain APIs (github, docker, and ACR) the next
  public static getLinksFromLinkHeader(linksHeader: string[]): { [key: string]: string } {
    const links: { [key: string]: string } = {};
    // Parse each part into a named link
    linksHeader.forEach(part => {
      const section = part.split(';');
      const url = section[0].replace(/<(.*)>/, '$1').trim();
      const name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });
    return links;
  }
}

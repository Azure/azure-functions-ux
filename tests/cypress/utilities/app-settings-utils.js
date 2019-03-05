/// <reference types="Cypress" />

export function startVisit(siteName) {
  const baseFixtures = cy
    .server()
    .fixture('resources.json')
    .as('resourcesJSON')
    .route('**/api/resources**', '@resourcesJSON');

  return baseFixtures;
}

export abstract class Dependency {
  updateTag() {} // Calls into discoverResourceId to get resourceId and sets it in Tags property for resource

  getTag() {}

  abstract discoverResourceId();
}

export class AppInsightsDependency extends Dependency {
  discoverResourceId() {
    // queries app settings and ARG to get resourceId and returns that to the parent
  }
}

export class AcrDependency extends Dependency {
  discoverResourceId() {
    // queries for ACR instance and returns resourceId
  }
}

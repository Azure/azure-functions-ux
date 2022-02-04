import Url from './url';

export class FlightingUtil {
  public static features = {
    EnableEditingForLinuxNodePython: 'EnableEditingForLinuxNodePython',
  };

  private static _config = {};

  /*
   * Subscription = hash key
   * Seed is a wild card to make sure that the same subscriptions aren't used to flight every feature, this can vary on each feature
   * percent of users should be a number between 1 and 99 to represent the percentage of users that should hit the feature.
   *
   */
  static checkSubscriptionInFlight(subscription: string, feature: string): boolean {
    if (!feature) {
      throw new Error(`Flighted feature must be specified`);
    }

    const config = this._config[feature];
    if (!config) {
      throw new Error(`'${feature}' is not a valid flighted feature`);
    }

    if (config.percentofUsers > 100) {
      throw new Error(`Percent of users can't be higher than 100%`);
    }

    if (!!Url.getFeatureValue(config.forceOffFlag)) {
      return false;
    }

    if (!!Url.getFeatureValue(config.forceOnFlag)) {
      return true;
    }

    if (config.percentofUsers === 100) {
      return true;
    }

    if (config.percentofUsers === 0) {
      return false;
    }

    const hash = this.murmurhash3_32_gc(subscription, config.seed);
    return hash % 100 < config.percentofUsers;
  }

  /**
   * JS Implementation of MurmurHash3 (r136)
   * @see http://github.com/garycourt/murmurhash-js
   * @see http://sites.google.com/site/murmurhash/
   *
   */

  private static murmurhash3_32_gc(key: string, seed: number) {
    let remainder, bytes, h1, h1b, c1, c2, k1, i;

    remainder = key.length & 3;
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
      k1 =
        (key.charCodeAt(i) & 0xff) |
        ((key.charCodeAt(++i) & 0xff) << 8) |
        ((key.charCodeAt(++i) & 0xff) << 16) |
        ((key.charCodeAt(++i) & 0xff) << 24);
      ++i;

      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
      h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
    }

    k1 = 0;

    switch (remainder) {
      case 3: {
        k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;

        // Similar as for remainder = 2
        k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;

        // Similar as for remainder = 1
        k1 ^= key.charCodeAt(i) & 0xff;
        k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
        break;
      }
      case 2: {
        k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;

        // Similar as for remainder = 1
        k1 ^= key.charCodeAt(i) & 0xff;
        k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
        break;
      }
      case 1: {
        k1 ^= key.charCodeAt(i) & 0xff;
        k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= k1;
        break;
      }
    }

    h1 ^= key.length;
    h1 ^= h1 >>> 16;
    h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }
}

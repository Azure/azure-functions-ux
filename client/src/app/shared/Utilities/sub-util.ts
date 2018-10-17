import { Subscription } from './../models/subscription';

export class SubUtil {
  public static subsChanged(subs1: Subscription[], subs2: Subscription[]): boolean {
    if (subs1.length !== subs2.length) {
      return true;
    }
    subs1.sort(this.compareSubs);
    subs2.sort(this.compareSubs);
    for (let i = 0; i < subs1.length; ++i) {
      if (this.differentSub(subs1[i], subs2[i])) {
        return true;
      }
    }
    return false;
  }

  public static compareSubs(sub1: Subscription, sub2: Subscription): number {
    if (sub1.subscriptionId > sub2.subscriptionId) {
      return 1;
    } else if (sub1.subscriptionId < sub2.subscriptionId) {
      return -1;
    }
    return 0;
  }

  public static differentSub(sub1: Subscription, sub2: Subscription): boolean {
    return sub1.subscriptionId !== sub2.subscriptionId || sub1.displayName !== sub2.displayName || sub1.state !== sub2.state;
  }
}

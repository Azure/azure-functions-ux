import MakeArmCall from './ArmHelper';
import { Subscriptions } from '../models/subscription';

export default class UserService {
  public static fetchSubscriptions = () => {
    const id = `/subscriptions`;
    return MakeArmCall<Subscriptions>({
      resourceId: id,
      commandName: 'fetchSubscriptionsd',
    });
  };
}

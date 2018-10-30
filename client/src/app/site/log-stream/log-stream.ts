import { ResourceId } from '../../shared/models/arm/arm-obj';

export interface LogStreamInput<T> {
  id: ResourceId;
  data?: T;
}

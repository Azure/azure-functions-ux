import { BindingDirection } from '../../../../../models/functions/binding';
import { BindingDirection as FunctionBindingDirection, BindingInfo } from '../../../../../models/functions/function-binding';

// Bindings uses 'trigger' as a direction, but functions.json does not
// These two functions convert between the two kinds
export const getBindingDirection = (bindingInfo: BindingInfo): BindingDirection => {
  if (bindingInfo.type.toLowerCase().indexOf('trigger') > -1) {
    return BindingDirection.trigger;
  }

  if (!bindingInfo.direction) {
    return BindingDirection.unknown;
  }

  return bindingInfo.direction === BindingDirection.in ? BindingDirection.in : BindingDirection.out;
};

export const getFunctionBindingDirection = (bindingDirection: BindingDirection): FunctionBindingDirection => {
  return bindingDirection === BindingDirection.out ? FunctionBindingDirection.out : FunctionBindingDirection.in;
};

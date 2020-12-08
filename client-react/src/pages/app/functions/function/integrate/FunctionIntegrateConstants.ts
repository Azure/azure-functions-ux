export class FunctionIntegrateConstants {
  public static readonly eventGridType: string = 'eventGridTrigger';
  public static readonly httpType: string = 'httpTrigger';

  public static readonly builtInBindingTypes: string[] = ['httpTrigger', 'timerTrigger', 'http'];

  public static readonly rulePrefix: string = 'rule-';

  public static readonly compiledFunctionConfigurationSource: string = 'attributes';
}

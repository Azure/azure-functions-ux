export class Tier {
  public static readonly free = 'Free';
  public static readonly shared = 'Shared';
  public static readonly basic = 'Basic';
  public static readonly standard = 'Standard';
  public static readonly premium = 'Premium';
  public static readonly premiumV2 = 'PremiumV2';
  public static readonly premiumContainer = 'PremiumContainer';
  public static readonly isolated = 'Isolated';
  public static readonly dynamic = 'Dynamic';
  public static readonly elasticPremium = 'ElasticPremium';
  public static readonly elasticIsolated = 'ElasticIsolated';
  public static readonly premiumV3 = 'PremiumV3';
  public static readonly premiumMV3 = 'PremiumMV3';
  public static readonly isolatedV2 = 'IsolatedV2';
  public static readonly workflowStandard = 'WorkflowStandard';
}

export class SkuCode {
  public static readonly Basic = {
    B1: 'B1',
    B2: 'B2',
    B3: 'B3',
  };

  public static readonly Free = {
    F1: 'F1',
  };

  public static readonly Shared = {
    D1: 'D1',
  };

  public static readonly Standard = {
    S1: 'S1',
    S2: 'S2',
    S3: 'S3',
  };

  public static readonly Premium = {
    P1: 'P1',
    P2: 'P2',
    P3: 'P3',
  };

  public static readonly PremiumContainer = {
    PC2: 'PC2',
    PC3: 'PC3',
    PC4: 'PC4',
  };

  public static readonly PremiumV2 = {
    P1V2: 'P1V2',
    P2V2: 'P2V2',
    P3V2: 'P3V2',
  };

  public static readonly Isolated = {
    I1: 'I1',
    I2: 'I2',
    I3: 'I3',
  };

  public static readonly ElasticPremium = {
    EP1: 'EP1',
    EP2: 'EP2',
    EP3: 'EP3',
    EP1CPU: 'EP1-C',
    EP1Memory: 'EP1-M',
    EP2CPU: 'EP2-C',
    EP2Memory: 'EP2-M',
    EP3CPU: 'EP3-C',
    EP3Memory: 'EP3-M',
  };

  public static readonly PremiumV3 = {
    P1V3: 'P1V3',
    P2V3: 'P2V3',
    P3V3: 'P3V3',
  };

  public static readonly IsolatedV2 = {
    I1V2: 'I1V2',
    I2V2: 'I2V2',
    I3V2: 'I3V2',
    I4V2: 'I4V2',
    I5V2: 'I5V2',
    I6V2: 'I6V2',
  };

  public static readonly WorkflowStandard = {
    WS1: 'WS1',
    WS2: 'WS2',
    WS3: 'WS3',
    WS1CPU: 'WS1-C',
    WS1Memory: 'WS1-M',
    WS2CPU: 'WS2-C',
    WS2Memory: 'WS2-M',
    WS3CPU: 'WS3-C',
    WS3Memory: 'WS3-M',
  };
}

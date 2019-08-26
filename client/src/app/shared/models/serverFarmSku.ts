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
    EPCPU: 'EP-C',
    EPMemory: 'EP-M',
  };
}

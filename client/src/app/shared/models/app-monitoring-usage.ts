export interface UsageVolume {
  times: string[];
  counts: number[]; // gbSec Consumption Data
  instanceCounts: number[]; // number of function Instances
}

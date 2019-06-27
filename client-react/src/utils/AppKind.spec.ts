import { AppKind } from './AppKind';
import { ArmObj } from '../models/arm-obj';

const armObj = (kind: string | null) =>
  ({
    kind,
  } as ArmObj<unknown>);
describe('hasKinds utility function', () => {
  it('has kinds works', () => {
    const haskinds = AppKind.hasKinds(armObj('app'), ['app']);
    expect(haskinds).toBe(true);
  });
  it('works if kind is null', () => {
    const haskinds = AppKind.hasKinds(armObj(null), ['app']);
    expect(haskinds).toBe(false);
  });
  it('works with multiple kinds', () => {
    const haskinds = AppKind.hasKinds(armObj('linux,functionapp'), ['linux', 'functionapp']);
    expect(haskinds).toBe(true);
  });
  it('works with multiple kinds but not all match', () => {
    const haskinds = AppKind.hasKinds(armObj('linux'), ['linux', 'functionapp']);
    expect(haskinds).toBe(false);
  });
});

describe('has any kind utility function', () => {
  it('base use works', () => {
    const haskinds = AppKind.hasAnyKind(armObj('app'), ['app']);
    expect(haskinds).toBe(true);
  });
  it('works if kind is null', () => {
    const haskinds = AppKind.hasAnyKind(armObj(null), ['app']);
    expect(haskinds).toBe(false);
  });
  it('works with multiple kinds', () => {
    const haskinds = AppKind.hasAnyKind(armObj('linux,functionapp'), ['linux', 'functionapp']);
    expect(haskinds).toBe(true);
  });
  it('works with multiple kinds checked but only one on app', () => {
    const haskinds = AppKind.hasAnyKind(armObj('linux'), ['linux', 'functionapp']);
    expect(haskinds).toBe(true);
  });
});

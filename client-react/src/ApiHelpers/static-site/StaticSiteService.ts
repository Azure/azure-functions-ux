import MakeArmCall from '../ArmHelper';
import { ArmObj } from '../../models/arm-obj';
import { StaticSite } from '../../models/static-site/static-site';
import { CommonConstants } from '../../utils/CommonConstants';
import { StaticSiteBasicAuth } from '../../models/static-site/basic-auth';

export default class StaticSiteService {
  public static getStaticSite = (resourceId: string) => {
    return MakeArmCall<ArmObj<StaticSite>>({
      resourceId,
      commandName: 'getStaticSite',
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static putStaticSite = (resourceId: string, body: any) => {
    return MakeArmCall<ArmObj<StaticSite>>({
      resourceId,
      method: 'PUT',
      commandName: 'putStaticSite',
      body: body,
      apiVersion: CommonConstants.ApiVersions.staticSitePreviewApiVersion20191201,
    });
  };

  public static patchStaticSite = (resourceId: string, body: any) => {
    return MakeArmCall<ArmObj<StaticSite>>({
      resourceId,
      method: 'PATCH',
      commandName: 'patchStaticSite',
      body: body,
      apiVersion: CommonConstants.ApiVersions.staticSiteApiVersion20201201,
    });
  };

  public static getStaticSiteBasicAuth = (resourceId: string, apiVersion = CommonConstants.ApiVersions.staticSiteApiVersion20210301) => {
    const url = `${resourceId}/config/basicAuth`;
    return MakeArmCall<ArmObj<StaticSiteBasicAuth>>({
      resourceId: url,
      method: 'GET',
      commandName: 'getStaticSiteBasicAuth',
      apiVersion,
    });
  };

  public static putStaticSiteBasicAuth = (
    resourceId: string,
    body: any,
    apiVersion = CommonConstants.ApiVersions.staticSiteApiVersion20210301
  ) => {
    const url = `${resourceId}/config/basicAuth`;
    return MakeArmCall<ArmObj<StaticSiteBasicAuth>>({
      resourceId: url,
      method: 'PUT',
      commandName: 'putStaticSiteBasicAuth',
      body,
      apiVersion,
    });
  };

  public static getStaticSiteSnippets = (resourceId: string, apiVersion = CommonConstants.ApiVersions.staticSiteApiVersion20220301) => {
    const url = `${resourceId}/snippets`;
    return MakeArmCall<ArmObj<any>>({
      resourceId: url,
      method: 'GET',
      commandName: 'getStaticSiteSnippets',
      apiVersion,
    });
  };

  public static putStaticSiteSnippets = (
    resourceId: string,
    body: any,
    apiVersion = CommonConstants.ApiVersions.staticSiteApiVersion20220301
  ) => {
    const url = `${resourceId}/snippets`;
    return MakeArmCall<ArmObj<any>>({
      resourceId: url,
      method: 'PUT',
      commandName: 'putStaticSiteSnippets',
      body,
      apiVersion,
    });
  };
}

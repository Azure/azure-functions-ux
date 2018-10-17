// NOTE(michinoy): Once the samples API is available, this entire file will be replaced with a get call to the samples API.
import { Injectable } from '@angular/core';
import { ContainerSample, ContainerOS, ContainerType } from '../container-settings';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../shared/models/portal-resources';
import { Observable } from 'rxjs/Observable';
import { ContainerConstants } from '../../../shared/models/constants';

export interface IContainerSamplesService {
  getQuickstartSamples(containerOS: ContainerOS, containerType: ContainerType): Observable<ContainerSample[]>;
}
@Injectable()
export class ContainerSamplesService implements IContainerSamplesService {
  private _samples: ContainerSample[] = [];

  constructor(private _ts: TranslateService) {
    this._loadSamples();
  }

  public getQuickstartSamples(containerOS: ContainerOS, containerType: ContainerType): Observable<ContainerSample[]> {
    // TODO (michinoy): Once the API is ready, the hardcoded list can be replaced with it.
    const samples = this._samples.filter(sample => sample.containerOS === containerOS && sample.containerType === containerType);
    return Observable.of(samples);
  }

  private _loadSamples() {
    this._samples = [
      this._getSingleContainerSample1Linux(),
      this._getSingleContainerSample2Linux(),
      this._getSingleContainerSample3Linux(),
      this._getSingleContainerSample1Windows(),
      this._getDockerComposeSample1Linux(),
      this._getDockerComposeSample2Linux(),
      this._getDockerComposeSample3Linux(),
      this._getKubernetesSample1Linux(),
      this._getKubernetesSample2Linux(),
    ];
  }

  private _getSingleContainerSample1Linux(): ContainerSample {
    return {
      name: 'sample1',
      title: this._ts.instant(PortalResources.singleContainerSample1TitleLinux),
      configBase64Encoded: this._getSingleContainerSample1ConfigLinux(),
      description: this._ts.instant(PortalResources.singleContainerSample1DescriptionLinux),
      containerType: 'single',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024559',
    };
  }

  private _getSingleContainerSample1ConfigLinux() {
    return btoa('nginx');
  }

  private _getSingleContainerSample2Linux(): ContainerSample {
    return {
      name: 'sample2',
      title: this._ts.instant(PortalResources.singleContainerSample2TitleLinux),
      configBase64Encoded: this._getSingleContainerSample2ConfigLinux(),
      description: this._ts.instant(PortalResources.singleContainerSample2DescriptionLinux),
      containerType: 'single',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024454',
    };
  }

  private _getSingleContainerSample2ConfigLinux() {
    return btoa('appsvcsample/python-helloworld');
  }

  private _getSingleContainerSample3Linux(): ContainerSample {
    return {
      name: 'sample3',
      title: this._ts.instant(PortalResources.singleContainerSample3TitleLinux),
      configBase64Encoded: this._getSingleContainerSample3ConfigLinux(),
      description: this._ts.instant(PortalResources.singleContainerSample3DescriptionLinux),
      containerType: 'single',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024495',
    };
  }

  private _getSingleContainerSample3ConfigLinux() {
    return btoa('appsvcsample/static-site');
  }

  private _getSingleContainerSample1Windows(): ContainerSample {
    return {
      name: 'sample1',
      title: this._ts.instant(PortalResources.singleContainerSample1TitleWindows),
      configBase64Encoded: this._getSingleContainerSample1ConfigWindows(),
      description: this._ts.instant(PortalResources.singleContainerSample1DescriptionWindows),
      containerType: 'single',
      containerOS: 'windows',
      sourceUrl: ContainerConstants.microsoftMcrUrl,
      learnMoreLink: '',
    };
  }

  private _getSingleContainerSample1ConfigWindows() {
    return btoa('mcr.microsoft.com/azure-app-service/samples/aspnethelloworld:latest');
  }

  private _getDockerComposeSample1Linux(): ContainerSample {
    return {
      name: 'sample1',
      title: this._ts.instant(PortalResources.dockerComposeSample1TitleLinux),
      configBase64Encoded: this._getDockerComposeSample1ConfigLinux(),
      description: this._ts.instant(PortalResources.dockerComposeSample1DescriptionLinux),
      containerType: 'dockerCompose',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024481',
    };
  }

  private _getDockerComposeSample1ConfigLinux() {
    return btoa(`version: '3'
services:
    web:
        image: "appsvcsample/flaskapp"
        # source code for this image repoe come from "Get started with Docker Compose" on docker.com
        ports:
            - "80:80"
    redis:
        image: "redis:alpine"`);
  }

  private _getDockerComposeSample2Linux(): ContainerSample {
    return {
      name: 'sample2',
      title: this._ts.instant(PortalResources.dockerComposeSample2TitleLinux),
      configBase64Encoded: this._getDockerComposeSample2ConfigLinux(),
      description: this._ts.instant(PortalResources.dockerComposeSample2DescriptionLinux),
      containerType: 'dockerCompose',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024385',
    };
  }

  private _getDockerComposeSample2ConfigLinux() {
    return btoa(`version: "3"
services:
    web:
        image: "appsvcsample/asp"
        # the source repo is at https://github.com/yiliaomsft/compose-asp-sql
        ports:
            - "8080:80"
        depends_on:
            - db
    db:
        image: "microsoft/mssql-server-linux"
        environment:
            SA_PASSWORD: "Your_password123"
            ACCEPT_EULA: "Y"`);
  }

  private _getDockerComposeSample3Linux(): ContainerSample {
    return {
      name: 'sample3',
      title: this._ts.instant(PortalResources.dockerComposeSample3TitleLinux),
      configBase64Encoded: this._getDockerComposeSample3ConfigLinux(),
      description: this._ts.instant(PortalResources.dockerComposeSample3DescriptionLinux),
      containerType: 'dockerCompose',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024463',
    };
  }

  private _getDockerComposeSample3ConfigLinux() {
    return btoa(`#  The source repo is at https://github.com/yiliaomsft/app-service-quickstart-docker-images/tree/master/wordpress-multi-container/0.1-fpm  #
#  Set Application settings:  WEBSITES_ENABLE_APP_SERVICE_STORAGE = true
#  During WordPress installation, please use a database hosted on Azure MySQL

version: "3.1"

services:
    wp-fpm:
        image: appsvcorg/wordpress-multi-container:0.1-fpm
        restart: always
        depends_on:
            - redis
        volumes:
            - \${WEBAPP_STORAGE_HOME}/site/wwwroot:/var/www/html
            - \${WEBAPP_STORAGE_HOME}/LogFiles/php:/var/log/php
        ports:
            - 2222:2222
        environment:
            # use local redis
            WP_REDIS_HOST: redis
            # SSL ENABLE SQL
            MYSQL_SSL_CA_PATH: '/'

    redis:
        image: redis:3-alpine
        restart: always

    nginx:
        image: appsvcorg/nginx-multi-container:0.1-wordpress-fpm
        restart: always
        depends_on:
            - wp-fpm
        ports:
            - 80:80
        volumes:
            - \${WEBAPP_STORAGE_HOME}/site/wwwroot:/var/www/html
            - \${WEBAPP_STORAGE_HOME}/LogFiles/nginx:/var/log/nginx`);
  }

  private _getKubernetesSample1Linux(): ContainerSample {
    return {
      name: 'sample1',
      title: this._ts.instant(PortalResources.kubernetesSample1TitleLinux),
      configBase64Encoded: this._getKubernetesSample1ConfigLinux(),
      description: this._ts.instant(PortalResources.kubernetesSample1DescriptionLinux),
      containerType: 'kubernetes',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024483',
    };
  }

  private _getKubernetesSample1ConfigLinux() {
    return btoa(`ApiVersion: v1
kind: Pod
metadata:
    name: python
spec:
    containers:
    - name: web
      image: appsvcsample/flaskapp:kube
      # source code for this image repo come from "Get started with Docker Compose" on docker.com
      ports:
      - containerPort: 80
    - name: redis
      image: redis:alpine`);
  }

  private _getKubernetesSample2Linux(): ContainerSample {
    return {
      name: 'sample2',
      title: this._ts.instant(PortalResources.kubernetesSample2TitleLinux),
      configBase64Encoded: this._getKubernetesSample2ConfigLinux(),
      description: this._ts.instant(PortalResources.kubernetesSample2DescriptionLinux),
      containerType: 'kubernetes',
      containerOS: 'linux',
      sourceUrl: ContainerConstants.dockerHubUrl,
      learnMoreLink: 'https://go.microsoft.com/fwlink/?linkid=2024468',
    };
  }

  private _getKubernetesSample2ConfigLinux() {
    return btoa(`apiVersion: v1
kind: Pod
metadata:
    name: wordpress
spec:
    containers:
    - name: wordpress
      image: microsoft/multicontainerwordpress
      ports:
      - containerPort: 80
    - name: redis
      image: redis:alpine`);
  }
}

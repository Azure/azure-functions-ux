import { UIFunctionConfig, UIFunctionBinding, DirectionType, BindingType, Binding } from './binding';
import { FunctionConfig } from './function-config';
import { Template } from './template-picker';
import { FunctionInfo } from '../models/function-info';
import { FunctionBinding } from './function-config';
import { PortalResources } from './portal-resources';
import { TranslateService } from '@ngx-translate/core';

export class BindingManager {

    public static getFunctionName(defaultName: string, functionsInfo: FunctionInfo[]): string {
        let i = 1;
        while (true) {
            const func = functionsInfo.find((value) => {
                return defaultName + i.toString() === value.name;
            });

            if (func) {
                i++;
            } else {
                return defaultName + i;
            }
        }
    }

    functionConfigToUI(config: FunctionConfig, bindings: Binding[]): UIFunctionConfig {
        const configUI = {
            schema: '',
            version: '',
            bindings: [],
            originalConfig: config
        };
     
        if (config.bindings) {

            config.bindings.forEach((b) => {
                const typeString: string = b.type;
                const type: BindingType = BindingManager.getBindingType(typeString);
                const behaviorString: string = b.direction;
                let direction: DirectionType = DirectionType[behaviorString];

                if (typeString) {
                    if ((DirectionType[behaviorString] === DirectionType.in) && (typeString.toLowerCase().indexOf('trigger') !== -1)) {
                        direction = DirectionType.trigger;
                    }
                }

                const bindingConfig = bindings.find((cb) => {
                    return (cb.direction === direction || (cb.direction === DirectionType.in && direction === DirectionType.trigger)) && cb.type === type;
                });

                const fb: UIFunctionBinding = {
                    id: this.guid(),
                    name: b.name,
                    type: type,
                    direction: direction,
                    enabledInTryMode: false,
                    settings: [],
                    displayName: bindingConfig ? bindingConfig.displayName : ''
                };

                // Copy binding level settings
                for (const key in b) {
                    const findIndex = fb.settings.findIndex((setting) => {
                        return setting.name === key;
                    });

                    if (findIndex === -1) {
                        fb.settings.push({
                            name: key,
                            value: b[key]
                        });
                    }
                }

                configUI.bindings.push(fb);
            });
        }

        return configUI;
    }

    UIToFunctionConfig(config: UIFunctionConfig): FunctionConfig {
        const result = {
            bindings: []
        };

        // top-level
        for (const key in config.originalConfig) {
            if (key !== 'bindings') {
                result[key] = config.originalConfig[key];
            }
        }

        if (config.bindings) {

            config.bindings.forEach((b) => {
                const bindingToAdd = {
                };

                b.settings.forEach((s) => {
                    if (!s.noSave) {
                        if (s.value === false) {
                            bindingToAdd[s.name] = false;
                        } else if (!s.value) {
                            bindingToAdd[s.name] = '';
                        } else {
                            bindingToAdd[s.name] = s.value;
                        }
                    }
                });
                bindingToAdd['direction'] = b.direction === DirectionType.trigger ? DirectionType.in.toString() : b.direction.toString();

                result.bindings.push(bindingToAdd);
            });
        }

        return result;
    }

    getBindingSchema(type: BindingType, behavior: DirectionType, bindings: Binding[]): Binding {
        return bindings.find((bindingSchema) => {
            return bindingSchema.type === type && bindingSchema.direction === behavior;
        });
    }

    getDefaultBinding(type: BindingType, direction: DirectionType, bindings: Binding[], defaultStorageAccount): UIFunctionBinding {
        const schema = this.getBindingSchema(type, direction, bindings);

        const parameterNameSetting = schema.settings.find((s) => {
            return s.name === 'name';
        });

        const result = {
            id: this.guid(),
            name: parameterNameSetting.defaultValue,
            type: type,
            direction: direction,
            enabledInTryMode: false,
            settings: [],
            displayName: schema.displayName
        };


        result.settings.push({
            value: type,
            name: 'type'
        });

        schema.settings.forEach((s) => {
            result.settings.push({
                value: s.name === 'storageAccount' ? defaultStorageAccount : s.defaultValue,
                name: s.name
            });
        });

        return result;
    }

    getTemplates(behavior: DirectionType, bindings: Binding[]): Template[] {
        bindings = bindings.filter((bindingSchema: Binding) => {
            return bindingSchema.direction === behavior;
        });

        const result: Template[] = [];
        bindings.forEach((b) => {
            result.push({
                name: b.displayName,
                value: b.type.toString()
            });
        });

        return result;
    }

    setDefaultValues(bindings: FunctionBinding[], defaultStorageAccount: string) {
        bindings.forEach((b) => {
            for (const key in b) {
                if (key === 'storageAccount') {
                    b[key] = defaultStorageAccount;
                }
            }
        });
    }

    validateConfig(config: FunctionConfig, translationService: TranslateService) {

        if (config.bindings) {

            config.bindings.forEach((b) => {
                const duplicate = config.bindings.find((binding) => {
                    return b !== binding && binding.name === b.name;
                });

                if (duplicate) {
                    throw translationService.instant(PortalResources.bindingsValidationNameDublicate, { functionName: b.name });
                }

                if (!b.name) {
                    throw translationService.instant(PortalResources.bindingsValidationNameMissed);
                }

                if (!b.direction) {
                    throw translationService.instant(PortalResources.bindingsValidationDirectionMissed);
                }

                if (!b.type) {
                    throw translationService.instant(PortalResources.bindingsValidationDirectionMissed);
                }

                if (!DirectionType[b.direction.toLowerCase()]) {
                    throw translationService.instant(PortalResources.bindingsValidationDirectionUnknown, { direction: b.direction });
                }

                if (!BindingType[b.type]) {
                    throw translationService.instant(PortalResources.bindingsValidationTypeUnknown, { type: b.type });
                }

            });
        }
    }

    // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    guid() {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
            this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    public static isHttpFunction(functionInfo: FunctionInfo) {
        const inputBinding = (functionInfo.config && functionInfo.config.bindings
            ? functionInfo.config.bindings.find(e => e.type.toLowerCase() === 'httptrigger')
            : null);
        return !!inputBinding;
    }

    public static isEventGridFunction(functionInfo: FunctionInfo) {
        var inputBinding = (functionInfo.config && functionInfo.config.bindings
            ? functionInfo.config.bindings.find(e => e.type.toLowerCase() === 'eventgridtrigger')
            : null);
        return !!inputBinding;
    }

    private s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    public static getBindingType(value: string): BindingType {
        for (const type in BindingType) {
            if (type.toString().toLowerCase() === value.toLowerCase()) {
                return BindingType[type.toString()];
            }
        }
        return null;
    }
}
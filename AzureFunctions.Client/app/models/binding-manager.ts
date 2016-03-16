import {UIFunctionConfig, UIFunctionBinding, DirectionType, SettingType, BindingType, Binding} from './binding';
import {FunctionConfig} from './function-config';
import {Template} from './template-picker';
import {FunctionInfo} from '../models/function-info';
import {FunctionBinding} from './function-config';

export class BindingManager {

    public static getFunctionName(defaultName: string, functionsInfo: FunctionInfo[]): string {
        var i = 1;
        while (true) {
            var func = functionsInfo.find((value) => {
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
        var configUI = {
            schema: "",
            version: "",
            bindings: [],
            originalConfig: config
        };

        config.bindings.forEach((b) => {
            var typeString: string = b.type;
            var type: BindingType = BindingType[typeString];
            var behaviorString: string = b.direction;
            var direction: DirectionType = DirectionType[behaviorString];

            if (typeString) {
                if ((DirectionType[behaviorString] === DirectionType.in) && (typeString.toLowerCase().indexOf("trigger") !== -1)) {
                    direction = DirectionType.trigger;
                }
            }

            var fb: UIFunctionBinding = {
                id: this.guid(),
                name: b.name,
                type: type,
                direction: direction,
                settings: []
            };

            var bindingConfig = bindings.find((cb) => {
                return (cb.direction === direction || (cb.direction === DirectionType.in && direction === DirectionType.trigger)) && cb.type === type;
            });

            if (bindingConfig) {
                bindingConfig.settings.forEach((s) => {
                    fb.settings.push({
                        name: s.name,
                        value: b[s.name]
                    });
                    
                });
            }

            // Copy binding level settings
            for (var key in b) {
                var findIndex = fb.settings.findIndex((setting) => {
                    return setting.name === key;
                });

                if (findIndex === -1) {
                    fb.settings.push({
                        name: key,
                        value: key === b[key]
                    });
                }
            }                

            configUI.bindings.push(fb);
        });

        return configUI;
    }

    UIToFunctionConfig(config: UIFunctionConfig): FunctionConfig {
        var result = {
            bindings: []
        };

        //top-level
        for (var key in config.originalConfig) {
            if (key !== "bindings") {
                result[key] = config.originalConfig[key];
            }
        }
        
        config.bindings.forEach((b) => {
            var bindingToAdd = {
            };
            
            b.settings.forEach((s) => {
                bindingToAdd[s.name] = s.value ? s.value : "";
            });
            bindingToAdd["direction"] = b.direction === DirectionType.trigger ? DirectionType.in.toString() : b.direction.toString();

            result.bindings.push(bindingToAdd);
        });

        return result;
    }

    getBindingSchema(type: BindingType, behavior: DirectionType, bindings: Binding[]): Binding {
        return bindings.find((bindingSchema) => {
            return bindingSchema.type === type && bindingSchema.direction === behavior;
        });
    }

    getDefaultBinding(type: BindingType, direction: DirectionType, bindings: Binding[], defaultStorageAccount): UIFunctionBinding {
        
        var schema = this.getBindingSchema(type, direction, bindings);
        var result = {
            id: this.guid(),
            name: schema.defaultParameterName,
            type: type,
            direction: direction,
            settings: []
        };

        result.settings.push({
            value: schema.defaultParameterName,
            name: "name"
        });

        result.settings.push({
            value: type,
            name: "type"
        });

        schema.settings.forEach((s) => {            
            result.settings.push({
                value: s.name === "storageAccount" ? defaultStorageAccount : s.defaultValue,
                name: s.name
            });
        });

        return result;
    }

    getTemplates(behavior: DirectionType, bindings: Binding[]): Template[] {
        var bindings = bindings.filter((bindingSchema: Binding) => {
            return bindingSchema.direction === behavior;
        });

        var result: Template[] = [];
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
            for (var key in b) {
                if (key === "storageAccount") {
                    b[key] = defaultStorageAccount;
                }
            }
        });
    }

    //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    guid() {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
             this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    private s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
     }
}
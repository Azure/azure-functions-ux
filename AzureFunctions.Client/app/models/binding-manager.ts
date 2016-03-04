import {UIFunctionConfig, UIFunctionBinding, DirectionType, SettingType, BindingType, Binding} from './binding';
import {FunctionConfig} from './function-config';
import {Template} from './template-picker';

export class BindingManager {

    functionConfigToUI(config :FunctionConfig, bindings: Binding[]): UIFunctionConfig {
        var configUI = {
            schema: "",
            version: "",
            bindings: []
        };

        config.bindings.forEach((b) => {
            var typeString: string = b.type;
            var type: BindingType = BindingType[typeString];
            var behaviorString: string = b.direction;
            var directions: DirectionType = DirectionType[behaviorString];

            var fb: UIFunctionBinding = {
                id: this.guid(),
                name: b.name,
                type: type,
                direction: directions,
                settings: []
            };

            var bindingConfig = bindings.find((cb) => {
                return cb.direction === directions && cb.type === type;
            });

            bindingConfig.settings.forEach((s) => {
                fb.settings.push({
                    name: s.name,
                    value: b[s.name]
                });
            });

            configUI.bindings.push(fb);
        });

        return configUI;
    }

    UIToFunctionConfig(config: UIFunctionConfig): FunctionConfig {
        var result = {
            disabled: false,
            bindings: []
        };

        config.bindings.forEach((b) => {
            var bindingToAdd = {
                type: b.type,
                direction: b.direction,
                name: b.name
            };

            b.settings.forEach((s) => {
                bindingToAdd[s.name] = s.value;
            });

            result.bindings.push(bindingToAdd);
        });

        return result;
    }

    getBindingSchema(type: BindingType, behavior: DirectionType, bindings: Binding[]): Binding {
        return bindings.find((bindingSchema) => {
            return bindingSchema.type === type && bindingSchema.direction === behavior;
        });
    }

    getDefaultBinding(type: BindingType, direction: DirectionType, bindings: Binding[]): UIFunctionBinding {        
        var schema = this.getBindingSchema(type, direction, bindings);
        var result = {
            id: this.guid(),
            name: schema.displayName,
            type: type,
            direction: direction,
            settings: []
        };

        schema.settings.forEach((s) => {
            result.settings.push({
                value: s.defaultValue,
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
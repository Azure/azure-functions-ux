import {UIFunctionConfig, UIFunctionBinding, DirectionType} from './binding';

export class BindingList {

    config: UIFunctionConfig;
    trigger: UIFunctionBinding;
    inputs: UIFunctionBinding[];
    outputs: UIFunctionBinding[];

    constructor() {
        this.setBindings();
    }

    setBindings() {
        if (!this.config) {
            return;
        }

        this.config.bindings.forEach((i) => {
            var displayString = " (" + i.displayName + ")";
            i.title = i.name ? i.name + displayString : displayString;            
        });

        this.trigger = this.config.bindings.find((binding: UIFunctionBinding, index) => {
            return binding.direction === DirectionType.trigger;
        });

        this.inputs = this.config.bindings.filter((binding: UIFunctionBinding, index) => {
            return binding.direction === DirectionType.in;
        });

        this.outputs = this.config.bindings.filter((binding: UIFunctionBinding, index) => {
            return binding.direction === DirectionType.out;
        });

        if (this.inputs.length === 0) {
            this.inputs = null;
        }
    }

    getBinding(id: string) {
        return this.config.bindings.filter((binding: UIFunctionBinding, index) => {
            return binding.id === id;
        })[0];
    }

    removeBinding(id: string) {
        for (var i = this.config.bindings.length - 1; i >= 0; i--) {
            if (this.config.bindings[i].id === id) {
                this.config.bindings.splice(i, 1);
                break;
            }
        }
    }

    updateBinding(binding: UIFunctionBinding) {
        var index = this.config.bindings.findIndex((b: UIFunctionBinding) => {
            return binding.id === b.id;
        });

        this.config.bindings[index] = binding;
    }
}
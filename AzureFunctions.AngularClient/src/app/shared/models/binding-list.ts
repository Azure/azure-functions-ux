import { UIFunctionConfig, UIFunctionBinding, DirectionType } from './binding';

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
            i.title = i.name ? i.displayName + " (" + i.name + ")" : i.displayName;
        });

        this.trigger = this.config.bindings.find((binding: UIFunctionBinding) => {
            return binding.direction === DirectionType.trigger;
        });

        this.inputs = this.config.bindings.filter((binding: UIFunctionBinding) => {
            return binding.direction === DirectionType.in;
        });

        this.outputs = this.config.bindings.filter((binding: UIFunctionBinding) => {
            return binding.direction === DirectionType.out;
        });

        if (this.inputs.length === 0) {
            this.inputs = null;
        }
    }

    getBinding(id: string) {
        return this.config.bindings.filter((binding: UIFunctionBinding) => {
            return binding.id === id;
        })[0];
    }

    removeBinding(id: string) {
        for (let i = this.config.bindings.length - 1; i >= 0; i--) {
            if (this.config.bindings[i].id === id) {
                this.config.bindings.splice(i, 1);
                break;
            }
        }
    }

    updateBinding(binding: UIFunctionBinding) {
        const index = this.config.bindings.findIndex((b: UIFunctionBinding) => {
            return binding.id === b.id;
        });

        if (index === -1) {
            this.config.bindings.push(binding);
        } else {
            this.config.bindings[index] = binding;
        }
    }
}

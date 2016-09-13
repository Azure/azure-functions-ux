//ref: https://github.com/pleerock/ng2-tooltip/blob/master/src/Tooltip.ts
import {Directive, HostListener, ComponentRef, ViewContainerRef, ComponentResolver, ComponentFactory, Input} from '@angular/core';
import {TooltipContentComponent} from './tooltip-content.component';

@Directive({
    selector: '[tooltip]'
})
export class TooltipComponent {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private tooltip: ComponentRef<TooltipContentComponent>;
    private visible: boolean;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private viewContainerRef: ViewContainerRef, private resolver: ComponentResolver) {
    }

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input("tooltip")
    content: string | TooltipContentComponent;

    @Input()
    tooltipDisabled: boolean;

    @Input()
    tooltipAnimation: boolean = true;

    @Input()
    tooltipPlacement: "top" | "bottom" | "left" | "right" = "bottom";

    @Input()
    leftOffset: number = 0;

    @Input()
    topOffset: number = 0;

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    @HostListener("focusin")
    @HostListener("mouseenter")
    show(): void {
        if (this.tooltipDisabled || this.visible)
            return;

        this.visible = true;
        if (typeof this.content === "string") {
            this.resolver.resolveComponent(TooltipContentComponent).then((factory: ComponentFactory<any>) => {
                if (!this.visible)
                    return;

                this.tooltip = this.viewContainerRef.createComponent(factory);
                this.tooltip.instance.hostElement = this.viewContainerRef.element.nativeElement;
                this.tooltip.instance.content = this.content as string;
                this.tooltip.instance.placement = this.tooltipPlacement;
                this.tooltip.instance.animation = this.tooltipAnimation;
                this.tooltip.instance.leftOffset = this.leftOffset;
                this.tooltip.instance.topOffset = this.topOffset;
            });
        } else {
            const tooltip = this.content as TooltipContentComponent;
            tooltip.hostElement = this.viewContainerRef.element.nativeElement;
            tooltip.placement = this.tooltipPlacement;
            tooltip.animation = this.tooltipAnimation;
            tooltip.leftOffset = this.leftOffset;
            tooltip.topOffset = this.topOffset;
            tooltip.show();
        }
    }

    @HostListener("focusout")
    @HostListener("mouseleave")
    hide(): void {
        if (!this.visible)
            return;

        this.visible = false;
        if (this.tooltip)
            this.tooltip.destroy();

        if (this.content instanceof TooltipContentComponent)
            (this.content as TooltipContentComponent).hide();
    }

}
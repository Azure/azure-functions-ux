﻿import { AADPermissions } from './microsoft-graph';

export enum TemplatePickerType {
    trigger,
    in,
    out,
    template,
    none
}

export interface Template {
    name: string;
    value: string;
    image?: string;
    keys?: string[];
    description?: string;
    enabledInTryMode?: boolean;
    AADPermissions?: AADPermissions[];
    languages?: string[];
    categories?: string[];
    ids?: string[];
    color?: string;
    icon?: string;
    barcolor?: string;
}

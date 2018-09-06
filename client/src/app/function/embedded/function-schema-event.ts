export type FunctionSchemaEventType = 'saveSchema';

export interface FunctionSchemaEvent<T> {
    type: FunctionSchemaEventType;
    value: T;
}
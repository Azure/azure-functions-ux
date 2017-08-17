export interface EssentialColumn
{
    items : EssentialItem[]
}
export interface EssentialItem
{
    label: string;
    icon: string;
    onClick: (evt: any) => void;
    text: string;
}
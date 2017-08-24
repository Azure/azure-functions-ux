export interface EssentialColumn
{
    items : EssentialItem[]
}
export interface EssentialItem
{
    label: string;
    icon: string;
    onClick: () => void;
    text: string;
}
export class EventGrid {
  public static readonly EventGridName = {
    v1: 'eventgridextensionconfig_extension',
    v2: 'eventgrid_extension',
  };

  public static readonly EventGridPath = {
    v1: 'admin/extensions/EventGridExtensionConfig',
    v2: 'runtime/webhooks/EventGrid',
  };

  public static readonly eventGridType = 'eventGridTrigger';
  public static readonly eventGridBindingId = 'eventGridTrigger-trigger';
}

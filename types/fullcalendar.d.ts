declare module '@fullcalendar/react' {
  const FullCalendar: any;
  export default FullCalendar;
  export type EventInput = any;
  export type EventDropArg = any;
  export type EventResizeDoneArg = any;
}

declare module '@fullcalendar/core' {
  const core: any;
  export default core;
}

declare module '@fullcalendar/daygrid' { const plugin: any; export default plugin; }
declare module '@fullcalendar/timegrid' { const plugin: any; export default plugin; }
declare module '@fullcalendar/interaction' { const plugin: any; export default plugin; }

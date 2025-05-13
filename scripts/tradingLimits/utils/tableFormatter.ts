export function createLimitsTable(args: ScriptArgs): Table.Table {
  const tableColumns: any[] = args.verbose
    ? [
        { content: 'Exchange', colSpan: 1 }, // Exchange ID in verbose mode
        { content: 'Asset', colSpan: 1 },
        { content: 'Symbol', colSpan: 1 },
        { content: 'Limit ID', colSpan: 1 },
      ]
    : [
        { content: 'Exchange', colSpan: 1 }, // Exchange name in normal mode
        { content: 'Symbol', colSpan: 1 },
      ]

  // Common columns for both modes
  tableColumns.push(
    { content: 'Type', colSpan: 1 },
    { content: 'Timeframe', colSpan: 1 },
    { content: 'Limit', colSpan: 1 },
    { content: 'Netflow', colSpan: 1 },
    { content: 'Utilization', colSpan: 1 },
    { content: 'Max In', colSpan: 1 },
    { content: 'Max Out', colSpan: 1 },
    { content: 'Limit Reset', colSpan: 1 },
    { content: 'Limit Reset Time', colSpan: 1 },
    { content: 'Status', colSpan: 1 }
  )

  return new Table({
    head: tableColumns,
    style: {
      head: ['white'],
      border: ['gray'],
    },
    wordWrap: true,
    wrapOnWordBoundary: false,
  })
}

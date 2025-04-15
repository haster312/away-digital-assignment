export enum GraphType {
    WIKI = 'wiki',
    WEB = 'web',
}

export const GRAPH_TABLE_IDENTIFIER = {
    [GraphType.WIKI]: 'table.wikitable.sortable',
}

export const URL_PATTERN: { [key in GraphType]: RegExp } = {
    [GraphType.WIKI]: /^https:\/\/[a-z]{2,3}\.wikipedia\.org\/wiki\//,
    [GraphType.WEB]: /^https:\/\//,
}

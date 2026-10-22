export type TableCellDisplayType = 'text' | 'badge';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  displayType?: TableCellDisplayType;
}

import { Component, input, output } from '@angular/core';
import { TableColumn } from '../../interface/table-column.inteface';

import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.css',
})
export class CustomTableComponent<T extends object = object> {
  public rows = input.required<readonly T[]>();
  public columns = input.required<readonly TableColumn[]>();
  public rowKey = input('id');
  public sortKey = input<string | null>(null);
  public sortAscending = input(true);
  public canEdit = input<boolean>(true);
  public canDelete = input<boolean>(true);
  public emptyStateTitle = input('No records found');
  public emptyStateMessage = input('There is no data to display.');

  public edit = output<T>();
  public delete = output<T>();
  public sort = output<string>();

  public getCellValue(row: T, key: string): unknown {
    return key in row ? Reflect.get(row, key) : '';
  }

  public onSort(column: TableColumn): void {
    if (column.sortable) {
      this.sort.emit(column.key);
    }
  }
}

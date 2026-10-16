
import { Component, Input } from '@angular/core';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  @Input({ required: true }) public options!: EChartsOption;
  @Input() public ariaLabel = 'Chart';
}

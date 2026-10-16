
import { Component, input } from '@angular/core';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './custom-chart.component.html',
  styleUrl: './custom-chart.component.css',
})
export class CustomChartComponent {
  public readonly options = input.required<EChartsOption>();
  public readonly ariaLabel = input('Chart');
}

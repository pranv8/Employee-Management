
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, effect } from '@angular/core';
import { Subscription } from 'rxjs';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  AriaComponent,
  GridComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { Employee } from '../../interface/employee.interface';
import { EmployeeService } from '../../services/employee.service';
import { ThemeService } from '../../services/theme.service';
import { ChartComponent } from './chart/chart.component';

interface DepartmentCount {
  name: string;
  count: number;
}

echarts.use([
  BarChart,
  AriaComponent,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnDestroy {
  public departments: DepartmentCount[] = [];
  public chartOptions: EChartsOption = {};
  public totalEmployees = 0;
  public isLoading = true;
  public errorMessage = '';

  private readonly subscription: Subscription;

  public constructor(
    private readonly employeeService: EmployeeService,
    private readonly themeService: ThemeService,
  ) {
    effect(() => {
      this.themeService.theme();
      this.chartOptions = this.createChartOptions();
    });

    this.subscription = this.employeeService.loadEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.totalEmployees = employees.length;
        this.departments = this.groupByDepartment(employees);
        this.chartOptions = this.createChartOptions();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Unable to load department chart data:', error);
        this.errorMessage =
          'Department data could not be loaded. Please try again.';
        this.isLoading = false;
      },
    });
  }

  private groupByDepartment(employees: Employee[]): DepartmentCount[] {
    const counts = new Map<string, number>();

    for (const employee of employees) {
      const department =
        employee.employeeDepartment?.trim() || 'Unassigned';

      counts.set(department, (counts.get(department) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort(
        (a, b) => b.count - a.count || a.name.localeCompare(b.name),
      );
  }

  private createChartOptions(): EChartsOption {
    const styles =
      typeof document === 'undefined'
        ? null
        : getComputedStyle(document.documentElement);
    const color = (property: string, fallback: string): string =>
      styles?.getPropertyValue(property).trim() || fallback;
    const axisLabelColor = color('--chart-axis-label', '#334155');
    const highestCount = Math.max(
      0,
      ...this.departments.map((department) => department.count),
    );
    const maxDepartmentCount = Math.max(
      3,
      Math.ceil(highestCount / 3) * 3,
    );

    return {
      aria: {
        enabled: true,
        decal: { show: true },
      },
      animationDuration: 350,
      grid: {
        top: 28,
        right: 20,
        bottom: 58,
        left: 42,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      xAxis: {
        type: 'category',
        data: this.departments.map((department) => department.name),
        axisTick: { alignWithLabel: true },
        axisLine: {
          lineStyle: { color: color('--border-strong', '#cbd5e1') },
        },
        axisLabel: {
          color: axisLabelColor,
          interval: 0,
          overflow: 'truncate',
          width: 110,
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 16,
          hideOverlap: false,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxDepartmentCount,
        interval: 3,
        minInterval: 1,
        axisLabel: {
          color: axisLabelColor,
          fontSize: 12,
          fontWeight: 500,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { color: color('--border-soft', '#e2e8f0') },
        },
      },
      series: [
        {
          name: 'Employees',
          type: 'bar',
          data: this.departments.map((department) => department.count),
          barMaxWidth: 44,
          itemStyle: {
            color: color('--primary', '#007f94'),
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            color: color('--text-primary', '#1f2937'),
            fontSize: 13,
            fontWeight: 700,
          },
        },
      ],
    };
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

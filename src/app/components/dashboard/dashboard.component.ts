import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, effect } from '@angular/core';
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
import { Theme, ThemeService } from '../../services/theme.service';
import { ChartComponent } from './chart/chart.component';

interface DepartmentCount {
  name: string;
  count: number;
}

interface AgeGroupCount {
  name: string;
  count: number;
}

interface AgeGroupRange {
  name: string;
  min: number;
  max: number;
}

interface ChartPalette {
  axisLabel: string;     // x and y axis labels
  valueLabel: string;    // number shown above each bar
  axisLine: string;
  splitLine: string;
  bar: string;
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
}

// Chart colours for each theme. These match the tokens in styles/theme.css.
// Day  -> dark labels on the white card.
// Dusk -> light labels on the dark card.
const CHART_PALETTES: Record<Theme, ChartPalette> = {
  day: {
    axisLabel: '#334155',
    valueLabel: '#0f172a',
    axisLine: '#cbd5e1',
    splitLine: '#e2e8f0',
    bar: '#007f94',
    tooltipBackground: '#ffffff',
    tooltipBorder: '#dce4ea',
    tooltipText: '#1f2937',
  },
  dusk: {
    axisLabel: '#f8fafc',
    valueLabel: '#f8fafc',
    axisLine: '#475569',
    splitLine: '#2a374b',
    bar: '#55b8c6',
    tooltipBackground: '#1e293b',
    tooltipBorder: '#334155',
    tooltipText: '#e5edf5',
  },
};

// Age bands shown on the chart, in display order. The first and last bands
// are open-ended so every valid age always lands in exactly one group.
const AGE_GROUPS: readonly AgeGroupRange[] = [
  { name: 'Under 25', min: 0, max: 24 },
  { name: '25–29', min: 25, max: 29 },
  { name: '30–34', min: 30, max: 34 },
  { name: '35–39', min: 35, max: 39 },
  { name: '40–44', min: 40, max: 44 },
  { name: '45–49', min: 45, max: 49 },
  { name: '50+', min: 50, max: Number.POSITIVE_INFINITY },
];

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
  public ageGroups: AgeGroupCount[] = [];
  public chartOptions: EChartsOption = {};
  public ageChartOptions: EChartsOption = {};
  public totalEmployees = 0;
  public isLoading = true;
  public errorMessage = '';

  private readonly subscription: Subscription;

  public constructor(
    private readonly employeeService: EmployeeService,
    private readonly themeService: ThemeService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
    effect(() => {
      this.refreshChartOptions(this.themeService.theme());
      this.changeDetectorRef.markForCheck();
    });

    this.subscription = this.employeeService.loadEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.totalEmployees = employees.length;
        this.departments = this.groupByDepartment(employees);
        this.ageGroups = this.groupByAgeGroup(employees);
        this.refreshChartOptions(this.themeService.theme());
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Unable to load dashboard chart data:', error);
        this.errorMessage =
          'Employee data could not be loaded. Please try again.';
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

  private groupByAgeGroup(employees: Employee[]): AgeGroupCount[] {
    const counts = AGE_GROUPS.map((group) => ({ name: group.name, count: 0 }));

    for (const employee of employees) {
      const index = AGE_GROUPS.findIndex(
        (group) =>
          employee.employeeAge >= group.min &&
          employee.employeeAge <= group.max,
      );

      if (index !== -1) {
        counts[index].count += 1;
      }
    }

    return counts;
  }

  private refreshChartOptions(theme: Theme): void {
    this.chartOptions = this.createBarChartOptions(this.departments, theme);
    this.ageChartOptions = this.createBarChartOptions(this.ageGroups, theme);
  }

  // Shared builder for every bar chart on the dashboard.
  private createBarChartOptions(
    items: ReadonlyArray<{ name: string; count: number }>,
    theme: Theme,
  ): EChartsOption {
    const palette = CHART_PALETTES[theme];

    const highestCount = Math.max(0, ...items.map((item) => item.count));
    const maxCount = Math.max(3, Math.ceil(highestCount / 3) * 3);

    return {
      aria: {
        enabled: true,
        decal: { show: true },
      },
      // Default text colour for anything in the chart without its own colour.
      textStyle: { color: palette.axisLabel },
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
        backgroundColor: palette.tooltipBackground,
        borderColor: palette.tooltipBorder,
        textStyle: { color: palette.tooltipText },
      },
      xAxis: {
        type: 'category',
        data: items.map((item) => item.name),
        axisTick: { alignWithLabel: true },
        axisLine: {
          lineStyle: { color: palette.axisLine },
        },
        axisLabel: {
          color: palette.axisLabel,
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
        max: maxCount,
        interval: 3,
        minInterval: 1,
        axisLabel: {
          color: palette.axisLabel,
          fontSize: 12,
          fontWeight: 500,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          lineStyle: { color: palette.splitLine },
        },
      },
      series: [
        {
          name: 'Employees',
          type: 'bar',
          data: items.map((item) => item.count),
          barMaxWidth: 44,
          itemStyle: {
            color: palette.bar,
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            color: palette.valueLabel,
            textBorderWidth: 0,
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
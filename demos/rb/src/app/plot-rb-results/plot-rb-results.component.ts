import { ChartDataSets, ChartOptions } from "chart.js";
import { BaseChartDirective, Color, Label } from "ng2-charts";

import { Component, Input, OnInit, ViewChild } from "@angular/core";

import { ExpReg } from "exponential-regression";

@Component({
  selector: "app-plot-rb-results",
  template: `
    <div class="row">
      <div class="col-md-3">
        <table class="table">
          <thead>
            <tr>
              <th>Depth</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of results; index as i">
              <td>{{ depths[i] }}</td>
              <td>{{ results[i] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-md-9">
        <h4>Results</h4>
        Fit= <ng-katex [equation]="fit_eqn"></ng-katex>
        <div style="display: block; height: 100%">
          <canvas
            baseChart
            [datasets]="lineChartData"
            [labels]="lineChartLabels"
            [options]="lineChartOptions"
            [colors]="lineChartColors"
            [legend]="lineChartLegend"
            chartType="line"
            [plugins]="lineChartPlugins"
          >
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PlotRBResultsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chartWidget: any;

  public lineChartData: ChartDataSets[] = [{ data: [1, 2, 3], label: "RB" }];
  public lineChartLabels: any[] = [1, 2, 3];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            min: 0,
          },
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    {
      borderColor: "black",
    },
  ];
  public lineChartLegend = true;
  public lineChartType = "line";
  public lineChartPlugins = [];

  @Input() depths!: number[];
  @Input() results!: number[];
  @Input() shots!: number;

  fit: any = {};
  fit_eqn = "";

  constructor() {}

  ngOnChanges() {
    console.log(arguments);
    this.ngOnInit();
  }

  fitted_values(): number[] {
    this.fit = ExpReg.solve([0].concat(this.depths), [this.shots].concat(this.results));

    const { a, b, c } = this.fit;
    const exp = (t: number) => a + b * Math.exp(c * t);

    this.fit_eqn = `${this.fit.a.toFixed(2)} + ${this.fit.b.toFixed(2)} e^{ ${this.fit.c.toFixed(3)} * t }`;
    return this.depths.map(exp);
  }

  ngOnInit() {
    console.log(this.depths, this.results);
    console.log(this.lineChartOptions);

    this.lineChartData = [
      { data: this.results, label: "RB", fill: false },
      { data: this.fitted_values(), label: "Fit", fill: false },
    ];
    this.lineChartLabels = this.depths;
    this.lineChartOptions = {
      responsive: true,
      legend: {
        position: "right",
      },
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              max: this.shots,
            },
          },
        ],
      },
    };
  }
}

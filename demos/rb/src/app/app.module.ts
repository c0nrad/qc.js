import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { KatexModule } from "ng-katex";
import { ChartsModule } from "ng2-charts";

import { AppComponent } from "./app.component";
import { PlotRBResultsComponent } from './plot-rb-results/plot-rb-results.component';

@NgModule({
  declarations: [AppComponent, PlotRBResultsComponent],
  imports: [BrowserModule, KatexModule, FormsModule, ChartsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

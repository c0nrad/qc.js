import { Component, NgZone } from "@angular/core";
import { ChartDataSets } from "chart.js";
import { from, Observable, of, range } from "rxjs";
import { concatAll, concatMap, map } from "rxjs/operators";
import { CliffordGates, Gate, HadamardGate, IdentityGate, SGate, TGate, XGate, YGate, ZGate } from "../../../../src/gates";
import { DecoherenceNoise, DepolarizingNoise, NoiseGroup, SPAMNoise } from "../../../../src/noise";

import { RandomizedBenchmarking } from "../../../../src/randomized_benchmarking";

@Component({
  selector: "app-root",
  template: `
    <div class="container">
      <div class="py-4">
        <header class="pb-2 border-bottom">
          <a href="/" class="d-flex align-items-center text-dark text-decoration-none">
            <h1>Randomized Benchmarking Playground</h1>
          </a>
        </header>
      </div>

      <div class="alert alert-warning">
        <strong>Warning</strong> I am not a physicist, just a curious programmer who built this for learning. If you notice anything wonky, please let
        me know! c0nrad@c0nrad.io
      </div>

      <p>This is a little tool to play with randomized benchmarking on simulated noisy circuits.</p>

      <p>
        Randomized benchmarking is one of the simpler ways to characterize the amount of noise/error in a quantum computer. You take a quantum circuit
        with some noise and apply an increasing number of random gates and see how fast the correctness of the results goes down.
      </p>

      <p>
        There are a number of different noise models, for this simulated I used the models from this paper
        <a href="https://arxiv.org/abs/2101.02109"> arXiv:2101.02109</a>. For each of them you create a list of (kraus) operators and then sum over
        them to update the density matrix.

        <ng-katex-paragraph paragraph="$$ \\rho^{\\prime} = \\sum_{i=0} K_{D_i} \\rho K^{\\dagger}_{D_i} $$"></ng-katex-paragraph>

        Some of the noise is applied after each gate (Depolarizing/Decoherence), some after state prep and measurement (SPAM).
      </p>

      <div>
        <h4>Step 1: Select Noise Models</h4>

        <div class="row">
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <div class="form-check">
                  <input class="form-check-input" [(ngModel)]="model.depolarizingError.enabled" type="checkbox" value="" id="depolarizingError" />
                  <label class="form-check-label" for="depolarizingError"> Depolarizing Error </label>
                </div>
              </div>
              <div class="card-body" [class.text-muted]="!model.depolarizingError.enabled">
                <p>Simulates noise in the gates. This error is applied after each gate. It "shrinks" the bloch sphere.</p>

                <div class="row mb-3">
                  <label for="depolarizingError.p1" class="col-sm-2 col-form-label"><ng-katex equation="p_1"></ng-katex></label>
                  <div class="col-sm-10">
                    <input type="email" class="form-control" id="depolarizingError.p1" [(ngModel)]="model.depolarizingError.p1" />
                    <div id="passwordHelpBlock" class="form-text">A 'p' of zero means no error, and a 'p' of one is full error.</div>
                  </div>
                </div>

                <ng-katex-paragraph
                  paragraph="
                  The operators are: 
                  $$ K_{D_0} = \\sqrt{1-p_1} I $$ 
                  $$ K_{D_1} = \\sqrt{\\frac{p_1}{3}} X $$ 
                  $$ K_{D_2} = \\sqrt{\\frac{p_1}{3}} Y $$ 
                  $$ K_{D_3} = \\sqrt{\\frac{p_1}{3}} Z $$ 
                  "
                ></ng-katex-paragraph>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <div class="form-check">
                  <input class="form-check-input" [(ngModel)]="model.spamError.enabled" type="checkbox" value="" id="spamError" />
                  <label class="form-check-label" for="spamError"> SPAM Error </label>
                </div>
              </div>
              <div class="card-body">
                <p>Simulates noise in State Prep and Measurement. Only applied at the start and end of the circuit.</p>

                <div class="row mb-3">
                  <label for="spamError.p2" class="col-sm-2 col-form-label"><ng-katex equation="p_2"></ng-katex></label>
                  <div class="col-sm-10">
                    <input type="email" class="form-control" id="spamError.p2" [(ngModel)]="model.spamError.p2" />
                    <div id="passwordHelpBlock" class="form-text">A 'p' of zero means no error, and a 'p' of one is full error.</div>
                  </div>
                </div>

                <ng-katex-paragraph
                  paragraph="
                  The operators are: 
                  $$ K_{M_0} = \\sqrt{1-p_2} I $$ 
                  $$ K_{M_1} = \\sqrt{p_2} X $$ 
                  "
                ></ng-katex-paragraph>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <div class="form-check">
                  <input class="form-check-input" [(ngModel)]="model.decoherenceError.enabled" type="checkbox" value="" id="decoherenceError" />
                  <label class="form-check-label" for="decoherenceError"> Decoherence </label>
                </div>
              </div>
              <div class="card-body">
                <p>Simulates decoherence in the circuit based on T1 and T2 values.</p>

                <div class="row mb-3">
                  <label for="decoherenceError.t1" class="col-sm-2 col-form-label"><ng-katex equation="T_1"></ng-katex></label>
                  <div class="col-sm-10">
                    <input type="email" class="form-control" id="decoherenceError.t1" [(ngModel)]="model.decoherenceError.t1" />
                    <div id="passwordHelpBlock" class="form-text">T1 is the spontaneous emission time in seconds</div>
                  </div>
                </div>

                <div class="row mb-3">
                  <label for="decoherenceError.t2" class="col-sm-2 col-form-label"><ng-katex equation="T_2"></ng-katex></label>
                  <div class="col-sm-10">
                    <input type="email" class="form-control" id="decoherenceError.t2" [(ngModel)]="model.decoherenceError.t2" />
                    <div id="passwordHelpBlock" class="form-text">T2 is de-phasing time in seconds</div>
                  </div>
                </div>

                <div class="row mb-3">
                  <label for="decoherenceError.tg" class="col-sm-2 col-form-label"><ng-katex equation="T_{g}"></ng-katex></label>
                  <div class="col-sm-10">
                    <input type="email" class="form-control" id="decoherenceError.tg" [(ngModel)]="model.decoherenceError.tg" />
                    <div id="passwordHelpBlock" class="form-text">Tg is the time it takes to apply a gate</div>
                  </div>
                </div>

                <ng-katex-paragraph
                  paragraph="
                  The probabilities are defined as:
                  
 
    $$ p_{t_1} = e^{-t_g/t_1}, p_{t_2} = e^{-t_g / t_2} $$ 
    $$ p_{reset} = 1-p_{t_1} $$ 
    $$ p_z = (1-p_{reset})  ( 1- \\frac{p_{t_2}}{p_{t_1}} )/2 $$ 
    $$ p_i = 1 - p_z - p_{reset} $$


                  The operators are: 
                  $$ K_{I} = \\sqrt{p_I} I $$ 
                  $$ K_{Z} = \\sqrt{p_Z} Z $$
                  $$ K_{reset} = \\sqrt{p_{reset}} ( |0 \\rangle \\langle 0 | + |0\\rangle \\langle 1|)  $$ 
                  
                  These are slightly different than the values in the paper. Without adding $ |0\\rangle \\langle 1| $ trace was not preserved.
                  "
                ></ng-katex-paragraph>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="step2">
        <h4>Step 2: Randomized Benchmarking Parameters</h4>

        <div class="row mb-3">
          <label for="shots" class="col-sm-2 col-form-label">Shots</label>
          <div class="col-sm-10">
            <input type="number" class="form-control" id="shots" [(ngModel)]="model.shots" />
            <div id="passwordHelpBlock" class="form-text">How many shots should we execute at each depth</div>
          </div>
        </div>

        <div class="row mb-3">
          <label for="depths" class="col-sm-2 col-form-label">Depths</label>
          <div class="col-sm-10">
            <input type="email" class="form-control" id="depths" [(ngModel)]="model.depthStr" />
            <div id="passwordHelpBlock" class="form-text">At what circuit depths should we analyze</div>
          </div>
        </div>

        <div class="row mb-3">
          <label for="gates" class="col-sm-2 col-form-label">Gates</label>
          <div class="col-sm-10">
            <input type="email" class="form-control" id="gates" [(ngModel)]="model.gateStr" />
            <div id="passwordHelpBlock" class="form-text">What gates should we include (X, Y, Z, H, S, T)</div>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" (click)="simulate()">Simulate</button>
      </div>

      <div id="step3">
        <h4>Step 3: Results</h4>

        <div class="progress" *ngIf="progress.enabled">
          <div
            class="progress-bar"
            role="progressbar"
            style="width: {{ (progress.shot * 100) / model.shots }}%;"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {{ progress.shot }} / {{ model.shots }}
          </div>
        </div>

        <app-plot-rb-results
          *ngIf="results.enabled"
          [depths]="results.depths"
          [results]="results.results"
          [shots]="model.shots"
        ></app-plot-rb-results>
      </div>
      <div id="footer">Made with &#9829; by <a href="https://blog.c0nrad.io">blog.c0nrad.io</a></div>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = "rb";

  model: any = {
    depolarizingError: {
      enabled: true,
      p1: 0.001,
    },

    spamError: {
      enabled: true,
      p2: 0.01,
    },

    decoherenceError: {
      enabled: true,
      t1: 0.1,
      t2: 0.1,
      tg: 0.0001,
    },

    shots: 100,
    depthStr: "10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250",
    gateStr: "X, Y, Z, H, S, T, I",
  };

  progress: any = {
    enabled: false,
    shot: 0,
    depth: 0,
  };

  results: any = {
    enabled: false,
    depths: [],
    results: [],
  };

  constructor(private ngZone: NgZone) {
    this.simulate();
  }

  getGates(gateStr: string): Gate[] {
    let out = [];
    for (let gate of gateStr.split(",").map((x: string) => x.trim())) {
      switch (gate) {
        case "X":
          out.push(XGate);
          break;
        case "Y":
          out.push(YGate);
          break;
        case "Z":
          out.push(ZGate);
          break;
        case "H":
          out.push(HadamardGate);
          break;
        case "S":
          out.push(SGate);
          break;
        case "T":
          out.push(TGate);
          break;
        case "I":
          out.push(IdentityGate);
          break;
        default:
          throw new Error("unknown gate: " + gate);
      }
    }
    return out;
  }

  simulate() {
    let depths = this.model.depthStr
      .split(",")
      .map((x: string) => x.trim())
      .map(Number);

    let gates = this.getGates(this.model.gateStr);

    let noise = [];
    if (this.model.depolarizingError.enabled) {
      noise.push(new DepolarizingNoise(this.model.depolarizingError.p1));
    }

    if (this.model.spamError.enabled) {
      noise.push(new SPAMNoise(this.model.spamError.p2));
    }

    if (this.model.decoherenceError.enabled) {
      noise.push(new DecoherenceNoise(this.model.decoherenceError.t1, this.model.decoherenceError.t2, this.model.decoherenceError.tg));
    }

    console.log(noise);

    let rb = new RandomizedBenchmarking(depths, this.model.shots, gates, new NoiseGroup(noise));

    this.progress = {
      enabled: false,
      depth: 0,
      shot: 0,
    };

    // this.results = {
    //   enabled: false,
    //   depths: [],
    //   results: [],
    // };

    rb.progress_callback = (shot, depth) => {
      this.ngZone.run(() => {
        this.progress.enabled = true;
        this.progress.depth = depth;
        this.progress.shot += 1;

        // please don't judge me.
        if (this.progress.shot == this.model.shots) {
          this.progress.enabled = false;
          this.results = {
            depths: depths,
            results: rb.results,
            enabled: true,
          };
        }
      });
    };

    for (let shot = 0; shot < this.model.shots; shot++) {
      setTimeout(
        (shot: number) => {
          rb.execute_shot(shot);
        },
        0,
        [shot]
      );
    }
  }
}

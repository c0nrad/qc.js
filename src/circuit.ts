import { DensityMatrix } from "./density";
import { Gate } from "./gates";
import { Matrix } from "./matrix";
import { DepolarizingNoise, Noiseless, NoiseModel } from "./noise";

export class Moment {}

export class Circuit {
  moments: Gate[];
  qubit_count: number;
  density: DensityMatrix;

  noise: NoiseModel;

  constructor(qubit_count: number) {
    this.moments = [];
    this.qubit_count = qubit_count;
    this.density = DensityMatrix.fromInitialState(Array(qubit_count).fill(0));
    this.noise = new Noiseless();
  }

  reset() {
    this.density = DensityMatrix.fromInitialState(
      Array(this.qubit_count).fill(0)
    );
  }

  append(gate: Gate) {
    this.moments.push(gate);
  }

  execute(): number[] {
    this.density = this.noise.after_preparation(this.density);
    for (let gate of this.moments) {
      this.density = this.density.evolve(gate.matrix);
      this.density = this.noise.after_gate(this.density);
    }

    this.density = this.noise.before_measurement(this.density);

    return this.density.measure_full();
  }

  execute_many(shots: number): any {
    let out: any = {};
    let initial_density = this.density;

    for (let i = 0; i < shots; i++) {
      this.density = initial_density;

      let result = this.execute();
      let resultStr = result.join("");
      if (!out[resultStr]) {
        out[resultStr] = 1;
      } else {
        out[resultStr] += 1;
      }
    }
    return out;
  }
}

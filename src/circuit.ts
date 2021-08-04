import { DensityMatrix } from "./density";
import { Gate } from "./gates";
import { Matrix } from "./matrix";
import { Moment } from "./moment";
import { DepolarizingNoise, Noiseless, NoiseModel } from "./noise";

export class Circuit {
  moments: Moment[];
  qubitCount: number;
  density: DensityMatrix;

  noise: NoiseModel;

  constructor(qubit_count: number) {
    this.moments = [];
    this.qubitCount = qubit_count;
    this.density = DensityMatrix.fromInitialState(Array(qubit_count).fill(0));
    this.noise = new Noiseless();
  }

  reset() {
    this.density = DensityMatrix.fromInitialState(
      Array(this.qubitCount).fill(0)
    );
  }

  // insert(gate: Gate, momentIndex: number, qubit: number) {}

  append(gate: Gate, gateIndexes: number[], controlIndexes: number[]) {
    this.moments.push(
      new Moment(gate, gateIndexes, controlIndexes, this.qubitCount)
    );
  }

  execute(): number[] {
    this.density = this.noise.after_preparation(this.density);
    for (let moment of this.moments) {
      this.density = this.density.evolve(moment.unitary);
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

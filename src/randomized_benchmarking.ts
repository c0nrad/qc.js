import { Circuit } from "./circuit";
import { CliffordGates, Gate, XGate } from "./gates";
import { DepolarizingNoise, NoiseModel } from "./noise";

export class RandomizedBenchmarking {
  depths: number[];
  shots_per_depth: number;
  gates: Gate[];
  noise: NoiseModel;

  results: number[];

  progress_callback: (shot: number, depth: number) => any = () => {};

  constructor(
    depths = [2, 4, 8, 16, 32, 64],
    shots_per_depth = 25,
    gates: Gate[],
    noise: NoiseModel
  ) {
    this.depths = depths;
    this.shots_per_depth = shots_per_depth;
    this.gates = gates;
    this.results = [];
    this.noise = noise;

    this.results = Array(this.depths.length).fill(0);
  }

  execute() {
    for (let shot = 0; shot < this.shots_per_depth; shot++) {
      this.execute_shot(shot);
    }
  }

  execute_shot(shot: number) {
    this.progress_callback(shot, 0);

    for (let depth_index = 0; depth_index < this.depths.length; depth_index++) {
      let depth = this.depths[depth_index];

      let c1 = new Circuit(1);
      c1.noise = this.noise;

      let gates: Gate[] = [];
      let uncompute_gates: Gate[] = [];

      for (let i = 0; i < depth / 2; i++) {
        let random_gate =
          this.gates[Math.floor(Math.random() * this.gates.length)];

        gates.push(random_gate);
        uncompute_gates.unshift(random_gate.inverse());
      }
      c1.moments = gates.concat(uncompute_gates);

      if (c1.execute()[0] == 0) {
        this.results[depth_index] += 1;
      }
    }
  }
}

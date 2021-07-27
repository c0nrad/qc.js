import { Complex } from "./complex";
import { MGate, QubitOneState, QubitZeroState } from "./gates";
import { Matrix } from "./matrix";

export class DensityMatrix extends Matrix {
  constructor(components: Complex[][]) {
    super(components);
  }

  static fromInitialState(initialState: number[]): DensityMatrix {
    let out = new Matrix([]);

    for (let i of initialState) {
      if (i == 1) {
        out = out.tensor(QubitOneState);
      } else if (i == 0) {
        out = out.tensor(QubitZeroState);
      } else {
        throw new Error(`input state must be one or zero, not ${i}`);
      }
    }
    return new DensityMatrix(out.mulMatrix(out.transpose()).components);
  }

  static zero(bits: number): DensityMatrix {
    return new DensityMatrix(
      Matrix.zero(Math.pow(2, bits), Math.pow(2, bits)).components
    );
  }

  evolve(unitary: Matrix): DensityMatrix {
    // this.assert_unitary();

    // this.assert_trace("before");

    let out = new DensityMatrix(
      unitary.mulMatrix(this).mulMatrix(unitary.adjoint()).components
    );

    // this.assert_trace("after");

    return out;
  }

  assert_trace(msg = "") {
    if (!this.trace().equals(new Complex(1, 0), 0.001)) {
      throw new Error("trace not equal to 1: " + this.trace() + ", " + msg);
    }
  }

  measure(measurement: Matrix): Complex {
    if (!measurement.isHermitian()) {
      throw new Error("measurement must be hermitian");
    }

    return measurement.adjoint().mulMatrix(measurement).mulMatrix(this).trace();
  }

  measure_full(): number[] {
    let qubit_count = Math.log2(this.components.length);
    let random_value = Math.random();

    this.assert_trace("measure_full");

    let results = Array(qubit_count).fill(0);
    while (true) {
      // let measaure_probability = this.measure(MGate(results).matrix).real;

      random_value -= this.measure(MGate(results).matrix).real;
      // console.log("after measure", random_value);
      if (random_value < 0) {
        break;
      }

      results = increment_binary_array(results);
    }

    return results;
  }

  normalize(): DensityMatrix {
    return new DensityMatrix(
      this.mulScalar(new Complex(1 / this.trace().real, 0)).components
    );
  }

  isPure(): boolean {
    return this.mulMatrix(this).trace().real <= 1;
  }
}

export function increment_binary_array(arr: number[]): number[] {
  arr.reverse();

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == 1) {
      arr[i] = 0;
    } else {
      arr[i] = 1;
      arr.reverse();
      return arr;
    }
  }
  throw new Error("out of bounds: " + JSON.stringify(arr));
}

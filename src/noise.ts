// Depolarizing Noise

import { Complex } from "./complex";
import { DensityMatrix } from "./density";
import {
  MGate,
  Projection,
  QubitOneState,
  QubitZeroState,
  XGate,
  YGate,
  ZGate,
} from "./gates";
import { identity, Matrix } from "./matrix";

export abstract class NoiseModel {
  abstract after_preparation(density: DensityMatrix): DensityMatrix;
  abstract after_gate(density: DensityMatrix): DensityMatrix;
  abstract before_measurement(density: DensityMatrix): DensityMatrix;
}

export class Noiseless extends NoiseModel {
  constructor() {
    super();
  }

  after_preparation(density: DensityMatrix): DensityMatrix {
    return density;
  }

  after_gate(density: DensityMatrix): DensityMatrix {
    return density;
  }

  before_measurement(density: DensityMatrix): DensityMatrix {
    return density;
  }
}

export class SPAMNoise extends NoiseModel {
  operators: Matrix[];

  constructor(p: number) {
    super();
    this.operators = [];
    this.operators.push(
      identity(2).mulScalar(new Complex(Math.sqrt(1 - p), 0))
    );

    this.operators.push(XGate.matrix.mulScalar(new Complex(Math.sqrt(p), 0)));
  }

  after_preparation(density: DensityMatrix): DensityMatrix {
    let out = DensityMatrix.zero(1);

    for (let operator of this.operators) {
      out = new DensityMatrix(
        out.add(
          operator.mulMatrix(density).mulMatrix(operator.adjoint())
        ).components
      );
    }

    return out;
  }

  after_gate(density: DensityMatrix): DensityMatrix {
    return density;
  }

  before_measurement(density: DensityMatrix): DensityMatrix {
    return this.after_preparation(density);
  }
}

export class DepolarizingNoise extends NoiseModel {
  operators: Matrix[];

  constructor(p: number) {
    super();

    this.operators = [];
    this.operators.push(
      identity(2).mulScalar(new Complex(Math.sqrt(1 - p), 0))
    );

    this.operators.push(
      XGate.matrix.mulScalar(new Complex(Math.sqrt(p / 3), 0))
    );

    this.operators.push(
      ZGate.matrix.mulScalar(new Complex(Math.sqrt(p / 3), 0))
    );

    this.operators.push(
      YGate.matrix.mulScalar(new Complex(Math.sqrt(p / 3), 0))
    );

    assert_trace_preserving_operators(this.operators);
  }

  after_preparation(density: DensityMatrix): DensityMatrix {
    return density;
  }

  after_gate(density: DensityMatrix): DensityMatrix {
    let out = DensityMatrix.zero(1);

    density.assert_trace("before after_gate");

    for (let operator of this.operators) {
      out = new DensityMatrix(
        out.add(
          operator.mulMatrix(density).mulMatrix(operator.adjoint())
        ).components
      );
    }

    out.assert_trace("after after_gate");

    return out;
  }

  before_measurement(density: DensityMatrix): DensityMatrix {
    return density;
  }
}

export class DecoherenceNoise extends NoiseModel {
  operators: Matrix[];
  constructor(T1: number, T2: number, Tg: number) {
    super();

    console.log(T1, T2, Tg);
    if (T2 > 2 * T1) {
      throw new Error("invalid decoherence parameters");
    }

    let p_t1 = Math.exp(-Tg / T1);
    let p_t2 = Math.exp(-Tg / T2);

    let p_reset = 1 - p_t1;
    let p_z = ((1 - p_reset) * (1 - p_t2 / p_t1)) / 2;
    let p_i = 1 - p_z - p_reset;

    console.log(p_reset, p_z, p_i);

    let m01 = QubitZeroState.mulMatrix(QubitOneState.transpose());

    this.operators = [];
    this.operators.push(identity(2).mulScalar(new Complex(Math.sqrt(p_i), 0)));
    this.operators.push(ZGate.matrix.mulScalar(new Complex(Math.sqrt(p_z), 0)));
    this.operators.push(
      Projection([0]).matrix.mulScalar(new Complex(Math.sqrt(p_reset), 0))
    );
    this.operators.push(m01.mulScalar(new Complex(Math.sqrt(p_reset), 0)));

    assert_trace_preserving_operators(this.operators);
  }
  after_preparation(density: DensityMatrix): DensityMatrix {
    return density;
  }

  after_gate(density: DensityMatrix): DensityMatrix {
    let out = DensityMatrix.zero(1);

    density.assert_trace("decoherence after_gate before");

    for (let operator of this.operators) {
      out = new DensityMatrix(
        out.add(
          operator.mulMatrix(density).mulMatrix(operator.adjoint())
        ).components
      );
    }

    // out = out.normalize();
    out.assert_trace("decoherence after_gate after");

    return out;
  }

  before_measurement(density: DensityMatrix): DensityMatrix {
    return density;
  }
}

export class BitFlipNoise extends NoiseModel {
  //untested
  operators: Matrix[];
  constructor(p: number) {
    super();

    this.operators = [];
    this.operators.push(
      identity(2).mulScalar(new Complex(Math.sqrt(1 - p * p), 0))
    );
    this.operators.push(XGate.matrix.mulScalar(new Complex(p, 0)));

    assert_trace_preserving_operators(this.operators);
  }
  after_preparation(density: DensityMatrix): DensityMatrix {
    return density;
  }

  after_gate(density: DensityMatrix): DensityMatrix {
    let out = DensityMatrix.zero(1);

    density.assert_trace("decoherence after_gate before");

    for (let operator of this.operators) {
      operator.assert_hermitian("decoherence after_gate");

      out = new DensityMatrix(
        out.add(
          operator.mulMatrix(density).mulMatrix(operator.adjoint())
        ).components
      );
    }

    out.assert_trace("decoherence after_gate after");

    return out;
  }

  before_measurement(density: DensityMatrix): DensityMatrix {
    return density;
  }
}

export class NoiseGroup extends NoiseModel {
  models: NoiseModel[];

  constructor(models: NoiseModel[]) {
    super();

    this.models = models;
  }

  after_preparation(density: DensityMatrix): DensityMatrix {
    for (let model of this.models) {
      density = model.after_preparation(density);
    }
    return density;
  }

  after_gate(density: DensityMatrix): DensityMatrix {
    for (let model of this.models) {
      density = model.after_gate(density);
    }
    return density;
  }

  before_measurement(density: DensityMatrix): DensityMatrix {
    for (let model of this.models) {
      density = model.before_measurement(density);
    }
    return density;
  }
}

function assert_trace_preserving_operators(operators: Matrix[]) {
  let out = Matrix.zero(2, 2);
  for (let operator of operators) {
    out = out.add(operator.adjoint().mulMatrix(operator));
  }
  if (!out.equals(identity(2))) {
    out.print();
    throw new Error("operators are not identity");
  }
}

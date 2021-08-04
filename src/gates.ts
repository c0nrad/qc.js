import { Complex } from "./complex";
import { Matrix } from "./matrix";

export let QubitZeroState = new Matrix([
  [new Complex(1, 0)],
  [new Complex(0, 0)],
]);
export let QubitOneState = new Matrix([
  [new Complex(0, 0)],
  [new Complex(1, 0)],
]);

export class Gate {
  matrix: Matrix;
  symbol: string;

  constructor(symbol: string, matrix: Matrix) {
    this.matrix = matrix;
    this.symbol = symbol;
  }

  operands(): number {
    return Math.log2(this.matrix.height());
  }

  isControl(): boolean {
    return this.symbol == "C" && this.matrix.height() == 0;
  }

  inverse(): Gate {
    return new Gate(this.symbol + "t", this.matrix.adjoint());
  }
}

export let XGate = new Gate(
  "X",
  new Matrix([
    [new Complex(0, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(0, 0)],
  ])
);

export let YGate = new Gate(
  "Y",
  new Matrix([
    [new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0, 0)],
  ])
);

export let ZGate = new Gate(
  "Z",
  new Matrix([
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0)],
  ])
);

export let SGate = new Gate(
  "S",
  new Matrix([
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 1)],
  ])
);

export let TGate = new Gate(
  "S",
  new Matrix([
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(1 / Math.SQRT2, 1 / Math.SQRT2)],
  ])
);

export let HadamardGate = new Gate(
  "H",
  new Matrix([
    [new Complex(1, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(-1, 0)],
  ]).mulScalar(new Complex(1 / Math.SQRT2, 0))
);

export let IdentityGate = new Gate(
  "I",
  new Matrix([
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(1, 0)],
  ])
);

export let CNOTGate = new Gate(
  "CNOT",
  new Matrix([
    [
      new Complex(1, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(0, 0),
    ],
    [
      new Complex(0, 0),
      new Complex(1, 0),
      new Complex(0, 0),
      new Complex(0, 0),
    ],
    [
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(1, 0),
    ],
    [
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(1, 0),
      new Complex(0, 0),
    ],
  ])
);

export function MGate(state: number[]): Gate {
  let out = new Matrix([]);

  for (let i of state) {
    if (i == 1) {
      out = out.tensor(QubitOneState);
    } else if (i == 0) {
      out = out.tensor(QubitZeroState);
    } else {
      throw new Error(`input state must be one or zero, not ${i}`);
    }
  }

  return new Gate("M", out.mulMatrix(out.transpose()));
}

export function BuildProjectionMatrix(state: number[]): Matrix {
  return MGate(state).matrix;
}

export let CliffordGates = [XGate, YGate, ZGate, HadamardGate];

// var SdGate = Gate{
// 	Matrix: *NewMatrixFromElements([][]Complex{
// 		{Complex(complex(1, 0)), Complex(complex(0, 0))},
// 		{Complex(complex(0, 0)), Complex(cmplx.Exp(-1i * math.Pi / 2))},
// 	}),
// 	Name:    "Sd",
// 	Symbol:  "Sd",
// 	IsBoxed: true,
// }

// var TdGate = Gate{
// 	Matrix: *NewMatrixFromElements([][]Complex{
// 		{Complex(complex(1, 0)), Complex(complex(0, 0))},
// 		{Complex(complex(0, 0)), Complex(cmplx.Exp(-1i * math.Pi / 4))},
// 	}),
// 	Name:    "T",
// 	Symbol:  "Td",
// 	IsBoxed: true,
// }

// func ROT(angle float64, symbol string) Gate {
// 	return Gate{
// 		Matrix: *NewMatrixFromElements([][]Complex{
// 			{Complex(complex(1, 0)), Complex(complex(0, 0))},
// 			{Complex(complex(0, 0)), Complex(cmplx.Exp(1i * complex(angle, 0)))},
// 		}),
// 		Name:    "ROT",
// 		Symbol:  symbol,
// 		IsBoxed: false,
// 	}
// }

// func SWAP(gap int) Gate {
// 	bits := gap + 2
// 	m := ConstructNIdentity(bits).Matrix
// 	length := int(math.Pow(2, float64(bits)))
// 	offset := length/2 - 1

// 	for i := 1; i < length/2; i += 2 {
// 		m.Set(i, i, NewComplex(0, 0))
// 		m.Set(i+offset, i, NewComplex(1, 0))
// 		m.Set(i, i+offset, NewComplex(1, 0))
// 	}

// 	for i := length / 2; i < length; i += 2 {
// 		m.Set(i, i, NewComplex(0, 0))

// 	}

// 	return Gate{
// 		Matrix:  m,
// 		Name:    "SWAP",
// 		Symbol:  "X",
// 		IsBoxed: false,
// 	}
// }

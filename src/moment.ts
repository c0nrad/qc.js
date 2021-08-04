import {
  Gate,
  IdentityGate,
  BuildProjectionMatrix as buildProjectionMatrix,
} from "./gates";
import {
  buildIdentityMatrix as buildIdentityMatrix,
  identity,
  Matrix,
} from "./matrix";

export class Moment {
  readonly gate: Gate;
  readonly unitary: Matrix;

  readonly gateIndexes: number[];
  readonly controlIndexes: number[];

  constructor(
    gate: Gate,
    indexes: number[],
    controls: number[],
    qubitCount: number
  ) {
    this.gate = gate;
    this.gateIndexes = indexes;
    this.controlIndexes = controls;

    this.unitary = buildMomentMatrix(
      this.gateIndexes,
      this.controlIndexes,
      qubitCount,
      gate.matrix
    );
  }
}

export function buildMomentMatrix(
  gateIndexes: number[],
  controlIndexes: number[],
  qubitCount: number,
  gateMatrix: Matrix
): Matrix {
  assertNoCollisions(gateIndexes, controlIndexes, qubitCount, gateMatrix);

  let startIndex = gateIndexes[0];
  let upIndex = startIndex - 1;
  let downIndex = startIndex + 1;
  let out = gateMatrix;
  while (true) {
    if (upIndex < 0 && downIndex >= qubitCount) {
      break;
    }

    if (upIndex >= 0) {
      // is control
      if (controlIndexes.indexOf(upIndex) > -1) {
        out = buildControlGateMatrix(1, 0, out.qubitCount() + 1, out);
        upIndex--;
        continue;
      }

      // is gate
      let foundGate = false;
      for (let gateIndex of gateIndexes) {
        for (
          let gateHeight = 0;
          gateHeight < gateMatrix.qubitCount();
          gateHeight++
        ) {
          if (gateIndex + gateHeight == upIndex) {
            out = gateMatrix.tensor(out);
            upIndex = gateIndex;
            foundGate = true;
            break;
          }
        }
      }
      if (foundGate) {
        continue;
      }

      // is empty
      out = buildIdentityMatrix(1).tensor(out);
      upIndex--;
    }

    if (downIndex < qubitCount) {
      if (controlIndexes.indexOf(downIndex) > -1) {
        out = buildControlGateMatrix(0, 1, out.qubitCount() + 1, out);
        downIndex++;
        continue;
      }

      // is gate
      if (gateIndexes.indexOf(downIndex) > -1) {
        out = out.tensor(gateMatrix);
        downIndex = downIndex + gateMatrix.qubitCount();
        continue;
      }

      // is empty
      out = out.tensor(buildIdentityMatrix(1));
      downIndex++;
    }
  }
  return out;

  // }

  // for (let controlIndex of controlIndexes) {
  //   neighborGate()

  //   if (isGateAt(i, gateIndexes, gateMatrix)) {
  //     gateMatrixes.push(gateMatrix);
  //     i += gateMatrix.qubitCount() - 1;
  //     continue;
  //   }

  //   if (isControlAt(i, gateIndexes, gateMatrix)) {
  //   }
  // }
}

// export function neighborGate(
//   startIndex: number,
//   gateIndexes: number[],
//   controlIndexes: number[],
//   qubitCount: number,
//   gateMatrix: Matrix
// ): number {
//   let checkBefore = true
//   let checkAfter = true
//   for (let offset = 0; offset > 0 || offset < qubitCount; offset++) {

//     if (controlIndexes.indexOf(startIndex - offset) > -1) {
//       checkBefore = false
//     }

//     if (controlIndexes.indexOf(startIndex + offset) > -1) {
//       checkAfter = false
//     }

//     // before
//     for (let gateIndex of gateIndexes) {
//       for (
//         let gateHeight = 0;
//         gateHeight < gateMatrix.qubitCount();
//         gateHeight++
//       ) {
//         if (gateIndex + gateHeight == startIndex - offset) {
//           return gateIndex
//         }
//     }

//     // after
//     for (let gateIndex of gateIndexes) {
//       if (gateIndex == startIndex + offset) {
//         return gateIndex
//       }
//     }
//   }
//   return -1
// }

export function isGateAt(
  checkIndex: number,
  gateIndexes: number[],
  gateMatrix: Matrix
): boolean {
  for (let gateIndex of gateIndexes) {
    for (
      let gateHeight = 0;
      gateHeight < gateMatrix.qubitCount();
      gateHeight++
    ) {
      if (gateIndex + gateHeight == checkIndex) {
        return true;
      }
    }
  }
  return false;
}

export function assertNoCollisions(
  gateIndexes: number[],
  controlIndexes: number[],
  qubitCount: number,
  gateMatrix: Matrix
) {
  gateMatrix.assertSquare();

  // console.log(gateIndexes, controlIndexes, qubitCount, gateMatrix);

  let wires = Array(qubitCount).fill("");
  for (let i = 0; i < qubitCount; i++) {
    if (gateIndexes.indexOf(i) > -1) {
      for (let o = 0; o < gateMatrix.qubitCount(); o++) {
        if (i + o > qubitCount) {
          throw new Error(
            `Gate sticks off end of circuit. ${JSON.stringify(wires)}`
          );
        }

        if (wires[i + o] != "") {
          throw new Error(
            `Can not place gate at ${i}. ${JSON.stringify(wires)}`
          );
        }
        wires[i + o] = "g";
      }
    }
    if (controlIndexes.indexOf(i) > -1) {
      if (wires[i] != "") {
        throw new Error(
          `Can not place control at ${i}. ${JSON.stringify(wires)}`
        );
      }
    }
  }
}

// func ConstructMomentMatrix(moment Moment) Matrix {
// 	gates := []Gate{}
// 	// if moment.Gate.Symbol == "SWAP" {
// 	// 	return ConstructSwapMomentMatrix(moment)
// 	// }
// 	for i := 0; i < moment.Size; i++ {
// 		if moment.IsGateAt(i) {
// 			gates = append(gates, moment.Gate)
// 			i += (moment.Gate.Operands() - 1)
// 		} else if moment.IsControlAt(i) {
// 			gates = append(gates, Gate{Matrix: *NewMatrix(), Symbol: "C"})
// 		} else {
// 			gates = append(gates, I)
// 		}
// 	}
// 	// fmt.Println("gates", gates)
// 	for len(gates) != 1 {
// 		hasControl := false
// 		for _, g := range gates {
// 			if g.IsControl() {
// 				hasControl = true
// 				break
// 			}
// 		}
// 		if !hasControl {
// 			out := *NewMatrix()
// 			for _, g := range gates {
// 				out.TensorProduct(out, g.Matrix)
// 			}
// 			return out
// 		}
// 		for i, g := range gates {
// 			if g.IsControl() || g.Matrix.IsIdentity() {
// 				continue
// 			}
// 			gateIndex := i
// 			otherIndex := i + 1
// 			newSymbol := ""
// 			if i+1 >= len(gates) {
// 				otherIndex = i - 1
// 				newSymbol = gates[otherIndex].Symbol + gates[gateIndex].Symbol
// 			} else {
// 				newSymbol = gates[gateIndex].Symbol + gates[otherIndex].Symbol
// 			}
// 			// fmt.Println(gateIndex, otherIndex, gates[gateIndex].Symbol, gates[otherIndex].Symbol)
// 			var merged Gate
// 			if gates[otherIndex].IsControl() {
// 				if otherIndex > gateIndex {
// 					merged = ExtendControlGate(1, 0, 2, gates[gateIndex])
// 				} else {
// 					merged = ExtendControlGate(0, 1, 2, gates[gateIndex])
// 				}
// 			} else {
// 				if gateIndex < otherIndex {
// 					merged = Gate{Matrix: *NewMatrix().TensorProduct(gates[gateIndex].Matrix, gates[otherIndex].Matrix), Symbol: newSymbol}
// 				} else {
// 					merged = Gate{Matrix: *NewMatrix().TensorProduct(gates[otherIndex].Matrix, gates[gateIndex].Matrix), Symbol: newSymbol}
// 				}
// 			}
// 			gates[gateIndex] = merged
// 			gates = append(gates[:otherIndex], gates[otherIndex+1:]...)
// 			break
// 		}
// 	}

export function buildSimpleGateMatrix(
  gateIndex: number,
  qubitCount: number,
  gateMatrix: Matrix
): Matrix {
  let identityMatrix = buildIdentityMatrix(1);
  let out = Matrix.zero(0, 0);
  for (let i = 0; i < qubitCount; i++) {
    if (i == gateIndex) {
      out = out.tensor(gateMatrix);
      i += gateMatrix.qubitCount() - 1;
    } else {
      out = out.tensor(identityMatrix);
    }
  }
  return out;
}

export function buildControlGateMatrix(
  gateIndex: number,
  controlIndex: number,
  qubitCount: number,
  gateMatrix: Matrix
): Matrix {
  gateMatrix.assertSquare();

  let zeroProjection = buildProjectionMatrix([0]);
  let oneProjection = buildProjectionMatrix([1]);
  let identityMatrix = buildIdentityMatrix(1);

  let outControl = Matrix.zero(0, 0);
  let outGate = Matrix.zero(0, 0);
  for (let i = 0; i < qubitCount; i++) {
    if (i == controlIndex) {
      outControl = outControl.tensor(zeroProjection);
      outGate = outGate.tensor(oneProjection);
    } else if (i == gateIndex) {
      outControl = outControl.tensor(
        buildIdentityMatrix(gateMatrix.qubitCount())
      );

      outGate = outGate.tensor(gateMatrix);

      // skip a few indexes if the gate is big
      i += gateMatrix.qubitCount() - 1;
    } else {
      outControl = outControl.tensor(identityMatrix);
      outGate = outGate.tensor(identityMatrix);
    }
  }

  return outGate.add(outControl);
}

// func (m Moment) Verify() {
// 	if len(m.Indexes) > 1 && len(m.Controls) > 1 {
// 		panic("both indexes and controls can not be greater than 1")
// 	}
// }

// func (m Moment) HasConnectionAbove(i int) bool {

// 	if len(m.Controls) == 0 && m.Gate.IsBoxed {
// 		return false
// 	}

// 	existBelow := false
// 	// does there exist something below i?
// 	for g := i; g < m.Size; g++ {
// 		if m.IsGateAt(g) || m.IsControlAt(g) {
// 			existBelow = true
// 		}
// 	}

// 	existAbove := false
// 	for g := 0; g < i; g++ {
// 		if m.IsGateAt(g) || m.IsControlAt(g) {
// 			existAbove = true
// 		}
// 	}

// 	return existBelow && existAbove
// }

// func (m Moment) HasConnectionBelow(i int) bool {

// 	if len(m.Controls) == 0 && m.Gate.IsBoxed {
// 		return false
// 	}

// 	existAbove := false
// 	for g := 0; g <= i; g++ {
// 		if m.IsGateAt(g) || m.IsControlAt(g) {
// 			existAbove = true
// 		}
// 	}

// 	existBelow := false
// 	// does there exist something below i?
// 	for g := i + 1; g < m.Size; g++ {
// 		if m.IsGateAt(g) || m.IsControlAt(g) {
// 			existBelow = true
// 		}
// 	}

// 	return existBelow && existAbove
// }

// func (m Moment) Matrix() Matrix {
// 	out := ConstructMomentMatrix(m)
// 	if !out.IsUnitary() {
// 		out.PPrint()
// 		panic("matrix should be unitary")
// 	}

// 	// out := NewMatrix()

// 	// for i := 0; i < m.Size; i++ {
// 	// 	if m.IsGateAt(i) {
// 	// 		out.TensorProduct(*out, m.Gate.Matrix)
// 	// 	} else {
// 	// 		out.TensorProduct(*out, I.Matrix)
// 	// 	}
// 	// }

// 	return out
// }

// func ConstructMomentMatrix(moment Moment) Matrix {

// 	gates := []Gate{}

// 	// if moment.Gate.Symbol == "SWAP" {
// 	// 	return ConstructSwapMomentMatrix(moment)
// 	// }

// 	for i := 0; i < moment.Size; i++ {
// 		if moment.IsGateAt(i) {
// 			gates = append(gates, moment.Gate)
// 			i += (moment.Gate.Operands() - 1)
// 		} else if moment.IsControlAt(i) {
// 			gates = append(gates, Gate{Matrix: *NewMatrix(), Symbol: "C"})
// 		} else {
// 			gates = append(gates, I)
// 		}
// 	}

// 	// fmt.Println("gates", gates)

// 	for len(gates) != 1 {
// 		hasControl := false
// 		for _, g := range gates {
// 			if g.IsControl() {
// 				hasControl = true
// 				break
// 			}
// 		}

// 		if !hasControl {
// 			out := *NewMatrix()
// 			for _, g := range gates {
// 				out.TensorProduct(out, g.Matrix)
// 			}
// 			return out
// 		}

// 		for i, g := range gates {
// 			if g.IsControl() || g.Matrix.IsIdentity() {
// 				continue
// 			}

// 			gateIndex := i
// 			otherIndex := i + 1
// 			newSymbol := ""

// 			if i+1 >= len(gates) {
// 				otherIndex = i - 1
// 				newSymbol = gates[otherIndex].Symbol + gates[gateIndex].Symbol
// 			} else {
// 				newSymbol = gates[gateIndex].Symbol + gates[otherIndex].Symbol

// 			}

// 			// fmt.Println(gateIndex, otherIndex, gates[gateIndex].Symbol, gates[otherIndex].Symbol)

// 			var merged Gate
// 			if gates[otherIndex].IsControl() {
// 				if otherIndex > gateIndex {
// 					merged = ExtendControlGate(1, 0, 2, gates[gateIndex])
// 				} else {
// 					merged = ExtendControlGate(0, 1, 2, gates[gateIndex])
// 				}

// 			} else {
// 				if gateIndex < otherIndex {
// 					merged = Gate{Matrix: *NewMatrix().TensorProduct(gates[gateIndex].Matrix, gates[otherIndex].Matrix), Symbol: newSymbol}
// 				} else {
// 					merged = Gate{Matrix: *NewMatrix().TensorProduct(gates[otherIndex].Matrix, gates[gateIndex].Matrix), Symbol: newSymbol}
// 				}
// 			}

// 			gates[gateIndex] = merged
// 			gates = append(gates[:otherIndex], gates[otherIndex+1:]...)
// 			break
// 		}

// 	}

// 	return gates[0].Matrix
// }

// func (m Moment) String() string {
// 	return fmt.Sprintf("Moment{G: %s, Index: %d, Control: %d", m.Gate.Symbol, m.Indexes, m.Controls)
// }

// func ConstructSwapMomentMatrix(moment Moment) Matrix {
// 	return SWAP(2).Matrix
// }

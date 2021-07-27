import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { Complex } from "./complex";
import { identity, Matrix } from "./matrix";
import { DensityMatrix, increment_binary_array } from "./density";
import {
  CNOTGate,
  HadamardGate,
  MGate,
  TGate,
  XGate,
  YGate,
  ZGate,
} from "./gates";

describe("density", () => {
  it("simple gates", () => {
    let d1 = DensityMatrix.fromInitialState([0]);
    d1 = d1.evolve(XGate.matrix);
    let result = d1.measure(MGate([1]).matrix);
    expect(result.equals(new Complex(1, 0))).true;

    d1 = d1.evolve(XGate.matrix);
    expect(d1.measure(MGate([1]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([0]).matrix).equals(new Complex(1, 0))).true;
  });

  it("isPure", () => {
    let d1 = DensityMatrix.fromInitialState([0]);
    let d2 = DensityMatrix.fromInitialState([1]);

    expect(d1.isPure()).true;
    expect(d2.isPure()).true;
    expect(d1.measure_full()).eql([0]);
    expect(d2.measure_full()).eql([1]);
  });

  it("hadamard", () => {
    let d1 = DensityMatrix.fromInitialState([0]);
    d1 = d1.evolve(HadamardGate.matrix);
    expect(d1.measure(MGate([1]).matrix).equals(new Complex(0.5, 0))).true;
    expect(d1.measure(MGate([0]).matrix).equals(new Complex(0.5, 0))).true;
    d1 = d1.evolve(HadamardGate.matrix);

    expect(d1.measure(MGate([1]).matrix).equals(new Complex(0.0, 0))).true;
    expect(d1.measure(MGate([0]).matrix).equals(new Complex(1, 0))).true;
  });

  it("cnot", () => {
    let d1 = DensityMatrix.fromInitialState([1, 0]);
    d1 = d1.evolve(CNOTGate.matrix);

    expect(d1.measure(MGate([1, 1]).matrix).equals(new Complex(1, 0))).true;
    expect(d1.measure(MGate([1, 0]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([0, 0]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([0, 1]).matrix).equals(new Complex(0, 0))).true;

    d1 = d1.evolve(CNOTGate.matrix);
    expect(d1.measure(MGate([1, 1]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([1, 0]).matrix).equals(new Complex(1, 0))).true;
    expect(d1.measure(MGate([0, 0]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([0, 1]).matrix).equals(new Complex(0, 0))).true;
  });

  it("bell state", () => {
    let d1 = DensityMatrix.fromInitialState([0, 0]);
    d1 = d1.evolve(HadamardGate.matrix.tensor(identity(2)));
    d1 = d1.evolve(CNOTGate.matrix);

    expect(d1.measure(MGate([0, 0]).matrix).equals(new Complex(0.5, 0))).true;
    expect(d1.measure(MGate([1, 1]).matrix).equals(new Complex(0.5, 0))).true;
    expect(d1.measure(MGate([0, 1]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([1, 0]).matrix).equals(new Complex(0, 0))).true;
  });

  it("measure_full", () => {
    let d1 = DensityMatrix.fromInitialState([0, 0]);
    d1 = d1.evolve(HadamardGate.matrix.tensor(identity(2)));
    d1 = d1.evolve(CNOTGate.matrix);

    let counts: Record<string, number> = {};
    for (let i = 0; i < 100; i++) {
      let results = d1.measure_full();

      if (!counts[results.join("")]) {
        counts[results.join("")] = 1;
      } else {
        counts[results.join("")] += 1;
      }
    }

    expect(counts["11"]).gt(0);
    expect(counts["00"]).gt(0);
    expect(counts["01"]).equals(undefined);
    expect(counts["10"]).equals(undefined);
  });

  it("increment_binary_array", () => {
    expect(increment_binary_array([1, 0, 1])).eqls([1, 1, 0]);
    expect(increment_binary_array([0, 1, 1])).eqls([1, 0, 0]);
  });

  it("measure", () => {
    // let d1 = new DensityMatrix([
    //   [new Complex(0.9417402415990375, 0), new Complex(0, 0)],
    //   [new Complex(0, 0), new Complex(-0.005025918294277603, 0)],
    // ]);
    // console.log(
    //   d1.measure(MGate([0]).matrix).add(d1.measure(MGate([1]).matrix))
    // );
    // expect(
    //   d1
    //     .measure(MGate([0]).matrix)
    //     .add(d1.measure(MGate([1]).matrix))
    //     .equals(new Complex(1, 0))
    // ).true;
    // this.measure(MGate(results).matrix).real;
    // for (let i = 0; i < 1000; i++) {
    //   d1.measure_full();
    // }
  });

  it("trace preseving", () => {
    let d1 = DensityMatrix.fromInitialState([0]);
    d1 = d1.evolve(XGate.matrix);
    // d1 = d1.evolve(TGate.matrix);
    d1 = d1.evolve(YGate.matrix);

    expect(d1.trace().equals(new Complex(1, 0)));

    let result = d1.measure(MGate([1]).matrix);
  });

  it("normalize", () => {
    let d1 = DensityMatrix.fromInitialState([0]);
    expect(d1.normalize().equals(d1)).true;
  });
});

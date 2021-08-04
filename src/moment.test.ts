import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { Complex } from "./complex";
import { identity, Matrix } from "./matrix";
import { CNOTGate, HadamardGate, MGate, XGate } from "./gates";
import {
  assertNoCollisions,
  buildControlGateMatrix,
  buildMomentMatrix,
  buildSimpleGateMatrix,
} from "./moment";
import { DensityMatrix } from "./density";

describe("moment", () => {
  it("construct control gate", () => {
    expect(
      buildControlGateMatrix(1, 0, 2, XGate.matrix).equals(CNOTGate.matrix)
    ).true;
  });

  it("bell state via notc", () => {
    //   X M
    // H . M

    let d1 = DensityMatrix.fromInitialState([0, 0]);
    d1 = d1.evolve(buildSimpleGateMatrix(1, 2, HadamardGate.matrix));
    d1 = d1.evolve(buildControlGateMatrix(0, 1, 2, XGate.matrix));

    expect(d1.measure(MGate([0, 0]).matrix).equals(new Complex(0.5, 0))).true;
    expect(d1.measure(MGate([1, 1]).matrix).equals(new Complex(0.5, 0))).true;
    expect(d1.measure(MGate([0, 1]).matrix).equals(new Complex(0, 0))).true;
    expect(d1.measure(MGate([1, 0]).matrix).equals(new Complex(0, 0))).true;
  });

  it("ccnot", () => {
    let cnot = buildControlGateMatrix(1, 0, 2, XGate.matrix);
    let ccnot = buildControlGateMatrix(1, 0, 3, cnot);

    let d1 = DensityMatrix.fromInitialState([1, 1, 0]);
    d1 = d1.evolve(ccnot);
    expect(d1.measure(MGate([1, 1, 1]).matrix).equals(new Complex(1, 0))).true;

    d1 = d1.evolve(ccnot);
    expect(d1.measure(MGate([1, 1, 0]).matrix).equals(new Complex(1, 0))).true;

    let cnotc = buildControlGateMatrix(0, 2, 3, cnot);
    let d2 = DensityMatrix.fromInitialState([1, 0, 1]);
    d2 = d2.evolve(cnotc);
    expect(d2.measure(MGate([1, 1, 1]).matrix).equals(new Complex(1, 0))).true;
    d2 = d2.evolve(cnotc);
    expect(d2.measure(MGate([1, 1, 1]).matrix).equals(new Complex(0, 0))).true;
    expect(d2.measure(MGate([1, 0, 1]).matrix).equals(new Complex(1, 0))).true;
  });

  it("cinot", () => {
    let cinot = buildControlGateMatrix(2, 0, 3, XGate.matrix);
    let d1 = DensityMatrix.fromInitialState([1, 0, 0]);
    d1 = d1.evolve(cinot);
    expect(d1.measure(MGate([1, 0, 1]).matrix).equals(new Complex(1, 0))).true;
  });

  it("XIX", () => {
    let xix = buildMomentMatrix([0, 2], [], 3, XGate.matrix);
    let d1 = DensityMatrix.fromInitialState([1, 0, 0]);
    d1 = d1.evolve(xix);
    expect(d1.measure(MGate([0, 0, 1]).matrix).equals(new Complex(1, 0))).true;
  });

  it("XCX", () => {
    let xcx = buildMomentMatrix([0, 2], [1], 3, XGate.matrix);
    let d1 = DensityMatrix.fromInitialState([0, 0, 0]);
    d1 = d1.evolve(xcx);
    console.log(d1.measure_full());
    expect(d1.measure(MGate([1, 0, 0]).matrix).equals(new Complex(1, 0))).true;
  });

  it("assert_no_collisions", () => {
    expect(() => assertNoCollisions([0], [1], 2, XGate.matrix)).to.not.throw();
    expect(() => assertNoCollisions([0], [0], 2, XGate.matrix)).throw();
    expect(() => assertNoCollisions([0], [1], 2, CNOTGate.matrix)).throw();
    expect(() => assertNoCollisions([1], [0], 2, CNOTGate.matrix)).throw();
    expect(() => assertNoCollisions([1], [0], 3, CNOTGate.matrix)).not.throw();
  });

  it("buildMomentMatrix", () => {
    expect(buildMomentMatrix([1], [0], 2, XGate.matrix).equals(CNOTGate.matrix))
      .true;

    let notc = buildControlGateMatrix(0, 1, 2, XGate.matrix);
    expect(buildMomentMatrix([0], [1], 2, XGate.matrix).equals(notc)).true;

    let notcnotcc = buildMomentMatrix([0, 2], [1, 3, 4], 5, XGate.matrix);
    let d1 = DensityMatrix.fromInitialState([0, 1, 0, 1, 1]);
    d1 = d1.evolve(notcnotcc);
    expect(d1.measure(MGate([1, 1, 1, 1, 1]).matrix).equals(new Complex(1, 0)))
      .true;
  });
});

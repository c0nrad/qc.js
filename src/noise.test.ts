import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { Complex } from "./complex";
import { identity, Matrix } from "./matrix";
import { DensityMatrix } from "./density";
import {
  BitFlipNoise,
  DecoherenceNoise,
  DepolarizingNoise,
  NoiseGroup,
  SPAMNoise,
} from "./noise";
import { Circuit } from "./circuit";
import { HadamardGate, IdentityGate, SGate, XGate } from "./gates";

describe("noise class", () => {
  it("it should become maximally entangled", () => {
    let d1 = DensityMatrix.fromInitialState([0]);
    let nc1 = new DepolarizingNoise(0.01);

    for (let i = 0; i < 200; i++) {
      d1 = nc1.after_gate(d1);
    }

    expect(
      d1.equals(
        new Matrix([
          [new Complex(0.5, 0), new Complex(0, 0)],
          [new Complex(0, 0), new Complex(0.5, 0)],
        ]),
        0.1
      )
    ).true;
  });

  it("noisegroup", () => {
    let noise = new NoiseGroup([
      new DepolarizingNoise(0.001),
      new SPAMNoise(0.001),
      new DecoherenceNoise(0.05, 0.01, 0.001),
    ]);

    let c1 = new Circuit(1);
    c1.noise = noise;

    c1.append(XGate);
    for (let i = 0; i < 5; i++) {
      c1.append(IdentityGate);
    }

    let results = c1.execute_many(100);
    expect(3 * results["0"] < results["1"]).true;
  });
});

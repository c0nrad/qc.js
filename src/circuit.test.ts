import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { Complex } from "./complex";
import { Vector } from "./vector";
import { Matrix } from "./matrix";
import { Circuit } from "./circuit";
import { HadamardGate, SGate, TGate, XGate, YGate, ZGate } from "./gates";
import { DecoherenceNoise, DepolarizingNoise } from "./noise";

describe("circuit class", () => {
  it("simple circuit", () => {
    let c1 = new Circuit(1);
    c1.append(XGate, [0], []);
    expect(c1.execute()).eqls([1]);

    let c2 = new Circuit(1);
    c2.append(XGate, [0], []);
    c2.append(XGate, [0], []);
    expect(c2.execute()).eqls([0]);

    let c3 = new Circuit(1);
    c3.append(YGate, [0], []);
    c3.append(YGate, [0], []);
    expect(c3.execute()).eqls([0]);

    let c4 = new Circuit(1);
    c4.append(ZGate, [0], []);
    c4.append(ZGate, [0], []);
    expect(c4.execute()).eqls([0]);
  });

  it("noise circuit", () => {
    let c1 = new Circuit(1);
    // c1.noise = new DepolarizingNoise(0.1);
    c1.append(TGate, [0], []);
    c1.append(XGate, [0], []);
    c1.append(ZGate, [0], []);

    for (let i = 0; i < 100; i++) {
      let results = c1.execute();
    }
  });

  it("S gate rotation", () => {
    let c1 = new Circuit(1);
    c1.append(HadamardGate, [0], []);
    c1.append(SGate, [0], []);
    c1.append(SGate, [0], []);
    c1.append(SGate, [0], []);
    c1.append(SGate, [0], []);
    c1.append(HadamardGate, [0], []);

    let results = c1.execute_many(100);
    expect(results["0"]).equals(100);
  });

  it("x gate", () => {
    let c1 = new Circuit(1);
    c1.append(XGate, [0], []);
    let results = c1.execute_many(100);
    expect(results["1"]).equals(100);
  });

  // it("weird CXCIC", () => {
  //   let c1 = new Circuit(5);
  //   c1.append(XGate, [0, 2, 4], []);
  //   c1.append(XGate, [1], [0, 2, 4]);
  //   expect(c1.execute()).eqls([1, 1, 1, 0, 1]).true;
  // });
});

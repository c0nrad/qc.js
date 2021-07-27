import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { Complex } from "./complex";
import { identity, Matrix } from "./matrix";
import { DensityMatrix } from "./density";
import { DepolarizingNoise, SPAMNoise } from "./noise";
import { RandomizedBenchmarking } from "./randomized_benchmarking";
import { CliffordGates } from "./gates";

describe("randomized_benchmarking", () => {
  it("it should get worse...", () => {
    let rb = new RandomizedBenchmarking(
      [0, 10, 20, 30, 40, 50],
      10,
      CliffordGates,
      new DepolarizingNoise(0.1)
    );

    rb.execute();

    expect(rb.results[0] + rb.results[1] + rb.results[2]).gt(
      rb.results[3] + rb.results[4] + rb.results[5]
    );
  });

  it("rb SPAM experiment", () => {
    let rb = new RandomizedBenchmarking(
      [0, 10, 20, 30],
      5,
      CliffordGates,
      new SPAMNoise(0.01)
    );

    rb.execute();
  });
});

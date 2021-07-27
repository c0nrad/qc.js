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
  SGate,
  TGate,
  XGate,
  YGate,
  ZGate,
} from "./gates";

describe("gates", () => {
  it("inverse", () => {
    expect(HadamardGate.inverse().matrix.equals(HadamardGate.matrix)).true;
  });

  it("t s gate", () => {
    expect(TGate.matrix.mulMatrix(TGate.matrix).equals(SGate.matrix)).true;
  });
});

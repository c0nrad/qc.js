import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { Complex } from "./complex";
import { identity, Matrix } from "./matrix";

describe("matrix class", () => {
  it("at should respect order", () => {
    let m1 = new Matrix([
      [new Complex(0, 0), new Complex(1, 1)],
      [new Complex(2, 2), new Complex(3, 3)],
    ]);

    expect(m1.at(1, 0).equals(new Complex(1, 1))).to.be.true;
    expect(m1.at(0, 1).equals(new Complex(2, 2))).to.be.true;
    expect(m1.at(0, 0).equals(new Complex(0, 0))).to.be.true;
  });

  it("at should have size", () => {
    let m1 = new Matrix([[new Complex(1, 1), new Complex(2, 2)]]);

    expect(m1.width()).equals(2);
    expect(m1.height()).equals(1);
    expect(m1.at(1, 0).equals(new Complex(2, 2))).true;
  });

  it("should be able to add", () => {
    let m1 = new Matrix([
      [new Complex(0, 0), new Complex(1, 1)],
      [new Complex(2, 2), new Complex(3, 3)],
    ]);

    let m2 = new Matrix([
      [new Complex(0, 0), new Complex(2, 2)],
      [new Complex(4, 4), new Complex(6, 6)],
    ]);

    expect(m1.add(m1).equals(m2)).to.be.true;
  });

  it("should be able to sub", () => {
    let m1 = new Matrix([
      [new Complex(0, 0), new Complex(1, 1)],
      [new Complex(2, 2), new Complex(3, 3)],
    ]);

    let m2 = new Matrix([
      [new Complex(0, 0), new Complex(2, 2)],
      [new Complex(4, 4), new Complex(6, 6)],
    ]);

    expect(m2.sub(m1).equals(m1)).to.be.true;
  });

  it("should be able to transpose", () => {
    let m1 = new Matrix([[new Complex(1, 1), new Complex(2, 2)]]);
    expect(m1.at(1, 0).equals(new Complex(2, 2)));
    expect(m1.transpose().at(0, 1).equals(new Complex(2, 2)));
    expect(m1.transpose().at(0, 0).equals(new Complex(1, 1)));
    expect(m1.transpose().width()).equals(1);
    expect(m1.transpose().height()).equals(2);
  });

  it("mul scalar", () => {
    let m1 = new Matrix([[new Complex(1, 1), new Complex(2, 2)]]);
    let m2 = new Matrix([[new Complex(3, 3), new Complex(6, 6)]]);

    expect(m1.mulScalar(new Complex(3, 0)).equals(m2)).true;
    expect(m1.transpose().mulScalar(new Complex(3, 0)).equals(m2.transpose()))
      .true;
  });

  it("mul matrix", () => {
    let m1 = new Matrix([
      [new Complex(1, 0), new Complex(2, 0), new Complex(3, 0)],
      [new Complex(4, 0), new Complex(5, 0), new Complex(6, 0)],
    ]);
    let m2 = new Matrix([
      [new Complex(7, 0), new Complex(8, 0)],
      [new Complex(9, 0), new Complex(10, 0)],
      [new Complex(11, 0), new Complex(12, 0)],
    ]);

    let m3 = new Matrix([
      [new Complex(58, 0), new Complex(64, 0)],
      [new Complex(139, 0), new Complex(154, 0)],
    ]);

    expect(m1.mulMatrix(m2).equals(m3)).true;
  });

  it("hermitian", () => {
    let m1 = new Matrix([
      [new Complex(-1, 0), new Complex(0, -1)],
      [new Complex(0, 1), new Complex(1, 0)],
    ]);
    let m2 = new Matrix([
      [new Complex(-1, 0), new Complex(0, -1)],
      [new Complex(1, 1), new Complex(1, 0)],
    ]);

    expect(m1.isHermitian()).true;
    expect(m2.isHermitian()).false;
  });

  it("unitary", () => {
    let m1 = new Matrix([
      [new Complex(-1, 0), new Complex(0, -1)],
      [new Complex(0, 1), new Complex(1, 0)],
    ]);
    let m2 = new Matrix([
      [new Complex(-1, 0), new Complex(0, -1)],
      [new Complex(1, 1), new Complex(1, 0)],
    ]);

    expect(m1.isHermitian()).true;
    expect(m2.isHermitian()).false;
  });

  it("trace", () => {
    let m1 = new Matrix([
      [new Complex(-1, 0), new Complex(0, -1)],
      [new Complex(0, 1), new Complex(1, 0)],
    ]);
    expect(m1.trace().equals(new Complex(0, 0)));
  });

  it("identity", () => {
    let m1 = new Matrix([
      [new Complex(1, 0), new Complex(0, 0)],
      [new Complex(0, 0), new Complex(1, 0)],
    ]);
    expect(m1.equals(identity(2))).true;
    expect(new Matrix([[new Complex(1, 0)]]).equals(identity(1))).true;
  });

  it("tensor", () => {
    let m1 = new Matrix([[new Complex(2, 0)], [new Complex(3, 0)]]);

    let m2 = new Matrix([
      [new Complex(4, 0)],
      [new Complex(6, 0)],
      [new Complex(3, 0)],
    ]);

    let m3 = new Matrix([
      [new Complex(8, 0)],
      [new Complex(12, 0)],
      [new Complex(6, 0)],
      [new Complex(12, 0)],
      [new Complex(18, 0)],
      [new Complex(9, 0)],
    ]);
    expect(m1.tensor(m2).equals(m3)).true;
    expect(m1.transpose().tensor(m2.transpose()).equals(m3.transpose())).true;
  });

  it("outer product", () => {
    let m1 = new Matrix([[new Complex(1, 0)], [new Complex(0, 0)]]);
    expect(
      m1.mulMatrix(m1.transpose()).equals(
        new Matrix([
          [new Complex(1, 0), new Complex(0, 0)],
          [new Complex(0, 0), new Complex(0, 0)],
        ])
      )
    ).true;
  });

  it("zero", () => {
    let z1 = Matrix.zero(2, 3);
    expect(z1.width()).equals(2);
    expect(z1.height()).equals(3);
  });
});

import { Complex } from "./complex";

export class Matrix {
  readonly components: Complex[][];

  constructor(components: Complex[][]) {
    this.components = components;
  }

  static zero(width: number, height: number): Matrix {
    let out = [];
    for (let y = 0; y < height; y++) {
      let row = [];
      for (let x = 0; x < width; x++) {
        row.push(new Complex(0, 0));
      }
      out.push(row);
    }

    return new Matrix(out);
  }

  at(col: number, row: number): Complex {
    return this.components[row][col];
  }

  width(): number {
    return this.components[0].length;
  }

  height(): number {
    return this.components.length;
  }

  isEmpty(): boolean {
    return this.height() == 0;
  }

  add(other: Matrix): Matrix {
    this.assert_bounds(other);

    let out: Complex[][] = [];
    for (let row = 0; row < this.height(); row++) {
      let newRow: Complex[] = [];
      for (let col = 0; col < this.width(); col++) {
        newRow.push(this.at(col, row).add(other.at(col, row)));
      }
      out.push(newRow);
    }

    return new Matrix(out);
  }

  sub(other: Matrix): Matrix {
    this.assert_bounds(other);

    let out: Complex[][] = [];
    for (let row = 0; row < this.height(); row++) {
      let newRow: Complex[] = [];
      for (let col = 0; col < this.width(); col++) {
        newRow.push(this.at(col, row).sub(other.at(col, row)));
      }
      out.push(newRow);
    }

    return new Matrix(out);
  }

  print() {
    let out = "[";
    for (let row = 0; row < this.height(); row++) {
      out += "\n  [ ";
      for (let col = 0; col < this.width(); col++) {
        out += this.at(col, row) + ", ";
      }
      out += "]";
    }
    out += "\n]";
    console.log(out);
  }

  transpose(): Matrix {
    let out: Complex[][] = [];
    for (let col = 0; col < this.width(); col++) {
      let newRow: Complex[] = [];
      for (let row = 0; row < this.height(); row++) {
        newRow.push(this.at(col, row));
      }
      out.push(newRow);
    }

    return new Matrix(out);
  }

  assert_bounds(other: Matrix) {
    if (this.width() != other.width() || this.height() != other.height()) {
      throw new Error(
        `Invalid size: ${this.width()}x${this.height()} vs ${other.width()}x${other.height()}`
      );
    }
  }

  assert_square() {
    if (this.width() != this.height()) {
      throw new Error(
        `Invalid square dimensions ${this.width()} ${this.height()}`
      );
    }
  }

  equals(other: Matrix, epsilon: number = 0.00001): boolean {
    this.assert_bounds(other);

    for (let row = 0; row < this.height(); row++) {
      for (let col = 0; col < this.width(); col++) {
        if (!this.at(col, row).equals(other.at(col, row), epsilon)) {
          return false;
        }
      }
    }
    return true;
  }

  mulScalar(c: Complex): Matrix {
    let out: Complex[][] = [];
    for (let row = 0; row < this.height(); row++) {
      let newRow: Complex[] = [];
      for (let col = 0; col < this.width(); col++) {
        newRow.push(this.at(col, row).mul(c));
      }
      out.push(newRow);
    }

    return new Matrix(out);
  }

  conj(): Matrix {
    let out: Complex[][] = [];
    for (let row = 0; row < this.height(); row++) {
      let newRow: Complex[] = [];
      for (let col = 0; col < this.width(); col++) {
        newRow.push(this.at(col, row).conj());
      }
      out.push(newRow);
    }

    return new Matrix(out);
  }

  adjoint(): Matrix {
    return this.transpose().conj();
  }

  mulMatrix(other: Matrix): Matrix {
    if (this.width() != other.height()) {
      throw new Error(`invalid dimensions ${this.width()}, ${other.height()}`);
    }

    let out: Complex[][] = [];
    for (let row = 0; row < this.height(); row++) {
      let newRow: Complex[] = [];
      for (let col = 0; col < other.width(); col++) {
        let sum: Complex = new Complex(0, 0);
        for (let i = 0; i < other.height(); i++) {
          sum = sum.add(this.at(i, row).mul(other.at(col, i)));
        }
        newRow.push(sum);
      }
      out.push(newRow);
    }

    return new Matrix(out);
  }

  trace(): Complex {
    if (this.width() != this.height()) {
      throw new Error(
        `invalid dimensions for trace ${this.width()}, ${this.height()}`
      );
    }

    let out = new Complex(0, 0);
    for (let i = 0; i < this.width(); i++) {
      out = out.add(this.at(i, i));
    }
    return out;
  }

  isUnitary(): boolean {
    this.assert_square();
    return this.mulMatrix(this.adjoint()).equals(identity(this.width()));
  }

  isHermitian(): boolean {
    this.assert_square();
    return this.adjoint().equals(this);
  }

  assert_hermitian(msg: string) {
    if (!this.isHermitian()) {
      throw new Error("not hermitian: " + msg);
    }
  }

  assert_unitary(msg: string = "") {
    if (!this.isUnitary()) {
      throw new Error("not unitary: " + msg);
    }
  }

  tensor(other: Matrix): Matrix {
    if (other.isEmpty()) {
      return new Matrix(this.components);
    }

    if (this.isEmpty()) {
      return new Matrix(other.components);
    }

    let out = [];
    for (let y1 = 0; y1 < this.height(); y1++) {
      for (let y2 = 0; y2 < other.height(); y2++) {
        let row = [];
        for (let x1 = 0; x1 < this.width(); x1++) {
          for (let x2 = 0; x2 < other.width(); x2++) {
            row.push(this.at(x1, y1).mul(other.at(x2, y2)));
          }
        }
        out.push(row);
      }
    }

    return new Matrix(out);
  }
}

export function identity(width: number): Matrix {
  let out = [];
  for (let x = 0; x < width; x++) {
    let row = [];
    for (let y = 0; y < width; y++) {
      if (x == y) {
        row.push(new Complex(1, 0));
      } else {
        row.push(new Complex(0, 0));
      }
    }
    out.push(row);
  }
  return new Matrix(out);
}

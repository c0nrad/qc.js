export class Complex {
    readonly real: number 
    readonly imag: number 

    constructor(real: number, imag: number) {
        this.real = real 
        this.imag = imag
    }

    static fromPolar(r: number, theta: number) {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }

    add(other: Complex): Complex {
        return new Complex(this.real + other.real, this.imag + other.imag)
    }

    sub(other: Complex): Complex {
        return new Complex(this.real - other.real, this.imag - other.imag)
    }

    mul(other: Complex) {
        return new Complex(
            this.real * other.real - this.imag * other.imag,
            this.real * other.imag + this.imag * other.real
        )
    }

    div(other: Complex) {
        const divisor = other.real * other.real + other.imag * other.imag
        return new Complex(
            (this.real * other.real + this.imag * other.imag) / divisor,
            (this.imag * other.real - this.real * other.imag) / divisor
        )
    }

    magnitude() : number {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }

    phase() : number {
        return Math.atan2(this.imag, this.real);
    }

    conj() : Complex{
        return new Complex(this.real, -this.imag)
    }

    equals(other: Complex, epsilon : number = .000001): boolean {
        return Math.abs(other.real - this.real) < epsilon && Math.abs(other.imag - this.imag) < epsilon
    }

    toString(): string {
        return `Complex(${this.real}, ${this.imag})`
    }
}
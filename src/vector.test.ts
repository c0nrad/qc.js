
import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;

import { Complex } from './complex';
import { Vector } from './vector';

describe('vector class', () => {

    it('should be able to add', () => {
        let v1 = new Vector([new Complex(1,1), new Complex(2,2)])
        let v2 = new Vector([new Complex(3, 3), new Complex(4, 4)])
    });
})
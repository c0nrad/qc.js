
import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;

import { Complex } from './complex';

describe('complex class', () => {

    it('should be able to add', () => {
        let c1 = new Complex(2, 3);
        let c2 = new Complex(3, 4);

        expect(new Complex(5, 7).equals(c1.add(c2)));      
    });

})
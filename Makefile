test: 
	ts-mocha ./src/*.ts --watch --extension ts
	
rb: 
	cd demos/rb; ng serve;
test: 
	ts-mocha ./src/*.ts --watch --extension ts
	
rb: 
	cd demos/rb; ng serve;

deploy:
	cd demos/rb; ng build --prod --deploy-url "https://blog.c0nrad.io/qc.js/rb/" --base-href "https://blog.c0nrad.io/qc.js/rb/"
	mv demos/rb/dist/rb/* docs/rb/

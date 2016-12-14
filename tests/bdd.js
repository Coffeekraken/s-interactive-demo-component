import "babel-polyfill";
import "webcomponents.js/webcomponents-lite";
import "@webcomponents/shadydom";
import SInteractiveDemoComponent from '../index';
import { expect } from 'chai'
import _mochaTestingStack from 'coffeekraken-testing-stack/mocha';
const html = require('./fixture.html');

// preparing mocha
_mochaTestingStack.injectHTML(html);
_mochaTestingStack.run();

// tests
describe('s-interactive-demo', () => {
	let component, originalContent;
	before((done) => {
		// grab the component
		component = document.querySelector('s-interactive-demo');
		originalContent = component.innerHTML;
		setTimeout(done,1000);
	});
	afterEach(() => {
		component.onComponentDidUpdate = null;
	});
	it('Should have a _shadow property that contains all the component html', (done) => {
		if ( ! _component._shadow) done('The _shadow property does not exist...');
		done();
	});
});

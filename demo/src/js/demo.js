import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import compileServer from 'coffeekraken-compile-server'

SWebComponent.setDefaultProps({
	theme : 'material',
	updateOn : 'run',
	compile : compileServer.compile
}, 's-codemirror');
import SInteractiveDemoComponent from '../../../dist/index';
import SCodemirrorComponent from 'coffeekraken-s-codemirror-component';

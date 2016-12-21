import "webcomponents.js/webcomponents-lite";
import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import compileServer from '/data/web/coffeekraken/compile-server/dist/index.js'

SWebComponent.setDefaultProps({
	theme : 'material',
	updateOn : 'run',
	compile : (code, api) => {
		return new Promise((resolve, reject) => {
			if (compileServer[api.mode]) {
				resolve(compileServer[api.mode](code));
			} else {
				resolve(code);
			}
		});
	}
}, 's-codemirror');
import SInteractiveDemoComponent from '../../../dist/index';
import SCodemirrorComponent from 'coffeekraken-s-codemirror-component';
import SReadMoreComponent from 'coffeekraken-sugar/webcomponents/SReadMoreComponent';

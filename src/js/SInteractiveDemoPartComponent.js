import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import __throttle from 'coffeekraken-sugar/js/utils/functions/throttle'
import __dispatchEvent from 'coffeekraken-sugar/js/dom/dispatchEvent'
import Codemirror from 'codemirror'
import codemirrorCss from 'raw-loader!codemirror/lib/codemirror.css'
import Clipboard from 'clipboard';
import SAjax from 'coffeekraken-sugar/js/classes/SAjax'
require('codemirror/mode/htmlmixed/htmlmixed');
require('./codemirror/autoFormatRange');

export default class SInteractiveDemoPartComponent extends SWebComponent {

	/**
	 * Base css
	 * @definition 		SWebComponent.css
	 */
	static css(componentName, componentNameDash) {
		return `
			${componentNameDash} {
				position:relative;
			}
			${componentNameDash}:after {
				display: block;
				content:'';
				position:absolute;
				top:0; left:0;
				width:100%; height:100%;
				border-left:1px solid rgba(255,255,255,.5);
				z-index:10;
				mix-blend-mode:overlay;
				pointer-events:none;
			}${componentNameDash}:first-child:after {
				border-left:none;
			}
			${codemirrorCss}
			${componentNameDash} .CodeMirror{height:100%}
			${componentNameDash} .CodeMirror-lines {
				padding : 50px 20px 20px 10px;
			}
			.${componentNameDash}__copy {
				background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='#37A0CE' d='M15.143 13.244l.837-2.244 2.698 5.641-5.678 2.502.805-2.23s-8.055-3.538-7.708-10.913c2.715 5.938 9.046 7.244 9.046 7.244zm8.857-7.244v18h-18v-6h-6v-18h18v6h6zm-2 2h-12.112c-.562-.578-1.08-1.243-1.521-2h7.633v-4h-14v14h4v-3.124c.6.961 1.287 1.823 2 2.576v6.548h14v-14z'/></svg>");
				background-color:transparent;
				background-repeat:no-repeat;
				background-size:12px;
				background-position:0 50%;
				padding:5px 10px 5px 20px;
				color: #37A0CE;
				position:absolute;
				top:10px; right:10px;
				z-index:90;
				border:none;
				display:none;
				cursor:pointer;
				font-size:12px;
				font-family:monospace;
			}
			.${componentNameDash}__id {
				position:absolute;
				top:10px; left:10px;
				color: rgba(255,255,255,1);
				mix-blend-mode:overlay;
				font-size:16px;
				font-family:monospace;
				z-index:10;
				padding:5px 10px 5px 10px;
			}
			${componentNameDash}:hover .${componentNameDash}__copy {
				display: block;
			}
		`;
	}

	/**
	 * Default props
	 * @definition 		SWebcomponent.defaultProps
	 */
	static get defaultProps() {
		return {
			/**
			 * Specify the language used inside the demo
			 * @prop
			 * @type 		{String}
			 */
			language : 'htmlmixed',

			/**
			 * Specify the id of the part
			 * @prop
			 * @type 		{String}
			 */
			id : null,

			/**
			 * Set the indent unit to use
			 * @prop
			 * @type 		{Intetger}
			 */
			indentUnit : 4,

			/**
			 * Set the tab size
			 * @prop
			 * @type 		{Integer}
			 */
			tabSize : 4,

			/**
			 * Set if need to indent with tabs or not
			 * @prop
			 * @type 		{Boolean}
			 */
			indentWithTabs : true,

			/**
			 * Specify if need to wrap long lines or not
			 * @prop
			 * @type 		{Boolean}
			 */
			lineWrapping : true
		};
	}

	/**
	 * Required props
	 * @definition 		SWebcomponent.requiredProps
	 */
	static get requiredProps() {
		return ['id'];
	}

	/**
	 * Component will mount
	 * @definition 		SWebcomponent.componentWillMount
	 */
	componentWillMount() {
		super.componentWillMount();
		this._updateTimeout = null;
	}

	/**
	 * Component mount
	 */
	componentMount() {
		super.componentMount();

		// get the content
		const content = this.innerHTML;

		// inject the html needed
		this.innerHTML = `
			<span class="${this._componentNameDash}__id"></span>
			<button class="${this._componentNameDash}__copy">Copy to clipboard</button>
		`;

		this._idElm = this.querySelector(`.${this._componentNameDash}__id`);
		this._copyElm = this.querySelector(`.${this._componentNameDash}__copy`);

		this._idElm.innerHTML = this.props.id;

		// init clipboard
		this._initClipboard();

		// init codemirror
		this._codemirror = new Codemirror(this, {
			value : content.trim(),
			mode : this.props.language,
			lineNumbers : true,
			lineWrapping : true,
			theme : 'material',
			tabSize : 4,
			indentUnit: 4,
			indentWithTabs : true,
			viewportMargin : Infinity
		});

		// get some codemirror elements
		this._codemirrorSizerElm = this.querySelector('.CodeMirror-sizer');
		this._codemirrorElm = this.querySelector('.CodeMirror');

		// auto format
		this._autoFormatCode();

		// listen editor change
		this._codemirror.on('change', (cm, change) => {
			clearTimeout(this._updateTimeout);
			this._updateTimeout = setTimeout(this._updatePreview.bind(this), 300);
		});
		this._updatePreview();

		// listen for window resize
		window.addEventListener('resize', __throttle(this._onWindowResize.bind(this), 200));
	}

	/**
	 * Init clipboard
	 */
	_initClipboard() {
		this._clipboard = new Clipboard(this._copyElm, {
			text : (trigger) => {
				this._copyElm.innerHTML = 'Copied!';
				setTimeout(() => {
					this._copyElm.innerHTML = 'Copy to clipboard';
				}, 1000);
				return this._codemirror.getValue();
			}
		});
	}

	/**
	 * On window resize
	 */
	_onWindowResize() {
		// update code and preview size
		this._updateCodeHeight();
	}

	/**
	 * Auto format code
	 */
	_autoFormatCode() {
		var totalLines = this._codemirror.lineCount();
		this._codemirror.autoFormatRange({line:0, ch:0}, {line:totalLines});
	}

	/**
	 * Updating the preview
	 */
	_updatePreview() {
		let code = this._codemirror.getValue();
		// switch on language to provide the correct code
		switch(this.props.language) {
			case 'css':
				code = `<style>${code}</style>`;
			break;
			case 'js':
			case 'javascript':
				code = `<script>${code}</script>`;
			break;
		}
		this.dispatchComponentEvent('update', code);
		// update code height
		this._updateCodeHeight();
	}

	/**
	 * Update code height
	 */
	_updateCodeHeight() {
			// this._codemirrorElm.style.height = this._codemirrorSizerElm.scrollHeight + 'px';
	}
}

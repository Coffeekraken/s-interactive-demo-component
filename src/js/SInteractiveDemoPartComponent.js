import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import __throttle from 'coffeekraken-sugar/js/utils/functions/throttle'
import Codemirror from 'codemirror'
import Clipboard from 'clipboard';
require('codemirror/mode/htmlmixed/htmlmixed');
require('./codemirror/autoFormatRange');

export default class SInteractiveDemoPartComponent extends SWebComponent {

	/**
	 * Default props
	 * @definition 		SWebcomponent.defaultProps
	 */
	static get defaultProps() {
		return {
			/**
			 * Specify the mode used inside the demo
			 * @prop
			 * @type 		{String}
			 */
			mode : 'htmlmixed',

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
			 * Set the theme to use
			 * @prop
			 * @type 		{String}
			 */
			theme : 'default',

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
			lineWrapping : true,

			/**
			 * Display or not the line numbers
			 * @prop
			 * @type 		{Boolean}
			 */
			lineNumbers : true,

			/**
			 * When an update has been made
			 * @prop
			 * @type 	 	{Function}
			 */
			onUpdate : null
		};
	}

	/**
	 * Base css
	 * @definition 		SWebComponent.css
	 */
	static css(componentName, componentNameDash) {
		return `
			${componentNameDash} {
				position:relative;
			}
			.CodeMirror{font-family:monospace;height:300px;color:#000}.CodeMirror-lines{padding:4px 0}.CodeMirror pre{padding:0 4px}.CodeMirror-gutter-filler,.CodeMirror-scrollbar-filler{background-color:#fff}.CodeMirror-gutters{border-right:1px solid #ddd;background-color:#f7f7f7;white-space:nowrap}.CodeMirror-linenumber{padding:0 3px 0 5px;min-width:20px;text-align:right;color:#999;white-space:nowrap}.CodeMirror-guttermarker{color:#000}.CodeMirror-guttermarker-subtle{color:#999}.CodeMirror-cursor{border-left:1px solid #000;border-right:none;width:0}.CodeMirror div.CodeMirror-secondarycursor{border-left:1px solid silver}.cm-fat-cursor .CodeMirror-cursor{width:auto;border:0!important;background:#7e7}.cm-fat-cursor div.CodeMirror-cursors{z-index:1}.cm-animate-fat-cursor{width:auto;border:0;-webkit-animation:blink 1.06s steps(1) infinite;-moz-animation:blink 1.06s steps(1) infinite;animation:blink 1.06s steps(1) infinite;background-color:#7e7}@-moz-keyframes blink{50%{background-color:transparent}}@-webkit-keyframes blink{50%{background-color:transparent}}@keyframes blink{50%{background-color:transparent}}.cm-tab{display:inline-block;text-decoration:inherit}.CodeMirror-rulers{position:absolute;left:0;right:0;top:-50px;bottom:-20px;overflow:hidden}.CodeMirror-ruler{border-left:1px solid #ccc;top:0;bottom:0;position:absolute}.cm-s-default .cm-header{color:#00f}.cm-s-default .cm-quote{color:#090}.cm-negative{color:#d44}.cm-positive{color:#292}.cm-header,.cm-strong{font-weight:700}.cm-em{font-style:italic}.cm-link{text-decoration:underline}.cm-strikethrough{text-decoration:line-through}.cm-s-default .cm-keyword{color:#708}.cm-s-default .cm-atom{color:#219}.cm-s-default .cm-number{color:#164}.cm-s-default .cm-def{color:#00f}.cm-s-default .cm-variable-2{color:#05a}.cm-s-default .cm-variable-3{color:#085}.cm-s-default .cm-comment{color:#a50}.cm-s-default .cm-string{color:#a11}.cm-s-default .cm-string-2{color:#f50}.cm-s-default .cm-meta,.cm-s-default .cm-qualifier{color:#555}.cm-s-default .cm-builtin{color:#30a}.cm-s-default .cm-bracket{color:#997}.cm-s-default .cm-tag{color:#170}.cm-s-default .cm-attribute{color:#00c}.cm-s-default .cm-hr{color:#999}.cm-s-default .cm-link{color:#00c}.cm-invalidchar,.cm-s-default .cm-error{color:red}.CodeMirror-composing{border-bottom:2px solid}div.CodeMirror span.CodeMirror-matchingbracket{color:#0f0}div.CodeMirror span.CodeMirror-nonmatchingbracket{color:#f22}.CodeMirror-matchingtag{background:rgba(255,150,0,.3)}.CodeMirror-activeline-background{background:#e8f2ff}.CodeMirror{position:relative;overflow:hidden;background:#fff}.CodeMirror-scroll{overflow:scroll!important;margin-bottom:-30px;margin-right:-30px;padding-bottom:30px;height:100%;outline:0;position:relative}.CodeMirror-sizer{position:relative;border-right:30px solid transparent}.CodeMirror-gutter-filler,.CodeMirror-hscrollbar,.CodeMirror-scrollbar-filler,.CodeMirror-vscrollbar{position:absolute;z-index:6;display:none}.CodeMirror-vscrollbar{right:0;top:0;overflow-x:hidden;overflow-y:scroll}.CodeMirror-hscrollbar{bottom:0;left:0;overflow-y:hidden;overflow-x:scroll}.CodeMirror-scrollbar-filler{right:0;bottom:0}.CodeMirror-gutter-filler{left:0;bottom:0}.CodeMirror-gutters{position:absolute;left:0;top:0;min-height:100%;z-index:3}.CodeMirror-gutter{white-space:normal;height:100%;display:inline-block;vertical-align:top;margin-bottom:-30px}.CodeMirror-gutter-wrapper{position:absolute;z-index:4;background:0 0!important;border:none!important;-webkit-user-select:none;-moz-user-select:none;user-select:none}.CodeMirror-gutter-background{position:absolute;top:0;bottom:0;z-index:4}.CodeMirror-gutter-elt{position:absolute;cursor:default;z-index:4}.CodeMirror-lines{cursor:text;min-height:1px}.CodeMirror pre{-moz-border-radius:0;-webkit-border-radius:0;border-radius:0;border-width:0;background:0 0;font-family:inherit;font-size:inherit;margin:0;white-space:pre;word-wrap:normal;line-height:inherit;color:inherit;z-index:2;position:relative;overflow:visible;-webkit-tap-highlight-color:transparent;-webkit-font-variant-ligatures:none;font-variant-ligatures:none}.CodeMirror-wrap pre{word-wrap:break-word;white-space:pre-wrap;word-break:normal}.CodeMirror-linebackground{position:absolute;left:0;right:0;top:0;bottom:0;z-index:0}.CodeMirror-linewidget{position:relative;z-index:2;overflow:auto}.CodeMirror-code{outline:0}.CodeMirror-gutter,.CodeMirror-gutters,.CodeMirror-linenumber,.CodeMirror-scroll,.CodeMirror-sizer{-moz-box-sizing:content-box;box-sizing:content-box}.CodeMirror-measure{position:absolute;width:100%;height:0;overflow:hidden;visibility:hidden}.CodeMirror-cursor{position:absolute;pointer-events:none}.CodeMirror-measure pre{position:static}div.CodeMirror-cursors{visibility:hidden;position:relative;z-index:3}.CodeMirror-focused div.CodeMirror-cursors,div.CodeMirror-dragcursors{visibility:visible}.CodeMirror-selected{background:#d9d9d9}.CodeMirror-focused .CodeMirror-selected,.CodeMirror-line::selection,.CodeMirror-line>span::selection,.CodeMirror-line>span>span::selection{background:#d7d4f0}.CodeMirror-crosshair{cursor:crosshair}.CodeMirror-line::-moz-selection,.CodeMirror-line>span::-moz-selection,.CodeMirror-line>span>span::-moz-selection{background:#d7d4f0}.cm-searching{background:#ffa;background:rgba(255,255,0,.4)}.cm-force-border{padding-right:.1px}@media print{.CodeMirror div.CodeMirror-cursors{visibility:hidden}}.cm-tab-wrap-hack:after{content:''}span.CodeMirror-selectedtext{background:0 0}
			${componentNameDash} .CodeMirror{
				height:100%;
			}
			${componentNameDash}:after {
				border-top:1px solid rgba(255,255,255,.5);
			}
			${componentNameDash} + ${componentNameDash}:after {
				display: block;
				content:'';
				position:absolute;
				top:0; left:0;
				width:100%; height:100%;
				border-left:1px solid rgba(255,255,255,.5);
				z-index:10;
				mix-blend-mode:overlay;
				pointer-events:none;
			}
			${componentNameDash} .CodeMirror-lines {
				padding: 40px 10px 10px 0;
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
				box-sizing:border-box;
				position:absolute;
				top:0; left:0;
				width:100%;
				z-index:10;
				display:block;
				font-size:16px;
				font-family:monospace;
				padding:10px 20px 10px 20px;
			}
			.${componentNameDash}__id.cm-s-default {
				background-color: #f7f7f7;
				border-bottom: 1px solid #ddd;
			}
			${componentNameDash}:hover .${componentNameDash}__copy {
				display: block;
			}
		`;
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
			<span class="${this._componentNameDash}__id cm-s-${this.props.theme}"></span>
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
			viewportMargin : Infinity,
			...this.props
		});

		// get some codemirror elements
		this._codemirrorSizerElm = this.querySelector('.CodeMirror-sizer');
		this._codemirrorElm = this.querySelector('.CodeMirror');

		// auto format
		this._autoFormatCode();

		// listen editor change
		this._codemirror.on('change', (cm, change) => {
			clearTimeout(this._updateTimeout);
			this._updateTimeout = setTimeout(this._notifyUpdate.bind(this), 300);
		});
		this._notifyUpdate();
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
	 * Auto format code
	 */
	_autoFormatCode() {
		var totalLines = this._codemirror.lineCount();
		this._codemirror.autoFormatRange({line:0, ch:0}, {line:totalLines});
	}

	/**
	 * Notify that an update has been made in the editor
	 */
	_notifyUpdate() {
		let code = this._codemirror.getValue();
		// switch on mode to provide the correct code
		switch(this.props.mode) {
			case 'css':
				code = `<style>${code}</style>`;
			break;
			case 'js':
			case 'javascript':
				code = `<script>${code}</script>`;
			break;
		}
		// dispatch an event
		this.dispatchComponentEvent('update', code);
		// on update callback
		this.props.onUpdate && this.props.onUpdate(code);
	}
}

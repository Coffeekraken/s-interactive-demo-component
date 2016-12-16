Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _SWebComponent2 = require('coffeekraken-sugar/js/core/SWebComponent');

var _SWebComponent3 = _interopRequireDefault(_SWebComponent2);

var _throttle = require('coffeekraken-sugar/js/utils/functions/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('codemirror/mode/htmlmixed/htmlmixed');
require('./codemirror/autoFormatRange');

var SInteractiveDemoPartComponent = function (_SWebComponent) {
	_inherits(SInteractiveDemoPartComponent, _SWebComponent);

	function SInteractiveDemoPartComponent() {
		_classCallCheck(this, SInteractiveDemoPartComponent);

		return _possibleConstructorReturn(this, (SInteractiveDemoPartComponent.__proto__ || Object.getPrototypeOf(SInteractiveDemoPartComponent)).apply(this, arguments));
	}

	_createClass(SInteractiveDemoPartComponent, [{
		key: 'componentWillMount',


		/**
   * Component will mount
   * @definition 		SWebcomponent.componentWillMount
   */
		value: function componentWillMount() {
			_get(SInteractiveDemoPartComponent.prototype.__proto__ || Object.getPrototypeOf(SInteractiveDemoPartComponent.prototype), 'componentWillMount', this).call(this);
			this._updateTimeout = null;
		}

		/**
   * Component mount
   */

	}, {
		key: 'componentMount',
		value: function componentMount() {
			var _this2 = this;

			_get(SInteractiveDemoPartComponent.prototype.__proto__ || Object.getPrototypeOf(SInteractiveDemoPartComponent.prototype), 'componentMount', this).call(this);

			// get the content
			var content = this.innerHTML;

			// inject the html needed
			this.innerHTML = '\n\t\t\t<span class="' + this._componentNameDash + '__id cm-s-' + this.props.theme + '"></span>\n\t\t\t<button class="' + this._componentNameDash + '__copy">Copy to clipboard</button>\n\t\t';

			this._idElm = this.querySelector('.' + this._componentNameDash + '__id');
			this._copyElm = this.querySelector('.' + this._componentNameDash + '__copy');

			this._idElm.innerHTML = this.props.id;

			// init clipboard
			this._initClipboard();

			// init codemirror
			this._codemirror = new _codemirror2.default(this, _extends({
				value: content.trim(),
				viewportMargin: Infinity
			}, this.props));

			// get some codemirror elements
			this._codemirrorSizerElm = this.querySelector('.CodeMirror-sizer');
			this._codemirrorElm = this.querySelector('.CodeMirror');

			// auto format
			this._autoFormatCode();

			// listen editor change
			this._codemirror.on('change', function (cm, change) {
				clearTimeout(_this2._updateTimeout);
				_this2._updateTimeout = setTimeout(_this2._notifyUpdate.bind(_this2), 300);
			});
			this._notifyUpdate();
		}

		/**
   * Init clipboard
   */

	}, {
		key: '_initClipboard',
		value: function _initClipboard() {
			var _this3 = this;

			this._clipboard = new _clipboard2.default(this._copyElm, {
				text: function text(trigger) {
					_this3._copyElm.innerHTML = 'Copied!';
					setTimeout(function () {
						_this3._copyElm.innerHTML = 'Copy to clipboard';
					}, 1000);
					return _this3._codemirror.getValue();
				}
			});
		}

		/**
   * Auto format code
   */

	}, {
		key: '_autoFormatCode',
		value: function _autoFormatCode() {
			var totalLines = this._codemirror.lineCount();
			this._codemirror.autoFormatRange({ line: 0, ch: 0 }, { line: totalLines });
		}

		/**
   * Notify that an update has been made in the editor
   */

	}, {
		key: '_notifyUpdate',
		value: function _notifyUpdate() {
			var code = this._codemirror.getValue();
			// switch on mode to provide the correct code
			switch (this.props.mode) {
				case 'css':
					code = '<style>' + code + '</style>';
					break;
				case 'js':
				case 'javascript':
					code = '<script>' + code + '</script>';
					break;
			}
			// dispatch an event
			this.dispatchComponentEvent('update', code);
			// on update callback
			this.props.onUpdate && this.props.onUpdate(code);
		}
	}], [{
		key: 'css',


		/**
   * Base css
   * @definition 		SWebComponent.css
   */
		value: function css(componentName, componentNameDash) {
			return '\n\t\t\t' + componentNameDash + ' {\n\t\t\t\tposition:relative;\n\t\t\t}\n\t\t\t.CodeMirror{font-family:monospace;height:300px;color:#000}.CodeMirror-lines{padding:4px 0}.CodeMirror pre{padding:0 4px}.CodeMirror-gutter-filler,.CodeMirror-scrollbar-filler{background-color:#fff}.CodeMirror-gutters{border-right:1px solid #ddd;background-color:#f7f7f7;white-space:nowrap}.CodeMirror-linenumber{padding:0 3px 0 5px;min-width:20px;text-align:right;color:#999;white-space:nowrap}.CodeMirror-guttermarker{color:#000}.CodeMirror-guttermarker-subtle{color:#999}.CodeMirror-cursor{border-left:1px solid #000;border-right:none;width:0}.CodeMirror div.CodeMirror-secondarycursor{border-left:1px solid silver}.cm-fat-cursor .CodeMirror-cursor{width:auto;border:0!important;background:#7e7}.cm-fat-cursor div.CodeMirror-cursors{z-index:1}.cm-animate-fat-cursor{width:auto;border:0;-webkit-animation:blink 1.06s steps(1) infinite;-moz-animation:blink 1.06s steps(1) infinite;animation:blink 1.06s steps(1) infinite;background-color:#7e7}@-moz-keyframes blink{50%{background-color:transparent}}@-webkit-keyframes blink{50%{background-color:transparent}}@keyframes blink{50%{background-color:transparent}}.cm-tab{display:inline-block;text-decoration:inherit}.CodeMirror-rulers{position:absolute;left:0;right:0;top:-50px;bottom:-20px;overflow:hidden}.CodeMirror-ruler{border-left:1px solid #ccc;top:0;bottom:0;position:absolute}.cm-s-default .cm-header{color:#00f}.cm-s-default .cm-quote{color:#090}.cm-negative{color:#d44}.cm-positive{color:#292}.cm-header,.cm-strong{font-weight:700}.cm-em{font-style:italic}.cm-link{text-decoration:underline}.cm-strikethrough{text-decoration:line-through}.cm-s-default .cm-keyword{color:#708}.cm-s-default .cm-atom{color:#219}.cm-s-default .cm-number{color:#164}.cm-s-default .cm-def{color:#00f}.cm-s-default .cm-variable-2{color:#05a}.cm-s-default .cm-variable-3{color:#085}.cm-s-default .cm-comment{color:#a50}.cm-s-default .cm-string{color:#a11}.cm-s-default .cm-string-2{color:#f50}.cm-s-default .cm-meta,.cm-s-default .cm-qualifier{color:#555}.cm-s-default .cm-builtin{color:#30a}.cm-s-default .cm-bracket{color:#997}.cm-s-default .cm-tag{color:#170}.cm-s-default .cm-attribute{color:#00c}.cm-s-default .cm-hr{color:#999}.cm-s-default .cm-link{color:#00c}.cm-invalidchar,.cm-s-default .cm-error{color:red}.CodeMirror-composing{border-bottom:2px solid}div.CodeMirror span.CodeMirror-matchingbracket{color:#0f0}div.CodeMirror span.CodeMirror-nonmatchingbracket{color:#f22}.CodeMirror-matchingtag{background:rgba(255,150,0,.3)}.CodeMirror-activeline-background{background:#e8f2ff}.CodeMirror{position:relative;overflow:hidden;background:#fff}.CodeMirror-scroll{overflow:scroll!important;margin-bottom:-30px;margin-right:-30px;padding-bottom:30px;height:100%;outline:0;position:relative}.CodeMirror-sizer{position:relative;border-right:30px solid transparent}.CodeMirror-gutter-filler,.CodeMirror-hscrollbar,.CodeMirror-scrollbar-filler,.CodeMirror-vscrollbar{position:absolute;z-index:6;display:none}.CodeMirror-vscrollbar{right:0;top:0;overflow-x:hidden;overflow-y:scroll}.CodeMirror-hscrollbar{bottom:0;left:0;overflow-y:hidden;overflow-x:scroll}.CodeMirror-scrollbar-filler{right:0;bottom:0}.CodeMirror-gutter-filler{left:0;bottom:0}.CodeMirror-gutters{position:absolute;left:0;top:0;min-height:100%;z-index:3}.CodeMirror-gutter{white-space:normal;height:100%;display:inline-block;vertical-align:top;margin-bottom:-30px}.CodeMirror-gutter-wrapper{position:absolute;z-index:4;background:0 0!important;border:none!important;-webkit-user-select:none;-moz-user-select:none;user-select:none}.CodeMirror-gutter-background{position:absolute;top:0;bottom:0;z-index:4}.CodeMirror-gutter-elt{position:absolute;cursor:default;z-index:4}.CodeMirror-lines{cursor:text;min-height:1px}.CodeMirror pre{-moz-border-radius:0;-webkit-border-radius:0;border-radius:0;border-width:0;background:0 0;font-family:inherit;font-size:inherit;margin:0;white-space:pre;word-wrap:normal;line-height:inherit;color:inherit;z-index:2;position:relative;overflow:visible;-webkit-tap-highlight-color:transparent;-webkit-font-variant-ligatures:none;font-variant-ligatures:none}.CodeMirror-wrap pre{word-wrap:break-word;white-space:pre-wrap;word-break:normal}.CodeMirror-linebackground{position:absolute;left:0;right:0;top:0;bottom:0;z-index:0}.CodeMirror-linewidget{position:relative;z-index:2;overflow:auto}.CodeMirror-code{outline:0}.CodeMirror-gutter,.CodeMirror-gutters,.CodeMirror-linenumber,.CodeMirror-scroll,.CodeMirror-sizer{-moz-box-sizing:content-box;box-sizing:content-box}.CodeMirror-measure{position:absolute;width:100%;height:0;overflow:hidden;visibility:hidden}.CodeMirror-cursor{position:absolute;pointer-events:none}.CodeMirror-measure pre{position:static}div.CodeMirror-cursors{visibility:hidden;position:relative;z-index:3}.CodeMirror-focused div.CodeMirror-cursors,div.CodeMirror-dragcursors{visibility:visible}.CodeMirror-selected{background:#d9d9d9}.CodeMirror-focused .CodeMirror-selected,.CodeMirror-line::selection,.CodeMirror-line>span::selection,.CodeMirror-line>span>span::selection{background:#d7d4f0}.CodeMirror-crosshair{cursor:crosshair}.CodeMirror-line::-moz-selection,.CodeMirror-line>span::-moz-selection,.CodeMirror-line>span>span::-moz-selection{background:#d7d4f0}.cm-searching{background:#ffa;background:rgba(255,255,0,.4)}.cm-force-border{padding-right:.1px}@media print{.CodeMirror div.CodeMirror-cursors{visibility:hidden}}.cm-tab-wrap-hack:after{content:\'\'}span.CodeMirror-selectedtext{background:0 0}\n\t\t\t' + componentNameDash + ' .CodeMirror{\n\t\t\t\theight:100%;\n\t\t\t}\n\t\t\t' + componentNameDash + ':after {\n\t\t\t\tborder-top:1px solid rgba(255,255,255,.5);\n\t\t\t}\n\t\t\t' + componentNameDash + ' + ' + componentNameDash + ':after {\n\t\t\t\tdisplay: block;\n\t\t\t\tcontent:\'\';\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:0; left:0;\n\t\t\t\twidth:100%; height:100%;\n\t\t\t\tborder-left:1px solid rgba(255,255,255,.5);\n\t\t\t\tz-index:10;\n\t\t\t\tmix-blend-mode:overlay;\n\t\t\t\tpointer-events:none;\n\t\t\t}\n\t\t\t' + componentNameDash + ' .CodeMirror-lines {\n\t\t\t\tpadding: 40px 10px 10px 0;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__copy {\n\t\t\t\tbackground-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'#37A0CE\' d=\'M15.143 13.244l.837-2.244 2.698 5.641-5.678 2.502.805-2.23s-8.055-3.538-7.708-10.913c2.715 5.938 9.046 7.244 9.046 7.244zm8.857-7.244v18h-18v-6h-6v-18h18v6h6zm-2 2h-12.112c-.562-.578-1.08-1.243-1.521-2h7.633v-4h-14v14h4v-3.124c.6.961 1.287 1.823 2 2.576v6.548h14v-14z\'/></svg>");\n\t\t\t\tbackground-color:transparent;\n\t\t\t\tbackground-repeat:no-repeat;\n\t\t\t\tbackground-size:12px;\n\t\t\t\tbackground-position:0 50%;\n\t\t\t\tpadding:5px 10px 5px 20px;\n\t\t\t\tcolor: #37A0CE;\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:10px; right:10px;\n\t\t\t\tz-index:90;\n\t\t\t\tborder:none;\n\t\t\t\tdisplay:none;\n\t\t\t\tcursor:pointer;\n\t\t\t\tfont-size:12px;\n\t\t\t\tfont-family:monospace;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__id {\n\t\t\t\tbox-sizing:border-box;\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:0; left:0;\n\t\t\t\twidth:100%;\n\t\t\t\tz-index:10;\n\t\t\t\tdisplay:block;\n\t\t\t\tfont-size:16px;\n\t\t\t\tfont-family:monospace;\n\t\t\t\tpadding:10px 20px 10px 20px;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__id.cm-s-default {\n\t\t\t\tbackground-color: #f7f7f7;\n\t\t\t\tborder-bottom: 1px solid #ddd;\n\t\t\t}\n\t\t\t' + componentNameDash + ':hover .' + componentNameDash + '__copy {\n\t\t\t\tdisplay: block;\n\t\t\t}\n\t\t';
		}

		/**
   * Required props
   * @definition 		SWebcomponent.requiredProps
   */

	}, {
		key: 'defaultProps',


		/**
   * Default props
   * @definition 		SWebcomponent.defaultProps
   */
		get: function get() {
			return {
				/**
     * Specify the mode used inside the demo
     * @prop
     * @type 		{String}
     */
				mode: 'htmlmixed',

				/**
     * Specify the id of the part
     * @prop
     * @type 		{String}
     */
				id: null,

				/**
     * Set the indent unit to use
     * @prop
     * @type 		{Intetger}
     */
				indentUnit: 4,

				/**
     * Set the theme to use
     * @prop
     * @type 		{String}
     */
				theme: 'default',

				/**
     * Set the tab size
     * @prop
     * @type 		{Integer}
     */
				tabSize: 4,

				/**
     * Set if need to indent with tabs or not
     * @prop
     * @type 		{Boolean}
     */
				indentWithTabs: true,

				/**
     * Specify if need to wrap long lines or not
     * @prop
     * @type 		{Boolean}
     */
				lineWrapping: true,

				/**
     * Display or not the line numbers
     * @prop
     * @type 		{Boolean}
     */
				lineNumbers: true,

				/**
     * When an update has been made
     * @prop
     * @type 	 	{Function}
     */
				onUpdate: null
			};
		}
	}, {
		key: 'requiredProps',
		get: function get() {
			return ['id'];
		}
	}]);

	return SInteractiveDemoPartComponent;
}(_SWebComponent3.default);

exports.default = SInteractiveDemoPartComponent;
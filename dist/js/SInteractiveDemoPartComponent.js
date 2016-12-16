Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _SWebComponent2 = require('coffeekraken-sugar/js/core/SWebComponent');

var _SWebComponent3 = _interopRequireDefault(_SWebComponent2);

var _throttle = require('coffeekraken-sugar/js/utils/functions/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _dispatchEvent = require('coffeekraken-sugar/js/dom/dispatchEvent');

var _dispatchEvent2 = _interopRequireDefault(_dispatchEvent);

var _codemirror = require('codemirror');

var _codemirror2 = _interopRequireDefault(_codemirror);

var _codemirror3 = require('raw-loader!codemirror/lib/codemirror.css');

var _codemirror4 = _interopRequireDefault(_codemirror3);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _SAjax = require('coffeekraken-sugar/js/classes/SAjax');

var _SAjax2 = _interopRequireDefault(_SAjax);

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
			this.innerHTML = '\n\t\t\t<span class="' + this._componentNameDash + '__id"></span>\n\t\t\t<button class="' + this._componentNameDash + '__copy">Copy to clipboard</button>\n\t\t';

			this._idElm = this.querySelector('.' + this._componentNameDash + '__id');
			this._copyElm = this.querySelector('.' + this._componentNameDash + '__copy');

			this._idElm.innerHTML = this.props.id;

			// init clipboard
			this._initClipboard();

			// init codemirror
			this._codemirror = new _codemirror2.default(this, {
				value: content.trim(),
				mode: this.props.language,
				lineNumbers: true,
				lineWrapping: true,
				theme: 'material',
				tabSize: 4,
				indentUnit: 4,
				indentWithTabs: true,
				viewportMargin: Infinity
			});

			// get some codemirror elements
			this._codemirrorSizerElm = this.querySelector('.CodeMirror-sizer');
			this._codemirrorElm = this.querySelector('.CodeMirror');

			// auto format
			this._autoFormatCode();

			// listen editor change
			this._codemirror.on('change', function (cm, change) {
				clearTimeout(_this2._updateTimeout);
				_this2._updateTimeout = setTimeout(_this2._updatePreview.bind(_this2), 300);
			});
			this._updatePreview();

			// listen for window resize
			window.addEventListener('resize', (0, _throttle2.default)(this._onWindowResize.bind(this), 200));
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
   * On window resize
   */

	}, {
		key: '_onWindowResize',
		value: function _onWindowResize() {
			// update code and preview size
			this._updateCodeHeight();
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
   * Updating the preview
   */

	}, {
		key: '_updatePreview',
		value: function _updatePreview() {
			var code = this._codemirror.getValue();
			// switch on language to provide the correct code
			switch (this.props.language) {
				case 'css':
					code = '<style>' + code + '</style>';
					break;
				case 'js':
				case 'javascript':
					code = '<script>' + code + '</script>';
					break;
			}
			this.dispatchComponentEvent('update', code);
			// update code height
			this._updateCodeHeight();
		}

		/**
   * Update code height
   */

	}, {
		key: '_updateCodeHeight',
		value: function _updateCodeHeight() {
			// this._codemirrorElm.style.height = this._codemirrorSizerElm.scrollHeight + 'px';
		}
	}], [{
		key: 'css',


		/**
   * Base css
   * @definition 		SWebComponent.css
   */
		value: function css(componentName, componentNameDash) {
			return '\n\t\t\t' + componentNameDash + ' {\n\t\t\t\tposition:relative;\n\t\t\t}\n\t\t\t' + componentNameDash + ':after {\n\t\t\t\tdisplay: block;\n\t\t\t\tcontent:\'\';\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:0; left:0;\n\t\t\t\twidth:100%; height:100%;\n\t\t\t\tborder-left:1px solid rgba(255,255,255,.5);\n\t\t\t\tz-index:10;\n\t\t\t\tmix-blend-mode:overlay;\n\t\t\t\tpointer-events:none;\n\t\t\t}' + componentNameDash + ':first-child:after {\n\t\t\t\tborder-left:none;\n\t\t\t}\n\t\t\t' + _codemirror4.default + '\n\t\t\t' + componentNameDash + ' .CodeMirror{height:100%}\n\t\t\t' + componentNameDash + ' .CodeMirror-lines {\n\t\t\t\tpadding : 50px 20px 20px 10px;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__copy {\n\t\t\t\tbackground-image:url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'#37A0CE\' d=\'M15.143 13.244l.837-2.244 2.698 5.641-5.678 2.502.805-2.23s-8.055-3.538-7.708-10.913c2.715 5.938 9.046 7.244 9.046 7.244zm8.857-7.244v18h-18v-6h-6v-18h18v6h6zm-2 2h-12.112c-.562-.578-1.08-1.243-1.521-2h7.633v-4h-14v14h4v-3.124c.6.961 1.287 1.823 2 2.576v6.548h14v-14z\'/></svg>");\n\t\t\t\tbackground-color:transparent;\n\t\t\t\tbackground-repeat:no-repeat;\n\t\t\t\tbackground-size:12px;\n\t\t\t\tbackground-position:0 50%;\n\t\t\t\tpadding:5px 10px 5px 20px;\n\t\t\t\tcolor: #37A0CE;\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:10px; right:10px;\n\t\t\t\tz-index:90;\n\t\t\t\tborder:none;\n\t\t\t\tdisplay:none;\n\t\t\t\tcursor:pointer;\n\t\t\t\tfont-size:12px;\n\t\t\t\tfont-family:monospace;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__id {\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:10px; left:10px;\n\t\t\t\tcolor: rgba(255,255,255,1);\n\t\t\t\tmix-blend-mode:overlay;\n\t\t\t\tfont-size:16px;\n\t\t\t\tfont-family:monospace;\n\t\t\t\tz-index:10;\n\t\t\t\tpadding:5px 10px 5px 10px;\n\t\t\t}\n\t\t\t' + componentNameDash + ':hover .' + componentNameDash + '__copy {\n\t\t\t\tdisplay: block;\n\t\t\t}\n\t\t';
		}

		/**
   * Default props
   * @definition 		SWebcomponent.defaultProps
   */

	}, {
		key: 'defaultProps',
		get: function get() {
			return {
				/**
     * Specify the language used inside the demo
     * @prop
     * @type 		{String}
     */
				language: 'htmlmixed',

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
				lineWrapping: true
			};
		}

		/**
   * Required props
   * @definition 		SWebcomponent.requiredProps
   */

	}, {
		key: 'requiredProps',
		get: function get() {
			return ['id'];
		}
	}]);

	return SInteractiveDemoPartComponent;
}(_SWebComponent3.default);

exports.default = SInteractiveDemoPartComponent;
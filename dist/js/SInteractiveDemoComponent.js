Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _SWebComponent2 = require('coffeekraken-sugar/js/core/SWebComponent');

var _SWebComponent3 = _interopRequireDefault(_SWebComponent2);

var _throttle = require('coffeekraken-sugar/js/utils/functions/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _prependChild = require('coffeekraken-sugar/js/dom/prependChild');

var _prependChild2 = _interopRequireDefault(_prependChild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SInteractiveDemoComponent = function (_SWebComponent) {
	_inherits(SInteractiveDemoComponent, _SWebComponent);

	function SInteractiveDemoComponent() {
		_classCallCheck(this, SInteractiveDemoComponent);

		return _possibleConstructorReturn(this, (SInteractiveDemoComponent.__proto__ || Object.getPrototypeOf(SInteractiveDemoComponent)).apply(this, arguments));
	}

	_createClass(SInteractiveDemoComponent, [{
		key: 'componentWillMount',


		/**
   * Component will mount
   * @definition 		SWebcomponent.componentWillMount
   */
		value: function componentWillMount() {
			_get(SInteractiveDemoComponent.prototype.__proto__ || Object.getPrototypeOf(SInteractiveDemoComponent.prototype), 'componentWillMount', this).call(this);
			this._updateTimeout = null;
		}

		/**
   * Component mount
   */

	}, {
		key: 'componentMount',
		value: function componentMount() {
			var _this2 = this;

			_get(SInteractiveDemoComponent.prototype.__proto__ || Object.getPrototypeOf(SInteractiveDemoComponent.prototype), 'componentMount', this).call(this);

			// get the content
			var content = this.innerHTML;

			// find some some parts
			var parts = [].filter.call(this.children, function (child) {
				return child.id && child.nodeName !== 'IFRAME';
			});

			// inject the html needed
			this._iframeElm = document.createElement('iframe');
			this._iframeElm.width = '100%';
			this._iframeElm.setAttribute('frameborder', 'no');
			(0, _prependChild2.default)(this._iframeElm, this);
			this._iframeDocument = this._iframeElm.contentDocument || this._iframeElm.contentWindow.document;

			// wrapper
			this._wrapperElm = this._iframeDocument.createElement('div');
			this._wrapperElm.setAttribute('id', 'wrapper');

			// firefox bugfix
			this._iframeDocument.open();
			this._iframeDocument.close();

			this._iframeBody = this._iframeDocument.body;

			// create the preview div
			[].forEach.call(parts, function (part) {
				var partElm = _this2._iframeDocument.createElement('div');
				partElm.id = part.id;
				_this2._wrapperElm.appendChild(partElm);
			});

			// append wrapper
			this._iframeBody.appendChild(this._wrapperElm);

			// inject resources
			this._injectResourcesInsidePreview();

			this._iframeDocument.addEventListener('componentDidMount', this._onComponentDidMountInsideIframe.bind(this));

			// listen for window resize
			window.addEventListener('resize', (0, _throttle2.default)(this._onWindowResize.bind(this), 200));

			// listen for update from parts
			this.addEventListener('update', function (e) {
				_this2._iframeBody.querySelector('#' + e.target.id).innerHTML = e.detail;
				_this2._updatePreviewHeight();
			});
		}

		/**
   * On component did mount inside iframe
   */

	}, {
		key: '_onComponentDidMountInsideIframe',
		value: function _onComponentDidMountInsideIframe() {
			this._iframeDocument.removeEventListener('componentDidMount', this._onComponentDidMountInsideIframe);
			this._updatePreviewHeight();
		}

		/**
   * On window resize
   */

	}, {
		key: '_onWindowResize',
		value: function _onWindowResize() {
			// update code and preview size
			this._updatePreviewHeight();
		}

		/**
   * Inject scripts and styles inside preview
   */

	}, {
		key: '_injectResourcesInsidePreview',
		value: function _injectResourcesInsidePreview() {
			var _this3 = this;

			var stl = this._iframeDocument.createElement('style');
			stl.innerHTML = '\n\t\t\tbody {\n\t\t\t\tmargin:0;\n\t\t\t\tpadding:0;\n\t\t\t}\n\t\t\t#wrapper {\n\t\t\t\tpadding: 20px;\n\t\t\t}\n\t\t';
			this._iframeBody.appendChild(stl);

			if (this.props.scripts) {
				// make sure it's an array
				var scripts = [].concat(this.props.scripts);
				scripts.forEach(function (script) {
					var scriptTag = _this3._iframeDocument.createElement('script');
					scriptTag.src = script;
					_this3._iframeBody.appendChild(scriptTag);
				});
			}
			if (this.props.styles) {
				// make sure it's an array
				var styles = [].concat(this.props.styles);
				styles.forEach(function (style) {
					var styleTag = _this3._iframeDocument.createElement('link');
					styleTag.href = style;
					styleTag.rel = 'stylesheet';
					_this3._iframeBody.appendChild(styleTag);
				});
			}
		}

		/**
   * Update iframe height
   */

	}, {
		key: '_updatePreviewHeight',
		value: function _updatePreviewHeight() {
			var _this4 = this;

			setTimeout(function () {
				_this4._iframeElm.removeAttribute('height');
				_this4._iframeElm.height = _this4._wrapperElm.scrollHeight + 2 + 'px';
			}, 50);
		}
	}], [{
		key: 'css',


		/**
   * Base css
   * @definition 		SWebComponent.css
   */
		value: function css(componentName, componentNameDash) {
			return '\n\t\t\t' + componentNameDash + ' {\n\t\t\t\tdisplay: flex;\n\t\t\t\twidth:100%;\n\t\t\t\tflex-flow: row wrap;\n\t\t\t}\n\t\t\t' + componentNameDash + ' > *:not(iframe) {\n\t\t\t\tflex:1 0;\n\t\t\t}\n\t\t\t' + componentNameDash + ' > iframe {\n\t\t\t\tbox-sizing : border-box;\n\t\t\t\tflex:1 1 100%;\n\t\t\t}\n\t\t\t@media all and (max-width:600px) {\n\t\t\t\t' + componentNameDash + ' {\n\t\t\t\t\tflex-flow: column wrap;\n\t\t\t\t}\n\t\t\t}\n\t\t';
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
     * Script to load inside the demo
     * @prop
     * @type 		{String}
     */
				scripts: null,

				/**
     * Styles to load inside the demo
     * @prop
     * @type 		{String}
     */
				styles: null
			};
		}
	}]);

	return SInteractiveDemoComponent;
}(_SWebComponent3.default);

exports.default = SInteractiveDemoComponent;
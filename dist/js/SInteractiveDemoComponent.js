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
			this._compilationsCount = 0;
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
			this._previewElm = document.createElement('div');
			this._previewElm.className = this._componentNameDash + '__preview';

			// loading
			this._previewLoaderElm = document.createElement('div');
			this._previewLoaderElm.className = this._componentNameDash + '__preview-loader';

			// iframe
			this._iframeElm = document.createElement('iframe');
			this._iframeElm.width = '100%';
			this._iframeElm.setAttribute('frameborder', 'no');

			// append elements
			this._previewElm.appendChild(this._iframeElm);
			this._previewElm.appendChild(this._previewLoaderElm);
			this.appendChild(this._previewElm);
			// __prependChild(this._previewElm, this);

			// get the document of the iframe reference
			this._iframeDocument = this._iframeElm.contentDocument || this._iframeElm.contentWindow.document;

			// wrapper
			this._wrapperElm = this._iframeDocument.createElement('div');
			this._wrapperElm.setAttribute('id', 'wrapper');

			// firefox bugfix
			this._iframeDocument.open();
			this._iframeDocument.close();

			// get the iframe body reference
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

			// listen for compilations
			this.addEventListener('compileStart', this._onCompileStart.bind(this));
			this.addEventListener('compileEnd', this._onCompileEnd.bind(this));
			this.addEventListener('compileError', this._onCompileEnd.bind(this));

			// listen for window resize
			window.addEventListener('resize', (0, _throttle2.default)(this._onWindowResize.bind(this), 200));

			// listen for update from parts
			this.addEventListener('update', function (e) {
				var rawCode = e.detail.data;
				var codeElm = void 0;
				var updateHtml = false;
				// handle how to inject code
				switch (e.detail.language) {
					case 'css':
						codeElm = document.createElement('style');
						updateHtml = true;
						break;
					case 'js':
					case 'javascript':
						codeElm = document.createElement('script');
						updateHtml = true;
						break;
					default:
						codeElm = document.createElement('div');
						codeElm.setAttribute('html', true);
						codeElm._originalCode = rawCode;
						break;
				}
				// inject the code
				codeElm.innerHTML = rawCode;
				// empty the container before appending the new one
				_this2._iframeBody.querySelector('#' + e.target.id).innerHTML = '';
				// append the new code into container
				_this2._iframeBody.querySelector('#' + e.target.id).appendChild(codeElm);
				// update html if needed
				if (updateHtml) {
					var htmlElms = _this2._iframeBody.querySelectorAll('[html]');
					[].forEach.call(htmlElms, function (elm) {
						if (!elm._originalCode) return;
						elm.innerHTML = '';
						elm.innerHTML = elm._originalCode;
					});
				}
				// update preview size
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
   * On compilation start
   * @param 		{Event} 	e 		The compilation start event
   */

	}, {
		key: '_onCompileStart',
		value: function _onCompileStart(e) {
			// count the compilations in progress
			this._compilationsCount++;
			// add the compilation class
			this.addComponentClass(this, null, 'compiling');
		}

		/**
   * On compilation end
   * @param 		{Event} 	e 		The compilation end event
   */

	}, {
		key: '_onCompileEnd',
		value: function _onCompileEnd(e) {
			// update the compilations in progress
			this._compilationsCount--;
			// check if end of compilations
			if (this._compilationsCount <= 0) {
				// add the compilation class
				this.removeComponentClass(this, null, 'compiling');
			}
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
			return '\n\t\t\t@keyframes ' + componentNameDash + '-preview-loader {\n\t\t\t\tfrom {\n\t\t\t\t\ttransform:rotate(0deg);\n\t\t\t\t}\n\t\t\t\tto {\n\t\t\t\t\ttransform:rotate(360deg);\n\t\t\t\t}\n\t\t\t}\n\t\t\t' + componentNameDash + ' {\n\t\t\t\tdisplay: flex;\n\t\t\t\twidth:100%;\n\t\t\t\tflex-flow: row wrap;\n\t\t\t\tposition:relative;\n\t\t\t}\n\t\t\t' + componentNameDash + ' > *:after {\n\t\t\t\tcontent:"";\n\t\t\t\tdisplay:block;\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:0; left:0;\n\t\t\t\twidth:100%; height:100%;\n\t\t\t\tborder:1px solid rgba(0,0,0,.1);\n\t\t\t\tz-index:99;\n\t\t\t\tpointer-events:none;\n\t\t\t}\n\t\t\t' + componentNameDash + ' > * + *:after {\n\t\t\t\tborder-left:none;\n\t\t\t}\n\t\t\t' + componentNameDash + ' iframe {\n\t\t\t\t// position:absolute;\n\t\t\t\t// top:0; left:0;\n\t\t\t\t// width:100%; height:100%;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__preview {\n\t\t\t\tbox-sizing : border-box;\n\t\t\t\tflex:1 1 100%;\n\t\t\t\tflex:1 0;\n\t\t\t\tposition:relative;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__preview-loader {\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:0; left:0;\n\t\t\t\twidth:100%; height:100%;\n\t\t\t\tbackground-color:rgba(38,50,56,.5);\n\t\t\t\topacity: 0;\n\t\t\t\ttransition:opacity .1s ease-in-out;\n\t\t\t\tpointer-events:none;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__preview-loader:after {\n\t\t\t\tcontent:"";\n\t\t\t\tdisplay:block;\n\t\t\t\tposition:absolute;\n\t\t\t\twidth:20px; height:20px;\n\t\t\t\ttop:50%; left:50%;\n\t\t\t\tmargin-top:-10px;\n\t\t\t\tmargin-left:-10px;\n\t\t\t\ttransform-origin:10px 10px;\n\t\t\t\tbackground-image:url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'white\' d=\'M13 0c3.7.3 7 2.3 9 5l-2 1c-1.5-2-4-3.7-7-4V0zM2 12c0-1.5.3-3 1-4L1 7c-.6 1.3-1 3-1 5 0 1.8.4 3.6 1.2 5L3 16c-.7-1-1-2.5-1-4zm20 0c0 1.5-.3 3-1 4l1.8 1c.8-1.4 1.2-3.2 1.2-5s-.4-3.6-1.2-5L21 8c.7 1 1 2.5 1 4zm-2 6c-1.5 2-4 3.7-7 4v2c3.7-.3 7-2.3 9-5l-2-1zM4 6c1.5-2 4-3.7 7-4V0C7.3.3 4 2.3 2 5l2 1zm7 16c-3-.3-5.5-2-7-4l-2 1c2 2.7 5.3 4.7 9 5v-2z\'/></svg>");\n\t\t\t\tbackground-position:50% 50%;\n\t\t\t\tbackground-size:20px;\n\t\t\t\tbackground-repeat:no-repeat;\n\t\t\t\tanimation:' + componentNameDash + '-preview-loader 1s linear infinite;\n\t\t\t\tfilter:drop-shadow(rgba(0,0,0,.3) 0 0 1px);\n\t\t\t}\n\t\t\t.' + componentNameDash + '--compiling .' + componentNameDash + '__preview-loader {\n\t\t\t\topacity: 1;\n\t\t\t\tpointer-events:all;\n\t\t\t}\n\t\t\t' + componentNameDash + ' > *:not(.' + componentNameDash + '__preview) {\n\t\t\t\tflex:1 0;\n\t\t\t}\n\t\t\t@media all and (max-width:600px) {\n\t\t\t\t' + componentNameDash + ' {\n\t\t\t\t\tflex-flow: column wrap;\n\t\t\t\t}\n\t\t\t}\n\t\t';
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
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

var _find2 = require('lodash/find');

var _find3 = _interopRequireDefault(_find2);

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
			this._refs = {};
			this._iframeRefs = {};
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

			// find the editors
			this._refs.editors = [].filter.call(this.children, function (child) {
				return child.id && child.nodeName !== 'IFRAME';
			});

			// inject the html needed
			this._refs.preview = document.createElement('div');
			this._refs.preview.className = this._componentNameDash + '__preview';

			// loading
			this._refs.previewLoader = document.createElement('div');
			this._refs.previewLoader.className = this._componentNameDash + '__preview-loader';

			// header
			this._refs.header = document.createElement('div');
			this._refs.header.className = this._componentNameDash + '__header';

			// iframe
			this._refs.iframe = document.createElement('iframe');
			this._refs.iframe.width = '100%';
			this._refs.iframe.setAttribute('frameborder', 'no');

			// append elements
			this._refs.preview.appendChild(this._refs.iframe);
			this._refs.preview.appendChild(this._refs.previewLoader);
			(0, _prependChild2.default)(this._refs.header, this);
			this.appendChild(this._refs.preview);

			// get the document of the iframe reference
			this._iframeRefs.document = this._refs.iframe.contentDocument || this._refs.iframe.contentWindow.document;

			// wrapper
			this._iframeRefs.wrapper = this._iframeRefs.document.createElement('div');
			this._iframeRefs.wrapper.setAttribute('id', 'wrapper');

			// firefox bugfix
			this._iframeRefs.document.open();
			this._iframeRefs.document.close();

			// get the iframe body reference
			this._iframeRefs.body = this._iframeRefs.document.body;

			// create the preview div
			[].forEach.call(this._refs.editors, function (part) {
				var innerIframePartElm = _this2._iframeRefs.document.createElement('div');
				innerIframePartElm.id = part.id;
				_this2._iframeRefs.wrapper.appendChild(innerIframePartElm);
				// create toggle for this part
				var toggleElm = document.createElement('div');
				toggleElm.className = _this2._componentNameDash + '__display-toggle';
				toggleElm._toggleId = part.id;
				toggleElm.innerHTML = part.id;
				// check if need to be displayed or not
				if (_this2.props.hide.indexOf(part.id) === -1) {
					toggleElm.classList.add('active');
				} else {
					// hide the editor
					part.style.display = 'none';
				}
				// append to header
				_this2._refs.header.appendChild(toggleElm);
				// listen for click
				toggleElm.addEventListener('click', _this2._onDisplayToggleClick.bind(_this2));
			});

			// append wrapper
			this._iframeRefs.body.appendChild(this._iframeRefs.wrapper);

			// inject resources
			this._injectResourcesInsidePreview();

			// listen when component has mounted inside iframe
			this._iframeRefs.document.addEventListener('componentDidMount', this._onComponentDidMountInsideIframe.bind(this));

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
				_this2._iframeRefs.body.querySelector('#' + e.target.id).innerHTML = '';
				// append the new code into container
				_this2._iframeRefs.body.querySelector('#' + e.target.id).appendChild(codeElm);
				// update html if needed
				if (updateHtml) {
					var htmlElms = _this2._iframeRefs.body.querySelectorAll('[html]');
					[].forEach.call(htmlElms, function (elm) {
						if (!elm._originalCode) return;
						elm.innerHTML = '';
						elm.innerHTML = elm._originalCode;
					});
				}
				// update preview size
				if (_this2.props.resizePreview) _this2._updatePreviewHeight();
			});
		}

		/**
   * On toggle display clicked
   * @param 		{MouseEvent} 		e 		The mouse event
   */

	}, {
		key: '_onDisplayToggleClick',
		value: function _onDisplayToggleClick(e) {
			// check if is active or not
			var isActive = e.target.classList.contains('active');
			// get the editor
			var editorElm = (0, _find3.default)(this._refs.editors, function (editor) {
				return editor.id === e.target._toggleId;
			});
			console.log('editor', editorElm);
			if (isActive) {
				e.target.classList.remove('active');
				editorElm.style.display = 'none';
			} else {
				e.target.classList.add('active');
				editorElm.style.display = 'block';
				editorElm.refresh && editorElm.refresh();
			}
		}

		/**
   * On component did mount inside iframe
   */

	}, {
		key: '_onComponentDidMountInsideIframe',
		value: function _onComponentDidMountInsideIframe() {
			this._iframeRefs.document.removeEventListener('componentDidMount', this._onComponentDidMountInsideIframe);
			if (this.props.resizePreview) this._updatePreviewHeight();
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
			if (this.props.resizePreview) this._updatePreviewHeight();
		}

		/**
   * Inject scripts and styles inside preview
   */

	}, {
		key: '_injectResourcesInsidePreview',
		value: function _injectResourcesInsidePreview() {
			var _this3 = this;

			var stl = this._iframeRefs.document.createElement('style');
			stl.innerHTML = '\n\t\t\tbody {\n\t\t\t\tmargin:0;\n\t\t\t\tpadding:0;\n\t\t\t}\n\t\t\t#wrapper {\n\t\t\t\tpadding: 20px;\n\t\t\t}\n\t\t';
			this._iframeRefs.body.appendChild(stl);

			if (this.props.scripts) {
				// make sure it's an array
				var scripts = [].concat(this.props.scripts);
				scripts.forEach(function (script) {
					var scriptTag = _this3._iframeRefs.document.createElement('script');
					scriptTag.src = script;
					_this3._iframeRefs.body.appendChild(scriptTag);
				});
			}
			if (this.props.styles) {
				// make sure it's an array
				var styles = [].concat(this.props.styles);
				styles.forEach(function (style) {
					var styleTag = _this3._iframeRefs.document.createElement('link');
					styleTag.href = style;
					styleTag.rel = 'stylesheet';
					_this3._iframeRefs.body.appendChild(styleTag);
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
				_this4._refs.iframe.removeAttribute('height');
				_this4._refs.iframe.height = _this4._iframeRefs.wrapper.scrollHeight + 15 + 'px';
			}, 50);
		}
	}], [{
		key: 'css',


		/**
   * Base css
   * @definition 		SWebComponent.css
   */
		value: function css(componentName, componentNameDash) {
			return '\n\t\t\t@keyframes ' + componentNameDash + '-preview-loader {\n\t\t\t\tfrom {\n\t\t\t\t\ttransform:rotate(0deg);\n\t\t\t\t}\n\t\t\t\tto {\n\t\t\t\t\ttransform:rotate(360deg);\n\t\t\t\t}\n\t\t\t}\n\t\t\t' + componentNameDash + ' {\n\t\t\t\tdisplay: flex;\n\t\t\t\twidth:100%;\n\t\t\t\tflex-flow: row wrap;\n\t\t\t\tposition:relative;\n\t\t\t\tcolor:#777;\n\t\t\t\tborder:1px solid rgba(0,0,0,.05);\n\t\t\t}\n\t\t\t// ' + componentNameDash + ' > *[id]:after {\n\t\t\t// \tcontent:"";\n\t\t\t// \tdisplay:block;\n\t\t\t// \tposition:absolute;\n\t\t\t// \ttop:0; left:0;\n\t\t\t// \twidth:100%; height:100%;\n\t\t\t// \tborder:1px solid rgba(0,0,0,.1);\n\t\t\t// \tz-index:99;\n\t\t\t// \tpointer-events:none;\n\t\t\t// }\n\t\t\t' + componentNameDash + ':not([layout="vertical"]) > * + *:after {\n\t\t\t\tborder-left:none;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__header {\n\t\t\t\tuser-selection:none;\n\t\t\t\tflex:1 1 100% !important;\n\t\t\t\twidth:100%;\n\t\t\t\tposition:relative;\n\t\t\t\tbackground:rgba(0,0,0,.05);\n\t\t\t}\n\t\t\t.' + componentNameDash + '__display-toggle {\n\t\t\t\tpadding:10px 15px 10px 30px;\n\t\t\t\tbackground-image:url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'#777\' d=\'M24 10.935v2.13l-8 3.948v-2.23L21.64 12 16 9.21V6.987l8 3.948zM8 14.783L2.36 12 8 9.21V6.987l-8 3.948v2.13l8 3.948v-2.23zM15.047 4H12.97L8.957 20h2.073l4.017-16z\'/></svg>");\n\t\t\t\tbackground-size:12px 12px;\n\t\t\t\tbackground-position:10px 10px;\n\t\t\t\tbackground-repeat:no-repeat;\n\t\t\t\tdisplay:inline-block;\n\t\t\t\tfont-size:12px;\n\t\t\t\tcursor:pointer;\n\t\t\t\topacity:.45;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__display-toggle.active {\n\t\t\t\topacity:1;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__preview {\n\t\t\t\tbox-sizing : border-box;\n\t\t\t\tflex:1 0;\n\t\t\t\tposition:relative;\n\t\t\t}\n\t\t\t' + componentNameDash + '[layout="vertical"] {\n\t\t\t\tflex-flow: column wrap;\n\t\t\t}\n\t\t\t' + componentNameDash + '[layout="vertical"] .' + componentNameDash + '__preview {\n\t\t\t\torder:-1;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__preview-loader {\n\t\t\t\tposition:absolute;\n\t\t\t\ttop:0; left:0;\n\t\t\t\twidth:100%; height:100%;\n\t\t\t\tbackground-color:rgba(38,50,56,.5);\n\t\t\t\topacity: 0;\n\t\t\t\ttransition:opacity .1s ease-in-out;\n\t\t\t\tpointer-events:none;\n\t\t\t}\n\t\t\t.' + componentNameDash + '__preview-loader:after {\n\t\t\t\tcontent:"";\n\t\t\t\tdisplay:block;\n\t\t\t\tposition:absolute;\n\t\t\t\twidth:20px; height:20px;\n\t\t\t\ttop:50%; left:50%;\n\t\t\t\tmargin-top:-10px;\n\t\t\t\tmargin-left:-10px;\n\t\t\t\ttransform-origin:10px 10px;\n\t\t\t\tbackground-image:url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'white\' d=\'M13 0c3.7.3 7 2.3 9 5l-2 1c-1.5-2-4-3.7-7-4V0zM2 12c0-1.5.3-3 1-4L1 7c-.6 1.3-1 3-1 5 0 1.8.4 3.6 1.2 5L3 16c-.7-1-1-2.5-1-4zm20 0c0 1.5-.3 3-1 4l1.8 1c.8-1.4 1.2-3.2 1.2-5s-.4-3.6-1.2-5L21 8c.7 1 1 2.5 1 4zm-2 6c-1.5 2-4 3.7-7 4v2c3.7-.3 7-2.3 9-5l-2-1zM4 6c1.5-2 4-3.7 7-4V0C7.3.3 4 2.3 2 5l2 1zm7 16c-3-.3-5.5-2-7-4l-2 1c2 2.7 5.3 4.7 9 5v-2z\'/></svg>");\n\t\t\t\tbackground-position:50% 50%;\n\t\t\t\tbackground-size:20px;\n\t\t\t\tbackground-repeat:no-repeat;\n\t\t\t\tanimation:' + componentNameDash + '-preview-loader 1s linear infinite;\n\t\t\t\tfilter:drop-shadow(rgba(0,0,0,.3) 0 0 1px);\n\t\t\t}\n\t\t\t.' + componentNameDash + '--compiling .' + componentNameDash + '__preview-loader {\n\t\t\t\topacity: 1;\n\t\t\t\tpointer-events:all;\n\t\t\t}\n\t\t\t' + componentNameDash + ' > *:not(.' + componentNameDash + '__preview) {\n\t\t\t\tflex:1 0;\n\t\t\t}\n\t\t\t@media all and (max-width:600px) {\n\t\t\t\t' + componentNameDash + ' {\n\t\t\t\t\tflex-flow: column wrap;\n\t\t\t\t}\n\t\t\t}\n\t\t';
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
				styles: null,

				/**
     * Automatically resize the preview
     * @prop
     * @type 		{Boolean}
     */
				resizePreview: true,

				/**
     * Specify the layout wanted between vertical and horizontal
     * @prop
     * @type 		{String}
     */
				layout: 'horizontal',

				/**
     * Hide some editors by default
     * @prop
     * @type 		{Array}
     */
				hide: []
			};
		}

		/**
   * Physical props
   * @definition 		SWebcomponent.physicalProps
   */

	}, {
		key: 'physicalProps',
		get: function get() {
			return ['layout'];
		}
	}]);

	return SInteractiveDemoComponent;
}(_SWebComponent3.default);

exports.default = SInteractiveDemoComponent;
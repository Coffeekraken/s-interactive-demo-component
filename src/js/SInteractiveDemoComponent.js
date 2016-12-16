import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import __throttle from 'coffeekraken-sugar/js/utils/functions/throttle'
import __prependChild from 'coffeekraken-sugar/js/dom/prependChild'
import Codemirror from 'codemirror'
import codemirrorCss from 'raw-loader!codemirror/lib/codemirror.css'
import Clipboard from 'clipboard';
import SAjax from 'coffeekraken-sugar/js/classes/SAjax'
require('codemirror/mode/htmlmixed/htmlmixed');
require('./codemirror/autoFormatRange');

export default class SReadMoreComponent extends SWebComponent {

	/**
	 * Base css
	 * @definition 		SWebComponent.css
	 */
	static css(componentName, componentNameDash) {
		return `
			${componentNameDash} {
				display: flex;
				width:100%;
				flex-flow: row wrap;
			}
			${componentNameDash} > * {
				flex:1 0;
			}
			${componentNameDash} > iframe {
				border : 1px solid #ddd;
				border-bottom: 0;
				box-sizing : border-box;
				flex:1 1 100%;
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
			 * Script to load inside the demo
			 * @prop
			 * @type 		{String}
			 */
			scripts : null,

			/**
			 * Styles to load inside the demo
			 * @prop
			 * @type 		{String}
			 */
			styles : null
		};
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

		// find some some parts
		const parts = [].filter.call(this.children, (child) => {
			return child.id && child.nodeName !== 'IFRAME';
		});

		// inject the html needed
		this._iframeElm = document.createElement('iframe');
		this._iframeElm.width = '100%';
		this._iframeElm.setAttribute('frameborder', 'no');
		__prependChild(this._iframeElm, this);
		this._iframeDocument = this._iframeElm.contentDocument || this._iframeElm.contentWindow.document;

		// wrapper
		this._wrapperElm = this._iframeDocument.createElement('div');
		this._wrapperElm.setAttribute('id', 'wrapper');

		// firefox bugfix
		this._iframeDocument.open();
		this._iframeDocument.close();

		this._iframeBody = this._iframeDocument.body;

		// create the preview div
		[].forEach.call(parts, (part) => {
			const partElm = this._iframeDocument.createElement('div');
			partElm.id = part.id;
			this._wrapperElm.appendChild(partElm);
		});

		// append wrapper
		this._iframeBody.appendChild(this._wrapperElm);

		// inject resources
		this._injectResourcesInsidePreview();

		this._iframeDocument.addEventListener('componentDidMount', this._onComponentDidMountInsideIframe.bind(this));

		// listen for window resize
		window.addEventListener('resize', __throttle(this._onWindowResize.bind(this), 200));

		// listen for update from parts
		this.addEventListener('update', (e) => {
			this._iframeBody.querySelector(`#${e.target.id}`).innerHTML = e.detail;
			this._updatePreviewHeight();
		});
	}

	/**
	 * On component did mount inside iframe
	 */
	_onComponentDidMountInsideIframe() {
		this._iframeDocument.removeEventListener('componentDidMount', this._onComponentDidMountInsideIframe);
		this._updatePreviewHeight();
	}

	/**
	 * On window resize
	 */
	_onWindowResize() {
		// update code and preview size
		this._updatePreviewHeight();
	}

	/**
	 * Inject scripts and styles inside preview
	 */
	_injectResourcesInsidePreview() {
		const stl = this._iframeDocument.createElement('style');
		stl.innerHTML = `
			body {
				margin:0;
				padding:0;
			}
			#wrapper {
				padding: 20px;
			}
		`;
		this._iframeBody.appendChild(stl);

		if (this.props.scripts) {
			// make sure it's an array
			const scripts = [].concat(this.props.scripts);
			scripts.forEach((script) => {
				const scriptTag = this._iframeDocument.createElement('script');
				scriptTag.src = script;
				this._iframeBody.appendChild(scriptTag);
			});
		}
		if (this.props.styles) {
			// make sure it's an array
			const styles = [].concat(this.props.styles);
			styles.forEach((style) => {
				const styleTag = this._iframeDocument.createElement('link');
				styleTag.href = style;
				styleTag.rel = 'stylesheet';
				this._iframeBody.appendChild(styleTag);
			});
		}
	}

	/**
	 * Update iframe height
	 */
	_updatePreviewHeight() {
		setTimeout(() => {
			this._iframeElm.removeAttribute('height');
			this._iframeElm.height = this._wrapperElm.scrollHeight + 2 + 'px';
		}, 50);
	}
}

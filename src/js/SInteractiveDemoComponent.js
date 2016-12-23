import SWebComponent from 'coffeekraken-sugar/js/core/SWebComponent'
import __throttle from 'coffeekraken-sugar/js/utils/functions/throttle'
import __prependChild from 'coffeekraken-sugar/js/dom/prependChild'

export default class SInteractiveDemoComponent extends SWebComponent {

	/**
	 * Base css
	 * @definition 		SWebComponent.css
	 */
	static css(componentName, componentNameDash) {
		return `
			@keyframes ${componentNameDash}-preview-loader {
				from {
					transform:rotate(0deg);
				}
				to {
					transform:rotate(360deg);
				}
			}
			${componentNameDash} {
				display: flex;
				width:100%;
				flex-flow: row wrap;
				position:relative;
			}
			${componentNameDash} > *:after {
				content:"";
				display:block;
				position:absolute;
				top:0; left:0;
				width:100%; height:100%;
				border:1px solid rgba(0,0,0,.1);
				z-index:99;
				pointer-events:none;
			}
			${componentNameDash} > * + *:after {
				border-left:none;
			}
			${componentNameDash} iframe {
				// position:absolute;
				// top:0; left:0;
				// width:100%; height:100%;
			}
			.${componentNameDash}__preview {
				box-sizing : border-box;
				flex:1 1 100%;
				flex:1 0;
				position:relative;
			}
			.${componentNameDash}__preview-loader {
				position:absolute;
				top:0; left:0;
				width:100%; height:100%;
				background-color:rgba(38,50,56,.5);
				opacity: 0;
				transition:opacity .1s ease-in-out;
				pointer-events:none;
			}
			.${componentNameDash}__preview-loader:after {
				content:"";
				display:block;
				position:absolute;
				width:20px; height:20px;
				top:50%; left:50%;
				margin-top:-10px;
				margin-left:-10px;
				transform-origin:10px 10px;
				background-image:url("data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path fill='white' d='M13 0c3.7.3 7 2.3 9 5l-2 1c-1.5-2-4-3.7-7-4V0zM2 12c0-1.5.3-3 1-4L1 7c-.6 1.3-1 3-1 5 0 1.8.4 3.6 1.2 5L3 16c-.7-1-1-2.5-1-4zm20 0c0 1.5-.3 3-1 4l1.8 1c.8-1.4 1.2-3.2 1.2-5s-.4-3.6-1.2-5L21 8c.7 1 1 2.5 1 4zm-2 6c-1.5 2-4 3.7-7 4v2c3.7-.3 7-2.3 9-5l-2-1zM4 6c1.5-2 4-3.7 7-4V0C7.3.3 4 2.3 2 5l2 1zm7 16c-3-.3-5.5-2-7-4l-2 1c2 2.7 5.3 4.7 9 5v-2z'/></svg>");
				background-position:50% 50%;
				background-size:20px;
				background-repeat:no-repeat;
				animation:${componentNameDash}-preview-loader 1s linear infinite;
				filter:drop-shadow(rgba(0,0,0,.3) 0 0 1px);
			}
			.${componentNameDash}--compiling .${componentNameDash}__preview-loader {
				opacity: 1;
				pointer-events:all;
			}
			${componentNameDash} > *:not(.${componentNameDash}__preview) {
				flex:1 0;
			}
			@media all and (max-width:600px) {
				${componentNameDash} {
					flex-flow: column wrap;
				}
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
		this._compilationsCount = 0;
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
		this._previewElm = document.createElement('div');
		this._previewElm.className = `${this._componentNameDash}__preview`;

		// loading
		this._previewLoaderElm = document.createElement('div');
		this._previewLoaderElm.className = `${this._componentNameDash}__preview-loader`;

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
		this._iframeDocument = this._iframeElm.contentDocument || this._iframeElm.contentWindow.document;

		// wrapper
		this._wrapperElm = this._iframeDocument.createElement('div');
		this._wrapperElm.setAttribute('id', 'wrapper');

		// firefox bugfix
		this._iframeDocument.open();
		this._iframeDocument.close();

		// get the iframe body reference
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

		// listen for compilations
		this.addEventListener('compileStart', this._onCompileStart.bind(this));
		this.addEventListener('compileEnd', this._onCompileEnd.bind(this));
		this.addEventListener('compileError', this._onCompileEnd.bind(this));

		// listen for window resize
		window.addEventListener('resize', __throttle(this._onWindowResize.bind(this), 200));

		// listen for update from parts
		this.addEventListener('update', (e) => {
			const rawCode = e.detail.data;
			let codeElm;
			let updateHtml = false;
			// handle how to inject code
			switch(e.detail.language) {
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
					codeElm.setAttribute('html',true);
					codeElm._originalCode = rawCode;
				break;
			}
			// inject the code
			codeElm.innerHTML = rawCode;
			// empty the container before appending the new one
			this._iframeBody.querySelector(`#${e.target.id}`).innerHTML = '';
			// append the new code into container
			this._iframeBody.querySelector(`#${e.target.id}`).appendChild(codeElm);
			// update html if needed
			if (updateHtml) {
				const htmlElms = this._iframeBody.querySelectorAll('[html]');
				[].forEach.call(htmlElms, (elm) => {
					if ( ! elm._originalCode) return;
					elm.innerHTML = '';
					elm.innerHTML = elm._originalCode
				});
			}
			// update preview size
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
	 * On compilation start
	 * @param 		{Event} 	e 		The compilation start event
	 */
	_onCompileStart(e) {
		// count the compilations in progress
		this._compilationsCount++;
		// add the compilation class
		this.addComponentClass(this, null, 'compiling');
	}

	/**
	 * On compilation end
	 * @param 		{Event} 	e 		The compilation end event
	 */
	_onCompileEnd(e) {
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

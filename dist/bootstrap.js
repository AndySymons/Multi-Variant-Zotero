/*
 * MVZ Plugin - bootstrap
 *
 * Standard Zotero 7+/10 restartless ("bootstrap") plugin entry points. See
 * SPECIFICATION_MVZ1_PLUGIN.md > "Delivery / installation" and
 * "UI plugin registration".
 */

/* global Services, Components, ChromeUtils */

var chromeHandle = null;
var mainWindowListener = null;

const PLUGIN_ID = 'multi-variant-zotero@andysymons.github.io';

function log(msg) {
	try { Zotero.debug('MVZ: ' + msg); } catch (e) { /* Zotero not ready yet */ }
}

/**
 * Loads prefs.js's `pref(name, value)` calls onto the *default* branch, so
 * they act as factory defaults (Versioning & Build Identification Rules:
 * version string must also be reflected wherever relevant - see manifest
 * version and Zotero.MVZ.VERSION in mvz-core.js).
 */
function installDefaultPrefs(rootURI) {
	const defaultBranch = Services.prefs.getDefaultBranch('');
	const sandbox = {
		pref: function (name, value) {
			switch (typeof value) {
				case 'boolean':
					defaultBranch.setBoolPref(name, value);
					break;
				case 'number':
					defaultBranch.setIntPref(name, value);
					break;
				default:
					defaultBranch.setStringPref(name, String(value));
			}
		}
	};
	Services.scriptloader.loadSubScript(rootURI + 'prefs.js', sandbox);
}

function registerChromeContent(rootURI) {
	// Only the content/ package is registered (no chrome.manifest, no locale registration):
	// Zotero's UI loads icons and stylesheets only from chrome:// URLs, whereas jar: rootURI
	// paths failed in test.2. Locale (.ftl) files are read directly from rootURI.
	const aomStartup = Components.classes['@mozilla.org/addons/addon-manager-startup;1']
		.getService(Components.interfaces.amIAddonManagerStartup);
	chromeHandle = aomStartup.registerChrome(Services.io.newURI(rootURI + 'manifest.json'), [['content', 'mvz', 'content/']]);
}

function loadContentScripts(rootURI) {
	const scripts = [
		'content/lib/mvz-bcp47.js',
		'content/mvz-core.js',
		'content/mvz-i18n.js',
		'content/mvz-common-ui.js',
		'content/mvz-itempane.js',
		'content/mvz-citeproc.js'
	];
	scripts.forEach(function (relPath) {
		Services.scriptloader.loadSubScript(rootURI + relPath, this);
	}, this);

	Zotero.MVZ.BCP47.load();
}

function onMainWindowLoad(window) {
	try {
		// Lets Fluent-bound text (item pane header/tooltip l10nIDs) resolve from locale/<locale>/mvz.ftl.
		window.MozXULElement.insertFTLIfNeeded('mvz.ftl');
		Zotero.MVZ.ItemPane.installFieldPopups(window);
	} catch (e) {
		Zotero.logError(e);
	}
}

function install() { /* no-op for restartless plugins */ }

async function startup({ id, version, rootURI }) {
	if (!Zotero.MVZ) Zotero.MVZ = {};
	Zotero.MVZ.rootURI = rootURI;
	installDefaultPrefs(rootURI);
	registerChromeContent(rootURI);
	loadContentScripts(rootURI);

	Zotero.MVZ.I18n.init();
	Zotero.MVZ.ItemPane.registerPane();
	Zotero.MVZ.ItemPane.registerCreatorListener();
	Zotero.MVZ.Citeproc.installHook();

	if (Zotero.PreferencePanes && typeof Zotero.PreferencePanes.register === 'function') {
		try {
			// Zotero loads `scripts` BEFORE the pane markup is inserted (see mvz-prefs.js) and
			// parses `src` as an XHTML fragment wrapped in a <div>, so the fragment must not
			// start with an XML declaration (TEST_REPORT_Alpha.3 test 303; test.3 panes 3-3/3-4).
			await Zotero.PreferencePanes.register({
				pluginID: PLUGIN_ID,
				src: 'chrome://mvz/content/preferences.xhtml',
				scripts: ['chrome://mvz/content/mvz-prefs.js'],
				stylesheets: ['chrome://mvz/content/mvz-preferences.css'],
				label: 'MVZ Plugin',
				image: 'chrome://mvz/content/icon16.png'
			});
		} catch (e) {
			Zotero.logError(e);
		}
	}

	mainWindowListener = {
		onOpenWindow: function (xulWindow) {
			const win = xulWindow.docShell.domWindow;
			win.addEventListener('load', function onLoad() {
				win.removeEventListener('load', onLoad, false);
				if (win.location.href.includes('zoteroPane')) onMainWindowLoad(win);
			}, false);
		},
		onCloseWindow: function () {}
	};
	Services.wm.addListener(mainWindowListener);

	// Attach to any main window(s) already open at install/enable time.
	const windows = Services.wm.getEnumerator('navigator:browser');
	while (windows.hasMoreElements()) {
		onMainWindowLoad(windows.getNext());
	}

	log('started, version ' + version);
}

function shutdown() {
	try {
		if (mainWindowListener) {
			Services.wm.removeListener(mainWindowListener);
			mainWindowListener = null;
		}
		if (Zotero.MVZ && Zotero.MVZ.ItemPane) {
			Zotero.MVZ.ItemPane.unregisterCreatorListener();
			Zotero.MVZ.ItemPane.unregisterPane();
			Zotero.MVZ.ItemPane.uninstallFieldPopups();
		}
		if (chromeHandle) {
			chromeHandle.destruct();
			chromeHandle = null;
		}
	} catch (e) {
		log('shutdown error: ' + e);
	}
}

function uninstall() { /* no-op for restartless plugins */ }

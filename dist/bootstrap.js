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
const LOCALES = ['en-GB', 'pt-PT'];

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

function registerChromeAndLocale(rootURI) {
	const aomStartup = Components.classes['@mozilla.org/addons/addon-manager-startup;1']
		.getService(Components.interfaces.amIAddonManagerStartup);
	const manifestURI = Services.io.newURI(rootURI + 'manifest.json');

	const chromeEntries = [
		['content', 'mvz', 'content/']
	];
	LOCALES.forEach(function (locale) {
		chromeEntries.push(['locale', 'mvz', locale, 'locale/' + locale + '/']);
	});

	chromeHandle = aomStartup.registerChrome(manifestURI, chromeEntries);

	// Register the Fluent source so `new Localization(['mvz.ftl'])` (see
	// mvz-i18n.js) and any `data-l10n-id` bindings in settings.xhtml can
	// resolve MVZ messages, in the Zotero UI's current locale.
	try {
		const { L10nRegistry, L10nFileSource } = ChromeUtils.importESModule('resource://gre/modules/L10nRegistry.sys.mjs');
		const source = new L10nFileSource('mvz', 'mvz', LOCALES, rootURI + 'locale/{locale}/');
		L10nRegistry.getInstance().registerSources([source]);
	} catch (e) {
		log('Could not register Fluent locale source: ' + e);
	}
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
		Zotero.MVZ.ItemPane.installFieldPopups(window);
	} catch (e) {
		Zotero.logError(e);
	}
}

function install() { /* no-op for restartless plugins */ }

async function startup({ id, version, rootURI }) {
	installDefaultPrefs(rootURI);
	registerChromeAndLocale(rootURI);
	loadContentScripts(rootURI);

	Zotero.MVZ.I18n.init();
	Zotero.MVZ.ItemPane.registerPane();
	Zotero.MVZ.ItemPane.registerCreatorListener();
	Zotero.MVZ.Citeproc.installHook();

	if (Zotero.PreferencePanes && typeof Zotero.PreferencePanes.register === 'function') {
		try {
			// BUG FIX (TEST_REPORT_Alpha.1.md, "Settings ... Does not display
			// MVZ preferences at all"): a <script src="..."> tag embedded in
			// the settings.xhtml fragment does NOT execute - Zotero loads
			// `src` as an inert markup fragment and inserts it into the
			// preferences document, which never runs embedded <script>
			// elements. The `scripts` option below is the mechanism Zotero
			// actually provides for attaching pane behaviour; the inline
			// <script> tag has been removed from settings.xhtml.
			await Zotero.PreferencePanes.register({
				pluginID: PLUGIN_ID,
				src: 'chrome://mvz/content/settings.xhtml',
				scripts: ['chrome://mvz/content/mvz-prefs.js'],
				stylesheets: ['chrome://mvz/content/mvz-settings.css'],
				label: 'MVZ Plugin',
				image: 'chrome://mvz/content/icon.png'
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

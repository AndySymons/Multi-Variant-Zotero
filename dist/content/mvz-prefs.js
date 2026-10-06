/*
 * MVZ Plugin - Settings pane controller
 * (SPECIFICATION_MVZ1_PLUGIN.md > "Preferences (Settings)")
 *
 * Loaded through the `scripts` option of Zotero.PreferencePanes.register (bootstrap.js).
 * Runs in a sandbox whose prototype is the Zotero preferences window.
 */

/* global Zotero, window, document */

(function () {
	'use strict';

	const Core = Zotero.MVZ.Core;
	const CommonUI = Zotero.MVZ.CommonUI;
	const I18n = Zotero.MVZ.I18n;

	// See mvz-core.js "DOM helper" - the preferences window is also a XUL
	// document, so dynamically-created elements need an explicit XHTML
	// namespace or they silently fail to render (TEST_REPORT_Alpha.1.md).
	function el(tagName) { return Core.createElement(document, tagName); }

	function localizeStaticLabels(root) {
		root.querySelectorAll('[data-mvz-l10n]').forEach(function (el) {
			el.textContent = I18n.t(el.getAttribute('data-mvz-l10n'));
		});
	}

	// -----------------------------------------------------------------
	// Tab navigation ("Persistence: the active tab state should default
	// to the [ Target document ] tab upon opening settings.")
	// -----------------------------------------------------------------

	function initTabs(root) {
		const buttons = root.querySelectorAll('.mvz-tab-button');
		const panels = root.querySelectorAll('.mvz-tab-panel');

		function activate(tabName) {
			panels.forEach(function (p) { p.hidden = p.dataset.tabPanel !== tabName; });
			buttons.forEach(function (b) { b.classList.toggle('mvz-active', b.dataset.tab === tabName); });
			Core.setPref('settings.activeTab', tabName);
		}

		buttons.forEach(function (b) {
			b.addEventListener('click', function () { activate(b.dataset.tab); });
		});

		// "defaults to the [Target document] tab upon opening settings" -
		// always reset to that tab on open, regardless of the last-used tab.
		activate('targetDocument');
	}

	// -----------------------------------------------------------------
	// Tab 1: Target document characteristics
	// -----------------------------------------------------------------

	function initTargetDocument(root) {
		const valueEl = root.querySelector('#mvz-target-language-value');
		const changeBtn = root.querySelector('#mvz-target-language-change');

		function refreshValue() {
			valueEl.textContent = Core.getTargetDocumentLanguage();
		}
		refreshValue();

		changeBtn.addEventListener('click', function () {
			CommonUI.openTagEditor(document, { mode: 'language' }).then(function (tag) {
				if (!tag) return;
				Core.setPref('targetDocument.language', tag);
				refreshValue();
			});
		});

		const styleRadios = root.querySelectorAll('input[name="mvz-style"]');
		const customFields = root.querySelector('#mvz-custom-template-fields');
		const standaloneEl = root.querySelector('#mvz-custom-standalone');
		const containedEl = root.querySelector('#mvz-custom-contained');

		const currentStyle = Core.getPref('targetDocument.style', 'apa');
		styleRadios.forEach(function (r) { r.checked = (r.value === currentStyle); });
		customFields.hidden = currentStyle !== 'custom';
		const includeOriginal = Core.getPref('targetDocument.includeOriginal', true);
		root.querySelectorAll('input[name="mvz-include-original"]').forEach(function (r) {
			r.checked = r.value === String(includeOriginal);
			r.addEventListener('change', function () {
				if (r.checked) Core.setPref('targetDocument.includeOriginal', r.value === 'true');
			});
		});
		standaloneEl.value = Core.getPref('targetDocument.customTemplateStandalone', '');
		containedEl.value = Core.getPref('targetDocument.customTemplateContained', '');

		styleRadios.forEach(function (r) {
			r.addEventListener('change', function () {
				if (!r.checked) return;
				Core.setPref('targetDocument.style', r.value);
				customFields.hidden = r.value !== 'custom';
			});
		});
		standaloneEl.addEventListener('input', function () {
			Core.setPref('targetDocument.customTemplateStandalone', standaloneEl.value);
		});
		containedEl.addEventListener('input', function () {
			Core.setPref('targetDocument.customTemplateContained', containedEl.value);
		});
	}

	// -----------------------------------------------------------------
	// Tab 2: Field inclusion matrix
	// (dedup by display name, alphabetical per locale - see
	// "Multiple fields -> one translation")
	// -----------------------------------------------------------------

	function initFieldMatrix(root) {
		const body = root.querySelector('#mvz-field-matrix-body');
		const matrix = Core.getFieldInclusionMatrix();
		const locale = CommonUI.uiLocale();
		const grouped = new Map();

		Core.FIELD_CATALOG.forEach(function (row) {
			row.fields.forEach(function (field) {
				const label = I18n.resolveField(field);
				if (!grouped.has(label)) grouped.set(label, { key: field, fields: [], label: label });
				grouped.get(label).fields.push(field);
			});
		});

		const sortedRows = [{ key: 'creator', fields: ['creator'], label: I18n.t('MVZ_FIELD_MATRIX_ALL_CREATORS') }]
			.concat(Array.from(grouped.values()).sort(function (a, b) { return a.label.localeCompare(b.label, locale); }));

		sortedRows.forEach(function (row) {
			const key = row.key;
			const prefs = matrix[key] || { original: true, transliteration: false, translation: false };
			const tr = el('tr');
			const th = el('th');
			th.textContent = row.label;
			tr.appendChild(th);

			['original', 'transliteration', 'translation'].forEach(function (col) {
				const td = el('td');
				const input = el('input');
				input.type = key === 'creator' ? 'radio' : 'checkbox';
				if (key === 'creator') input.name = 'mvz-matrix-creator';
				input.checked = !!prefs[col];
				input.addEventListener('change', function () {
					if (key === 'creator') {
						prefs.original = col === 'original';
						prefs.transliteration = col === 'transliteration';
						prefs.translation = col === 'translation';
					} else {
					prefs[col] = input.checked;
					if (!prefs.original && !prefs.transliteration && !prefs.translation) {
						prefs[col] = true;
						input.checked = true;
					}
					}
					row.fields.forEach(function (field) { matrix[field] = Object.assign({}, prefs); });
					Core.setFieldInclusionMatrix(matrix);
				});
				td.appendChild(input);
				tr.appendChild(td);
			});
			body.appendChild(tr);
		});
	}

	// -----------------------------------------------------------------
	// Tab 3: Script and language drop downs
	// -----------------------------------------------------------------

	function initShortlists(root) {
		CommonUI.renderList(root.querySelector('#mvz-script-shortlist'), {
			mode: 'script',
			getItems: function () { return Core.getJSONPref('scriptShortlist', []); },
			setItems: function (items) { Core.setJSONPref('scriptShortlist', items); }
		});
		CommonUI.renderList(root.querySelector('#mvz-language-shortlist'), {
			mode: 'language',
			getItems: function () { return Core.getJSONPref('languageShortlist', []); },
			setItems: function (items) { Core.setJSONPref('languageShortlist', items); }
		});
	}

	function init(root) {
		if (root.__mvzInitialised) return;
		root.__mvzInitialised = true;
		localizeStaticLabels(root);
		initTabs(root);
		initTargetDocument(root);
		initFieldMatrix(root);
		initShortlists(root);
	}

	// Zotero runs a pane's scripts BEFORE it inserts the pane markup (preferences.js
	// _loadPane), so wait for the markup to appear.
	let attempts = 0;
	(function waitForMarkup() {
		const root = document.getElementById('mvz-settings-root');
		if (root) {
			try {
				init(root);
			} catch (e) {
				Zotero.logError(e);
			}
			return;
		}
		if (++attempts < 200) setTimeout(waitForMarkup, 50);
	})();
})();

/*
 * MVZ Plugin - Settings pane controller
 * (SPECIFICATION_MVZ1_PLUGIN.md > "Preferences (Settings)")
 *
 * Loaded as a <script> by content/settings.xhtml. Runs in the Zotero
 * preferences window, where `Zotero` and `window` are both available.
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
		root.querySelectorAll('[data-l10n-id]').forEach(function (el) {
			el.textContent = I18n.t(el.getAttribute('data-l10n-id'));
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

		function labelFor(row) {
			if (row.key === 'creator') return I18n.t('MVZ_FIELD_MATRIX_ALL_CREATORS');
			return I18n.resolveField(row.labelField);
		}

		const rows = [{ key: 'creator', labelField: null }].concat(Core.FIELD_CATALOG);
		const sortedRows = rows
			.map(function (r) { return { row: r, label: labelFor(r) }; })
			.sort(function (a, b) {
				if (a.row.key === 'creator') return -1; // Creators row always first, per the specification's own table.
				if (b.row.key === 'creator') return 1;
				return a.label.localeCompare(b.label, locale);
			});

		sortedRows.forEach(function (entry) {
			const key = entry.row.key;
			const prefs = matrix[key] || { original: true, transliteration: false, translation: false };

			const tr = el('tr');

			const th = el('th');
			th.textContent = entry.label;
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
						// "Tick at least one in each row" - prevent unchecking the
						// last remaining tick.
						if (!prefs.original && !prefs.transliteration && !prefs.translation) {
							prefs[col] = true;
							input.checked = true;
						}
					}
					matrix[key] = prefs;
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

	function init() {
		const root = document.getElementById('mvz-settings-root');
		if (!root) return;
		localizeStaticLabels(root);
		initTabs(root);
		initTargetDocument(root);
		initFieldMatrix(root);
		initShortlists(root);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();

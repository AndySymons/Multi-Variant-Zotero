/*
 * MVZ Plugin - Common UI elements
 * (SPECIFICATION_MVZ1_PLUGIN.md > "Common UI elements")
 *
 * Implements, for re-use by both the Item Pane (mvz-itempane.js) and the
 * Settings pane (mvz-prefs.js):
 *   - The Script/language tag editor (a modal picker dialog that builds one
 *     BCP-47 tag via context-sensitive, searchable lists).
 *   - The Script/language list widget (an add/reorder/remove/edit list of
 *     tags, used for the item Language field, and for the dropdown
 *     shortlists in Settings > "Script and language drop downs").
 *
 * MVZ1 scope note: the "transliteration method preference" picker flow
 * (Common UI > Script/language tag editor, numbered list item 3) is OUT of
 * scope for MVZ1 - README.md marks "Target doc preferred transcription
 * models" as a v2.0+ feature. Only flows 1 (script) and 2 (language) are
 * implemented here.
 */

/* global Zotero, document */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.CommonUI = (function () {
	'use strict';

	const Core = Zotero.MVZ.Core;

	// See mvz-core.js "DOM helper" - must use an explicit XHTML namespace
	// when creating elements inside a Zotero (XUL) host document, or they
	// silently fail to render (TEST_REPORT_Alpha.1.md).
	function el(doc, tagName) { return Core.createElement(doc, tagName); }

	function uiLocale() {
		try { return Zotero.locale || 'en-US'; } catch (e) { return 'en-US'; }
	}

	function displayNameOf(type, code) {
		try {
			return new Intl.DisplayNames([uiLocale()], { type: type }).of(code) || code;
		} catch (e) {
			return code;
		}
	}

	function sortedByDisplayName(codes, type) {
		const locale = uiLocale();
		return codes
			.map(function (code) { return { code: code, name: displayNameOf(type, code) }; })
			.sort(function (a, b) { return a.name.localeCompare(b.name, locale); });
	}

	// -----------------------------------------------------------------
	// Searchable single-select list (shared building block)
	// -----------------------------------------------------------------

	function buildSearchableList(doc, items, onPick) {
		const wrap = el(doc, 'div');
		wrap.className = 'mvz-picker-list';

		const search = el(doc, 'input');
		search.type = 'text';
		search.placeholder = Zotero.MVZ.I18n.t('MVZ_SEARCH_PLACEHOLDER');
		search.className = 'mvz-picker-search';
		wrap.appendChild(search);

		const list = el(doc, 'div');
		list.className = 'mvz-picker-results';
		wrap.appendChild(list);

		function render(filter) {
			list.textContent = '';
			const f = (filter || '').toLowerCase();
			items
				.filter(function (it) { return !f || it.name.toLowerCase().indexOf(f) !== -1 || it.code.toLowerCase().indexOf(f) !== -1; })
				.forEach(function (it) {
					const row = el(doc, 'div');
					row.className = 'mvz-picker-row';
					row.textContent = it.name + ' (' + it.code + ')';
					row.addEventListener('click', function () { onPick(it.code); });
					list.appendChild(row);
				});
		}

		search.addEventListener('input', function () { render(search.value); });
		render('');

		return wrap;
	}

	// -----------------------------------------------------------------
	// Modal dialog shell
	// -----------------------------------------------------------------

	function openModal(doc, titleToken) {
		const overlay = el(doc, 'div');
		overlay.className = 'mvz-modal-overlay';

		const dialog = el(doc, 'div');
		dialog.className = 'mvz-modal-dialog';

		const title = el(doc, 'h3');
		title.textContent = Zotero.MVZ.I18n.t(titleToken);
		dialog.appendChild(title);

		const body = el(doc, 'div');
		dialog.appendChild(body);

		overlay.appendChild(dialog);
		doc.documentElement.appendChild(overlay);

		return {
			body: body,
			setTitle: function (token) { title.textContent = Zotero.MVZ.I18n.t(token); },
			close: function () { overlay.remove(); }
		};
	}

	// -----------------------------------------------------------------
	// Script/language tag editor
	// -----------------------------------------------------------------

	/**
	 * @param {Document} doc
	 * @param {Object} options
	 *   mode: 'script' | 'language'
	 *   excludeCodes: string[] codes already present elsewhere in the same list (e.g.
	 *     item languages already present - "must prevent adding [...] a language
	 *     tag already listed in the item's Language field").
	 * @returns {Promise<string|null>} resolved BCP-47 tag, or null if cancelled.
	 */
	function openTagEditor(doc, options) {
		const BCP47 = Zotero.MVZ.BCP47;
		options = options || {};
		const exclude = (options.excludeCodes || []).map(function (c) { return c.toLowerCase(); });

		return new Promise(function (resolve) {
			const state = { language: null, script: null, region: null };

			const modal = openModal(doc, options.mode === 'script' ? 'MVZ_PICK_SCRIPT_TITLE' : 'MVZ_PICK_LANGUAGE_TITLE');

			function finish(tag) {
				modal.close();
				resolve(tag);
			}

			function buildTag() {
				// Script mode allows a script-only tag (no language qualifier);
				// language mode always has a language as its first component.
				if (!state.language && !state.script) return '';
				const parts = [];
				if (state.language) parts.push(state.language);
				if (state.script) parts.push(state.script);
				if (state.region) parts.push(state.region);
				if (!state.language) {
					// Script-only tag: not a parseable BCP-47 language tag (no
					// language subtag), so format subtags directly rather than
					// routing through parseTag/formatTag (which require a
					// language as the first subtag).
					return parts.join('-');
				}
				return BCP47.formatTag(BCP47.parseTag(parts.join('-')));
			}

			function showOptionalStep() {
				modal.body.textContent = '';

				const summary = el(doc, 'p');
				summary.textContent = buildTag();
				modal.body.appendChild(summary);

				// Optional: add/override region.
				if (!state.region) {
					const addRegion = el(doc, 'button');
					addRegion.textContent = Zotero.MVZ.I18n.t('MVZ_PICK_ADD_REGION');
					addRegion.addEventListener('click', function () {
						modal.setTitle('MVZ_PICK_REGION_TITLE');
						modal.body.textContent = '';
						const regions = sortedByDisplayName(BCP47.allRegions(), 'region');
						modal.body.appendChild(buildSearchableList(doc, regions, function (code) {
							state.region = BCP47.formatRegion(code);
							showOptionalStep();
						}));
					});
					modal.body.appendChild(addRegion);
				}

				// mode === 'script': optionally add a language qualifier.
				if (options.mode === 'script' && !state.language) {
					const addLang = el(doc, 'button');
					addLang.textContent = Zotero.MVZ.I18n.t('MVZ_PICK_ADD_LANGUAGE');
					addLang.addEventListener('click', function () {
						modal.setTitle('MVZ_PICK_LANGUAGE_TITLE');
						modal.body.textContent = '';
						const languages = sortedByDisplayName(BCP47.allLanguages(), 'language');
						modal.body.appendChild(buildSearchableList(doc, languages, function (code) {
							state.language = BCP47.formatLanguage(code);
							showOptionalStep();
						}));
					});
					modal.body.appendChild(addLang);
				}

				// mode === 'language': optionally override the script if the
				// language permits more than one, or to force a non-default script.
				if (options.mode === 'language') {
					const addScript = el(doc, 'button');
					addScript.textContent = Zotero.MVZ.I18n.t('MVZ_PICK_ADD_SCRIPT');
					addScript.addEventListener('click', function () {
						modal.setTitle('MVZ_PICK_SCRIPT_TITLE');
						modal.body.textContent = '';
						const candidateCodes = BCP47.scriptsForLanguage(state.language).length
							? BCP47.scriptsForLanguage(state.language).map(function (s) { return s.toLowerCase(); })
							: BCP47.allScripts();
						const scripts = sortedByDisplayName(candidateCodes, 'script');
						modal.body.appendChild(buildSearchableList(doc, scripts, function (code) {
							state.script = BCP47.formatScript(code);
							showOptionalStep();
						}));
					});
					modal.body.appendChild(addScript);
				}

				const okBtn = el(doc, 'button');
				okBtn.textContent = Zotero.MVZ.I18n.t('MVZ_OK_BUTTON');
				okBtn.addEventListener('click', function () { finish(buildTag()); });
				modal.body.appendChild(okBtn);

				const cancelBtn = el(doc, 'button');
				cancelBtn.textContent = Zotero.MVZ.I18n.t('MVZ_CANCEL_BUTTON');
				cancelBtn.addEventListener('click', function () { finish(null); });
				modal.body.appendChild(cancelBtn);
			}

			function startScriptFlow() {
				const scripts = sortedByDisplayName(BCP47.allScripts(), 'script')
					.filter(function (s) { return exclude.indexOf(s.code) === -1; });
				modal.body.appendChild(buildSearchableList(doc, scripts, function (code) {
					state.script = BCP47.formatScript(code);
					// A script-only tag has no language component; buildTag()
					// handles language == null for this mode.
					showOptionalStep();
				}));
			}

			function startLanguageFlow() {
				const languages = sortedByDisplayName(BCP47.allLanguages(), 'language')
					.filter(function (l) { return exclude.indexOf(l.code) === -1; });
				modal.body.appendChild(buildSearchableList(doc, languages, function (code) {
					state.language = BCP47.formatLanguage(code);
					const scripts = BCP47.scriptsForLanguage(state.language);
					if (scripts.length === 1) {
						state.script = scripts[0];
					}
					// If multiple scripts are possible, leave state.script unset -
					// the user may pick one via "Add / override a script" below,
					// otherwise the tag is written without an explicit script.
					showOptionalStep();
				}));
			}

			if (options.mode === 'script') {
				startScriptFlow();
			} else {
				startLanguageFlow();
			}
		});
	}

	// -----------------------------------------------------------------
	// Script/language LIST widget (add / reorder / remove / edit)
	// -----------------------------------------------------------------

	/**
	 * @param {HTMLElement} container
	 * @param {Object} options
	 *   mode: 'script' | 'language'
	 *   getItems: () => string[]
	 *   setItems: (string[]) => void
	 *   onChange: () => void (called after any mutation, after setItems)
	 */
	function renderList(container, options) {
		const doc = container.ownerDocument;
		container.textContent = '';
		container.classList.add('mvz-tag-list');

		function refresh() {
			container.textContent = '';
			const items = options.getItems();

			items.forEach(function (tag, index) {
				const row = el(doc, 'div');
				row.className = 'mvz-tag-list-row';
				row.draggable = true;
				row.dataset.index = String(index);

				const label = el(doc, 'span');
				label.className = 'mvz-tag-list-label';
				label.textContent = tag;
				label.addEventListener('click', function () {
					Zotero.MVZ.CommonUI.openTagEditor(doc, { mode: options.mode, excludeCodes: items.filter(function (_, i) { return i !== index; }) })
						.then(function (newTag) {
							if (!newTag) return;
							const next = items.slice();
							next[index] = newTag;
							options.setItems(next);
							if (options.onChange) options.onChange();
							refresh();
						});
				});
				row.appendChild(label);

				const removeBtn = el(doc, 'button');
				removeBtn.className = 'mvz-tag-list-remove';
				removeBtn.textContent = Zotero.MVZ.I18n.t('MVZ_LIST_REMOVE_BUTTON');
				removeBtn.addEventListener('click', function () {
					const next = items.slice();
					next.splice(index, 1);
					options.setItems(next);
					if (options.onChange) options.onChange();
					refresh();
				});
				row.appendChild(removeBtn);

				row.addEventListener('dragstart', function (ev) {
					ev.dataTransfer.setData('text/mvz-index', String(index));
				});
				row.addEventListener('dragover', function (ev) { ev.preventDefault(); });
				row.addEventListener('drop', function (ev) {
					ev.preventDefault();
					const fromIndex = parseInt(ev.dataTransfer.getData('text/mvz-index'), 10);
					if (Number.isNaN(fromIndex) || fromIndex === index) return;
					const next = items.slice();
					const [moved] = next.splice(fromIndex, 1);
					next.splice(index, 0, moved);
					options.setItems(next);
					if (options.onChange) options.onChange();
					refresh();
				});

				container.appendChild(row);
			});

			const addBtn = el(doc, 'button');
			addBtn.className = 'mvz-tag-list-add';
			addBtn.textContent = Zotero.MVZ.I18n.t('MVZ_LIST_ADD_BUTTON');
			addBtn.addEventListener('click', function () {
				Zotero.MVZ.CommonUI.openTagEditor(doc, { mode: options.mode, excludeCodes: options.getItems() })
					.then(function (newTag) {
						if (!newTag) return;
						const next = options.getItems().slice();
						next.push(newTag);
						options.setItems(next);
						if (options.onChange) options.onChange();
						refresh();
					});
			});
			container.appendChild(addBtn);
		}

		refresh();
		return { refresh: refresh };
	}

	return {
		uiLocale: uiLocale,
		displayNameOf: displayNameOf,
		sortedByDisplayName: sortedByDisplayName,
		openTagEditor: openTagEditor,
		renderList: renderList
	};
})();

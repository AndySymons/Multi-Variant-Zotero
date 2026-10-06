/*
 * MVZ Plugin - Item Pane front end
 * (SPECIFICATION_MVZ1_PLUGIN.md > "MVZ pane layout and interaction",
 * "Creator listener", "Extra field popup", "Language field popup")
 *
 * KNOWN FRAGILE INTEGRATION POINT: the Extra-field and Language-field popups
 * (below) attach focus/blur listeners to Zotero's *native* main item pane
 * fields by probing a handful of plausible selectors for those rows. Zotero
 * 7/10's main pane markup for these rows was not available to verify
 * empirically in this workspace (no live Zotero install). If the selectors
 * below don't match in a real install, `_findFieldRow()` logs a one-time
 * console warning - the developer should inspect the live DOM (e.g. via
 * the browser toolbox) and report back the correct selector/attribute so
 * this can be corrected (AGENT_RULES "Discovery rules").
 */

/* global Zotero */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.ItemPane = (function () {
	'use strict';

	const Core = Zotero.MVZ.Core;
	const I18n = Zotero.MVZ.I18n;
	const CommonUI = Zotero.MVZ.CommonUI;

	// See mvz-core.js "DOM helper" - every element injected into Zotero's
	// (XUL) main window must be created with an explicit XHTML namespace,
	// or it silently fails to render.
	function el(doc, tagName) { return Core.createElement(doc, tagName); }

	const PANE_ID = 'mvz-pane-multi-variant-zotero';
	const PLUGIN_ID = 'multi-variant-zotero@andysymons.github.io';

	// Per-item cache of the creator list last seen, used by the Creator
	// listener to detect which index was removed on a subsequent 'modify'.
	const _lastCreators = new Map(); // itemID -> [{firstName,lastName,creatorTypeID}, ...]

	// -----------------------------------------------------------------
	// Variant state helpers (read/write via the Extra field)
	// -----------------------------------------------------------------

	function loadState(item) {
		return Core.parseExtra(item.getField('extra') || '');
	}

	function saveState(item, state) {
		const newExtra = Core.serializeExtra(state.preserved, state.variants);
		item.setField('extra', newExtra);
		return item.saveTx().catch(function (e) {
			Zotero.logError(e);
			Zotero.alert(null, I18n.t('MVZ_SAVE_ERROR_TITLE'), I18n.t('MVZ_SAVE_ERROR_BODY', { error_message: String(e) }));
		});
	}

	const debouncedSave = Core.debounce(function (item, state) {
		saveState(item, state);
	}, 300);

	function variantsFor(state, field, creatorIndex) {
		return state.variants.filter(function (v) {
			if (creatorIndex !== undefined && creatorIndex !== null) return v.creatorIndex === creatorIndex;
			return v.field === field;
		});
	}

	// -----------------------------------------------------------------
	// Ordered list of variant-capable fields for an item (Appendix 2,
	// "same order as Zotero shows them in the main item pane").
	// -----------------------------------------------------------------

	function orderedVariantFieldsForItem(item) {
		try {
			const itemTypeID = Zotero.ItemTypes.getID(item.itemType);
			const fieldIDs = Zotero.ItemFields.getItemTypeFields(itemTypeID);
			const ordered = fieldIDs
				.map(function (id) { return Zotero.ItemFields.getName(id); })
				.filter(function (name) { return Core.isVariantField(name); });
			if (ordered.length) return ordered;
		} catch (e) {
			Zotero.logError(e);
		}
		// Defensive fallback: catalog declaration order, restricted to fields
		// that actually have a getField() result for this item type.
		return Core.VARIANT_FIELDS.filter(function (name) {
			try { return item.getField(name) !== undefined; } catch (e) { return false; }
		});
	}

	// -----------------------------------------------------------------
	// Rendering
	// -----------------------------------------------------------------

	function clear(container) {
		container.textContent = '';
	}

	function renderVariantRow(doc, container, options) {
		// options: { labelText, baseValueText, baseValueBlank, variants,
		//   onAddLanguage, onAddScript, onEditVariant(variant, newValue),
		//   onDeleteVariant(variant), onChangeVariantTag(variant) }
		const group = el(doc, 'div');
		group.className = 'mvz-field-group' + (options.baseValueBlank ? ' mvz-blank' : '');

		function row(labelText, valueText, buttons, rowOptions) {
			const r = el(doc, 'div');
			r.className = 'mvz-row';

			const label = el(doc, 'span');
			label.className = 'mvz-row-label';
			label.textContent = labelText || '';
			r.appendChild(label);

			const value = el(doc, 'span');
			value.className = 'mvz-row-value';
			value.textContent = valueText || '';
			if (rowOptions && rowOptions.onValueClick) {
				value.classList.add('mvz-clickable');
				value.addEventListener('click', rowOptions.onValueClick);
			}
			r.appendChild(value);

			const btnBox = el(doc, 'span');
			btnBox.className = 'mvz-row-buttons';
			(buttons || []).forEach(function (b) {
				const btn = el(doc, 'button');
				btn.textContent = b.text;
				btn.title = b.title || '';
				btn.disabled = !!b.disabled;
				btn.addEventListener('click', b.onClick);
				btnBox.appendChild(btn);
			});
			r.appendChild(btnBox);

			group.appendChild(r);
			return r;
		}

		// First line: base field + (first variant, if any).
		const first = options.variants[0] || null;
		row(options.labelText, options.baseValueText, [
			{ text: '+L', title: I18n.t('MVZ_ADD_LANGUAGE_VARIANT_TOOLTIP'), disabled: options.baseValueBlank, onClick: options.onAddLanguage },
			{ text: '+S', title: I18n.t('MVZ_ADD_SCRIPT_VARIANT_TOOLTIP'), disabled: options.baseValueBlank, onClick: options.onAddScript }
		]);

		if (first) {
			renderVariantLine(doc, group, first, options);
		}

		// Subsequent variant lines.
		options.variants.slice(1).forEach(function (v) {
			renderVariantLine(doc, group, v, options);
		});

		container.appendChild(group);
		return group;
	}

	function renderVariantLine(doc, group, variant, options) {
		const r = el(doc, 'div');
		r.className = 'mvz-row mvz-variant-row';

		const typeLabel = el(doc, 'span');
		typeLabel.className = 'mvz-row-label mvz-type-indicator';
		typeLabel.textContent = I18n.t(variant.type === 'l' ? 'MVZ_TYPE_INDICATOR_L' : 'MVZ_TYPE_INDICATOR_S');
		r.appendChild(typeLabel);

		const tag = el(doc, 'span');
		tag.className = 'mvz-row-tag mvz-clickable';
		tag.textContent = I18n.t('MVZ_VARIANT', { language_tag: variant.tag });
		tag.addEventListener('click', function () { options.onChangeVariantTag(variant); });
		r.appendChild(tag);

		const value = el(doc, 'input');
		value.type = 'text';
		value.className = 'mvz-row-value mvz-variant-value';
		value.value = variant.value;
		value.addEventListener('input', function () { options.onEditVariant(variant, value.value); });
		r.appendChild(value);

		const del = el(doc, 'button');
		del.className = 'mvz-row-delete';
		del.textContent = '-';
		del.title = I18n.t('MVZ_DELETE_VARIANT_TOOLTIP');
		del.addEventListener('click', function () {
			if (!doc.defaultView.confirm(I18n.t('MVZ_DELETE_VARIANT_CONFIRM_BODY'))) return;
			options.onDeleteVariant(variant);
		});
		r.appendChild(del);

		group.appendChild(r);
	}

	function ensureStylesheet(doc) {
		if (doc.getElementById('mvz-itempane-stylesheet')) return;
		const link = el(doc, 'link');
		link.id = 'mvz-itempane-stylesheet';
		link.rel = 'stylesheet';
		link.href = 'chrome://mvz/content/mvz-itempane.css';
		// Zotero's main window is a XUL document and has no `.head` shorthand
		// - fall back to the document root, which always exists.
		(doc.head || doc.documentElement).appendChild(link);
	}

	function render(body, item) {
		const doc = body.ownerDocument;
		ensureStylesheet(doc);
		clear(body);

		if (!item || item.isNote() || item.isAttachment()) return;

		const state = loadState(item);
		_lastCreators.set(item.id, item.getCreators().map(function (c) {
			return { firstName: c.firstName, lastName: c.lastName, name: c.name, creatorTypeID: c.creatorTypeID };
		}));

		const languageClean = Core.isLanguageFieldClean(item.getField('language') || '');

		function persist() {
			debouncedSave(item, state);
		}

		function addVariant(type, field, creatorIndex) {
			if (!languageClean) {
				Zotero.alert(null, I18n.t('MVZ_LANGUAGE_NOT_CLEAN_TITLE'), I18n.t('MVZ_LANGUAGE_NOT_CLEAN_BODY'));
				return;
			}
			const itemLanguages = (item.getField('language') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
			CommonUI.openTagEditor(doc, { mode: type === 'l' ? 'language' : 'script' }).then(function (tag) {
				if (!tag) return;

				// "The UI must prevent adding an L-type variant for any language
				// tag already listed in the item's Language field, or an S-type
				// variant for any script tag matching the explicit or implied
				// script of those item languages."
				if (type === 'l' && itemLanguages.some(function (lt) { return Zotero.MVZ.BCP47.parseTag(lt).language === Zotero.MVZ.BCP47.parseTag(tag).language; })) {
					Zotero.alert(null, '', I18n.t('MVZ_LANGUAGE_ALREADY_IN_ITEM', { language_tag: tag }));
					return;
				}
				if (type === 's') {
					const tagScript = Zotero.MVZ.BCP47.parseTag(tag).script;
					const clashes = itemLanguages.some(function (lt) {
						const parsed = Zotero.MVZ.BCP47.parseTag(lt);
						const impliedScript = parsed.script || Zotero.MVZ.BCP47.defaultScriptForLanguage(parsed.language);
						return impliedScript && tagScript && impliedScript.toLowerCase() === tagScript.toLowerCase();
					});
					if (clashes) {
						Zotero.alert(null, '', I18n.t('MVZ_SCRIPT_ALREADY_IN_ITEM', { script_tag: tag }));
						return;
					}
				}

				// Duplicate-variant guard (Appendix 1, MVZ_DUPLICATE_VARIANT).
				const existing = creatorIndex !== null && creatorIndex !== undefined
					? variantsFor(state, null, creatorIndex)
					: variantsFor(state, field);
				if (existing.some(function (v) { return v.tag === tag; })) {
					Zotero.alert(null, '', I18n.t('MVZ_DUPLICATE_VARIANT', {
						field_name: field || 'creator',
						language_tag: tag
					}));
					return;
				}

				state.variants.push({ type: type, field: field || null, creatorIndex: creatorIndex === undefined ? null : creatorIndex, tag: tag, value: '' });
				persist();
				render(body, item);
			});
		}

		function deleteVariant(variant) {
			const idx = state.variants.indexOf(variant);
			if (idx !== -1) state.variants.splice(idx, 1);
			persist();
			render(body, item);
		}

		function editVariant(variant, newValue) {
			variant.value = newValue;
			persist();
		}

		function changeVariantTag(variant) {
			CommonUI.openTagEditor(doc, { mode: variant.type === 'l' ? 'language' : 'script' }).then(function (tag) {
				if (!tag) return;
				variant.tag = tag;
				persist();
				render(body, item);
			});
		}

		// --- Regular fields --------------------------------------------
		orderedVariantFieldsForItem(item).forEach(function (fieldName) {
			const baseValue = item.getField(fieldName) || '';
			renderVariantRow(doc, body, {
				labelText: I18n.t('MVZ_BASE_FIELD', { base_field_name: fieldName }),
				baseValueText: baseValue,
				baseValueBlank: !baseValue,
				variants: variantsFor(state, fieldName),
				onAddLanguage: function () { addVariant('l', fieldName, null); },
				onAddScript: function () { addVariant('s', fieldName, null); },
				onEditVariant: editVariant,
				onDeleteVariant: deleteVariant,
				onChangeVariantTag: changeVariantTag
			});
		});

		// --- Creators -----------------------------------------------------
		item.getCreators().forEach(function (creator, index) {
			const baseValue = creator.name || [creator.lastName, creator.firstName].filter(Boolean).join(', ');
			renderVariantRow(doc, body, {
				labelText: I18n.t('MVZ_CREATOR_FIELD_LABEL', { this_creator_index: index }),
				baseValueText: baseValue,
				baseValueBlank: !baseValue,
				variants: variantsFor(state, null, index),
				onAddLanguage: function () { addVariant('l', null, index); },
				onAddScript: function () { addVariant('s', null, index); },
				onEditVariant: editVariant,
				onDeleteVariant: deleteVariant,
				onChangeVariantTag: changeVariantTag
			});
		});
	}

	// -----------------------------------------------------------------
	// Item Pane section registration (Zotero 7+/10 ItemPaneManager API)
	// -----------------------------------------------------------------

	function registerPane() {
		if (!Zotero.ItemPaneManager || typeof Zotero.ItemPaneManager.registerSection !== 'function') {
			Zotero.logError(new Error('MVZ: Zotero.ItemPaneManager.registerSection is not available - cannot register the MVZ pane.'));
			return;
		}
		try {
			// BUG FIX (TEST_REPORT_Alpha.1.md, "Right toolbar icon ... smaller
			// image is required" / "Main pane ... just a 'Z' on blue
			// background"): the 64x64 install icon is too large for the pane
			// header / side-nav row and was apparently rejected/falling back
			// to Zotero's default icon. Use the dedicated smaller icons the
			// developer added under /src/images instead.
			Zotero.ItemPaneManager.registerSection({
				paneID: PANE_ID,
				pluginID: PLUGIN_ID,
				header: {
					l10nID: 'MVZ_PANE_TITLE',
					icon: 'chrome://mvz/content/icon32.png'
				},
				sidenav: {
					l10nID: 'MVZ_PANE_SECTION_TOOLTIP',
					icon: 'chrome://mvz/content/icon16.png'
				},
				onRender: function (props) {
					try {
						render(props.body, props.item);
					} catch (e) {
						Zotero.logError(e);
						// Surface failures visibly rather than leaving a silent
						// blank/grey pane (see TEST_REPORT_Alpha.1.md) - much
						// easier to diagnose from a live install than digging
						// through the hidden Zotero debug output log.
						try {
							props.body.textContent = 'MVZ error: ' + (e && e.message ? e.message : String(e));
						} catch (e2) { /* ignore - body itself may be unusable */ }
					}
				}
			});
		} catch (e) {
			Zotero.logError(e);
		}
	}

	// -----------------------------------------------------------------
	// Creator listener (SPECIFICATION > "Creator listener")
	// -----------------------------------------------------------------

	let _creatorObserverID = null;

	function registerCreatorListener() {
		_creatorObserverID = Zotero.Notifier.registerObserver({
			notify: function (event, type, ids) {
				if (event !== 'modify' || type !== 'item') return;
				ids.forEach(handleItemModified);
			}
		}, ['item'], 'mvz-creator-listener');
	}

	function unregisterCreatorListener() {
		if (_creatorObserverID) {
			Zotero.Notifier.unregisterObserver(_creatorObserverID);
			_creatorObserverID = null;
		}
	}

	function handleItemModified(itemID) {
		try {
			const item = Zotero.Items.get(itemID);
			if (!item) return;
			const previous = _lastCreators.get(itemID);
			if (!previous) return; // Never rendered/cached - nothing to diff.

			const current = item.getCreators();
			_lastCreators.set(itemID, current.map(function (c) {
				return { firstName: c.firstName, lastName: c.lastName, name: c.name, creatorTypeID: c.creatorTypeID };
			}));

			if (current.length >= previous.length) return; // Not a deletion.

			// Find the first index whose previous creator has no matching
			// counterpart at the same or later position in the new list -
			// i.e. the deleted index. A simple positional diff suffices for
			// the common "a single creator was removed" case described in
			// the specification.
			let deletedIndex = previous.length - 1;
			for (let i = 0; i < current.length; i++) {
				if (!sameCreator(previous[i], current[i])) {
					deletedIndex = i;
					break;
				}
			}

			const state = loadState(item);
			state.variants = state.variants.filter(function (v) {
				return v.creatorIndex === null || v.creatorIndex !== deletedIndex;
			});
			state.variants.forEach(function (v) {
				if (v.creatorIndex !== null && v.creatorIndex > deletedIndex) v.creatorIndex -= 1;
			});
			saveState(item, state).catch(function (e) {
				Zotero.logError(e);
				Zotero.alert(null, I18n.t('MVZ_CREATOR_SYNC_ERROR_TITLE'), I18n.t('MVZ_CREATOR_SYNC_ERROR_BODY', { error_message: String(e) }));
			});
		} catch (e) {
			Zotero.logError(e);
			Zotero.alert(null, I18n.t('MVZ_CREATOR_SYNC_ERROR_TITLE'), I18n.t('MVZ_CREATOR_SYNC_ERROR_BODY', { error_message: String(e) }));
		}
	}

	function sameCreator(a, b) {
		if (!a || !b) return false;
		return a.firstName === b.firstName && a.lastName === b.lastName && a.name === b.name;
	}

	// -----------------------------------------------------------------
	// Extra field popup (SPECIFICATION > "Extra field popup")
	// -----------------------------------------------------------------

	const _extraCache = new Map(); // itemID -> cached mvz/ variants text, while the warning is up.

	function _findFieldRow(doc, fieldName) {
		// See file header: these selectors are best-effort guesses at
		// Zotero's native main-pane row markup and should be verified
		// against a live install.
		const selectors = [
			'[fieldname="' + fieldName + '"]',
			'[data-field="' + fieldName + '"]',
			'#' + fieldName,
			'.' + fieldName + '-box'
		];
		for (const sel of selectors) {
			try {
				const el = doc.querySelector(sel);
				if (el) return el;
			} catch (e) { /* invalid selector for this fieldName - ignore */ }
		}
		return null;
	}

	function installFieldPopups(mainWindow) {
		const doc = mainWindow.document;

		doc.addEventListener('focusin', function (ev) {
			const extraRow = _findFieldRow(doc, 'extra');
			if (extraRow && extraRow.contains(ev.target)) {
				onExtraFieldFocus(mainWindow);
			}
			const langRow = _findFieldRow(doc, 'language');
			if (langRow && langRow.contains(ev.target)) {
				onLanguageFieldFocus(mainWindow);
			}
		}, true);

		doc.addEventListener('focusout', function (ev) {
			const extraRow = _findFieldRow(doc, 'extra');
			if (extraRow && extraRow.contains(ev.target)) {
				onExtraFieldBlur(mainWindow);
			}
		}, true);
	}

	function currentItem(mainWindow) {
		try {
			return mainWindow.ZoteroPane.getSelectedItems()[0];
		} catch (e) {
			return null;
		}
	}

	function onExtraFieldFocus(mainWindow) {
		const item = currentItem(mainWindow);
		if (!item) return;
		if (_extraCache.has(item.id)) return; // Warning already acknowledged/open.

		const state = loadState(item);
		_extraCache.set(item.id, state.variants);

		mainWindow.alert(I18n.t('MVZ_EXTRA_WARNING'));
	}

	function onExtraFieldBlur(mainWindow) {
		const item = currentItem(mainWindow);
		if (!item) return;
		const cachedVariants = _extraCache.get(item.id);
		if (!cachedVariants) return;
		_extraCache.delete(item.id);

		const rawExtra = item.getField('extra') || '';
		const preserved = Core.parseExtra(rawExtra).preserved;
		saveState(item, { preserved: preserved, variants: cachedVariants });
	}

	// -----------------------------------------------------------------
	// Language field popup (SPECIFICATION > "Language field popup")
	// -----------------------------------------------------------------

	function onLanguageFieldFocus(mainWindow) {
		const item = currentItem(mainWindow);
		if (!item) return;
		const doc = mainWindow.document;
		const raw = item.getField('language') || '';

		if (!Core.isLanguageFieldClean(raw)) {
			const cleaned = Core.cleanLanguageField(raw);
			if (cleaned.normalized && cleaned.normalized !== raw) {
				item.setField('language', cleaned.normalized);
				item.saveTx().catch(function (e) { Zotero.logError(e); });
			}
		}

		const current = (item.getField('language') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
		openLanguageListEditor(doc, item, current);
	}

	function openLanguageListEditor(doc, item, tags) {
		// A lightweight inline editor using the common tag-list widget
		// (Common UI > Script/language list).
		const host = el(doc, 'div');
		host.className = 'mvz-language-popup';
		CommonUI.renderList(host, {
			mode: 'language',
			getItems: function () { return tags; },
			setItems: function (next) { tags = next; },
			onChange: function () {
				item.setField('language', tags.join(', '));
				item.saveTx().catch(function (e) { Zotero.logError(e); });
			}
		});
		doc.documentElement.appendChild(host);
	}

	return {
		registerPane: registerPane,
		registerCreatorListener: registerCreatorListener,
		unregisterCreatorListener: unregisterCreatorListener,
		installFieldPopups: installFieldPopups,
		render: render
	};
})();

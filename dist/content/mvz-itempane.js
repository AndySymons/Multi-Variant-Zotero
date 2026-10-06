/*
 * MVZ Plugin - Item Pane front end
 * (SPECIFICATION_MVZ1_PLUGIN.md > "MVZ pane layout and interaction",
 * "Creator listener", "Extra field popup", "Language field popup")
 *
 * The Extra-field and Language-field listeners use Zotero 10 Info-pane
 * markup verified through the Zotero Developer > Run JavaScript DOM query:
 * editable-text[fieldname="extra|language"] inside .meta-row.
 *
 * Verified Zotero 10.0.5 facts used here:
 *  - item.getCreators() entries are { fieldMode, firstName, lastName, creatorTypeID };
 *    a single-field creator (fieldMode 1) keeps its whole name in lastName.
 *  - Item has setCreator / setCreators / removeCreator / getCreators.
 *  - ItemPaneManager.registerSection supplies onInit({refresh}) and onRender({body,item}).
 */

/* global Zotero */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.ItemPane = (function () {
	'use strict';

	const Core = Zotero.MVZ.Core;
	const I18n = Zotero.MVZ.I18n;
	const CommonUI = Zotero.MVZ.CommonUI;

	// Every element injected into Zotero's (XUL) main window must be created
	// with an explicit XHTML namespace (see mvz-core.js "DOM helper").
	function el(doc, tagName) { return Core.createElement(doc, tagName); }

	const PANE_ID = 'mvz-pane-multi-variant-zotero';
	const PLUGIN_ID = 'multi-variant-zotero@andysymons.github.io';
	const READ_ONLY_FIELDS = ['dateAdded', 'dateModified'];

	// itemID -> creators as last seen (used by the Creator listener to find a deleted index).
	const _lastCreators = new Map();
	// itemID -> { index, creatorTypeID, lastName, firstName, fieldMode } : a blank creator row
	// that exists only in the MVZ pane until the user types a name (Zotero rejects blank creators).
	const _pendingCreator = new Map();
	const _saveTimers = new Map();
	let _section = null; // { body, item, refresh }
	let _sectionID = null;

	// -----------------------------------------------------------------
	// Variant state (read/written through the Extra field)
	// -----------------------------------------------------------------

	function loadState(item) {
		return Core.parseExtra(item.getField('extra') || '');
	}

	// Writes the state into the in-memory item immediately, so every re-render sees it.
	function applyState(item, state) {
		item.setField('extra', Core.serializeExtra(state.preserved, state.variants));
	}

	function saveItem(item) {
		return item.saveTx().catch(function (e) {
			Zotero.logError(e);
			Zotero.alert(null, I18n.t('MVZ_SAVE_ERROR_TITLE'), I18n.t('MVZ_SAVE_ERROR_BODY', { error_message: String(e) }));
		});
	}

	function saveState(item, state) {
		applyState(item, state);
		return saveItem(item);
	}

	function scheduleSave(item) {
		if (_saveTimers.has(item.id)) clearTimeout(_saveTimers.get(item.id));
		_saveTimers.set(item.id, setTimeout(function () {
			_saveTimers.delete(item.id);
			saveItem(item);
		}, 300));
	}

	function variantsFor(state, field, creatorIndex) {
		return state.variants.filter(function (v) {
			if (creatorIndex !== undefined && creatorIndex !== null) return v.creatorIndex === creatorIndex;
			return v.field === field;
		}).sort(function (a, b) {
			return (a.variantIndex || 0) - (b.variantIndex || 0);
		});
	}

	function snapshotCreators(item) {
		_lastCreators.set(item.id, item.getCreators().map(function (c) {
			return { firstName: c.firstName, lastName: c.lastName, fieldMode: c.fieldMode, creatorTypeID: c.creatorTypeID };
		}));
	}

	// -----------------------------------------------------------------
	// Menus and panels (real drop-down menus, closed by any outside click)
	// -----------------------------------------------------------------

	let _closeMenu = null;

	function closeMenu() {
		if (_closeMenu) _closeMenu();
	}

	function showFloating(doc, x, y, build) {
		closeMenu();
		const box = el(doc, 'div');
		box.className = 'mvz-menu';
		box.style.cssText = 'position:fixed;z-index:100000;left:' + x + 'px;top:' + y + 'px;';
		build(box);
		doc.documentElement.appendChild(box);

		// Keep the box inside the window.
		const win = doc.defaultView;
		const rect = box.getBoundingClientRect();
		if (rect.right > win.innerWidth) box.style.left = Math.max(0, win.innerWidth - rect.width - 4) + 'px';
		if (rect.bottom > win.innerHeight) box.style.top = Math.max(0, win.innerHeight - rect.height - 4) + 'px';

		function dismiss(event) { if (!box.contains(event.target)) close(); }
		function onKey(event) { if (event.key === 'Escape') close(); }
		function close() {
			doc.removeEventListener('mousedown', dismiss, true);
			doc.removeEventListener('keydown', onKey, true);
			box.remove();
			if (_closeMenu === close) _closeMenu = null;
		}
		doc.addEventListener('mousedown', dismiss, true);
		doc.addEventListener('keydown', onKey, true);
		_closeMenu = close;
		return close;
	}

	function openMenu(doc, x, y, entries) {
		showFloating(doc, x, y, function (box) {
			entries.forEach(function (entry) {
				const item = el(doc, 'div');
				item.className = 'mvz-menu-item' + (entry.disabled ? ' mvz-disabled' : '');
				item.textContent = entry.label;
				if (!entry.disabled) {
					item.addEventListener('click', function () {
						closeMenu();
						entry.onClick();
					});
				}
				box.appendChild(item);
			});
		});
	}

	function openVariantShortlist(doc, x, y, onSelect) {
		showFloating(doc, x, y, function (box) {
			const lists = [
				{ type: 'l', token: 'MVZ_SHORTLIST_L_LABEL', values: Core.getJSONPref('languageShortlist', []) },
				{ type: 's', token: 'MVZ_SHORTLIST_S_LABEL', values: Core.getJSONPref('scriptShortlist', []) }
			];
			let count = 0;
			const columns = el(doc, 'div');
			columns.className = 'mvz-shortlist-columns';
			lists.forEach(function (entry) {
				const column = el(doc, 'div');
				const heading = el(doc, 'div');
				heading.className = 'mvz-menu-heading';
				heading.textContent = I18n.t(entry.token);
				column.appendChild(heading);
				entry.values.forEach(function (value) {
					const tag = typeof value === 'string' ? value : value && value.tag;
					if (!tag) return;
					count++;
					const option = el(doc, 'div');
					option.className = 'mvz-menu-item';
					option.textContent = tag;
					option.addEventListener('click', function () {
						closeMenu();
						onSelect(entry.type, tag);
					});
					column.appendChild(option);
				});
				columns.appendChild(column);
			});
			box.appendChild(columns);
			const help = el(doc, 'div');
			help.className = 'mvz-menu-note';
			help.textContent = I18n.t(count ? 'MVZ_SHORTLIST_EDIT_PREFS' : 'MVZ_SHORTLIST_EMPTY');
			box.appendChild(help);
		});
	}

	// -----------------------------------------------------------------
	// Ordered list of Info-pane rows (same sequence as Zotero shows them)
	// -----------------------------------------------------------------

	function orderedFieldsForItem(item) {
		try {
			const itemTypeID = Zotero.ItemTypes.getID(item.itemType);
			const fieldIDs = Zotero.ItemFields.getItemTypeFields(itemTypeID);
			const ordered = fieldIDs
				.map(function (id) { return Zotero.ItemFields.getName(id); })
				.filter(function (name) { return name !== 'extra'; });
			if (ordered.length) return ordered;
		} catch (e) {
			Zotero.logError(e);
		}
		return Core.VARIANT_FIELDS.filter(function (name) {
			try { return item.getField(name) !== undefined; } catch (e) { return false; }
		});
	}

	function orderedInfoEntries(item, doc, creatorCount) {
		const entries = [];
		const seen = new Set();
		function add(entry) {
			const key = entry.kind + ':' + (entry.kind === 'field' ? entry.name : entry.index);
			if (seen.has(key)) return;
			seen.add(key);
			entries.push(entry);
		}
		const table = doc.querySelector('#info-table');
		if (table) {
			table.querySelectorAll('.meta-row').forEach(function (row) {
				let creatorIndex = null;
				row.querySelectorAll('[autocompletesearchparam]').forEach(function (control) {
					try {
						const data = JSON.parse(control.getAttribute('autocompletesearchparam'));
						const match = /^creator-(\d+)-/.exec(data.fieldName || '');
						if (match) creatorIndex = parseInt(match[1], 10);
					} catch (e) { Zotero.logError(e); }
				});
				if (creatorIndex !== null && creatorIndex < creatorCount) {
					add({ kind: 'creator', index: creatorIndex });
					return;
				}
				const label = row.querySelector('.meta-label[fieldname]');
				const fieldName = label && label.getAttribute('fieldname');
				if (fieldName && fieldName !== 'extra' && fieldName !== 'itemType') add({ kind: 'field', name: fieldName });
			});
		}
		orderedFieldsForItem(item).forEach(function (name) { if (name !== 'itemType') add({ kind: 'field', name: name }); });
		for (let index = 0; index < creatorCount; index++) add({ kind: 'creator', index: index });
		return entries;
	}

	// -----------------------------------------------------------------
	// Values shown in the pane
	// -----------------------------------------------------------------

	function fieldDisplayValue(item, fieldName) {
		const raw = String(item.getField(fieldName) || '');
		if (raw && READ_ONLY_FIELDS.indexOf(fieldName) !== -1) {
			try {
				return Zotero.Date.sqlToDate(raw, true).toLocaleString();
			} catch (e) { /* fall through to the raw value */ }
		}
		return raw;
	}

	function splitVariantName(value) {
		const parts = String(value || '').split('||').map(function (part) { return part.trim(); });
		return { last: parts[0] || '', first: parts[1] || '' };
	}

	// -----------------------------------------------------------------
	// Rendering
	// -----------------------------------------------------------------

	function renderVariantRow(doc, container, options) {
		const group = el(doc, 'div');
		group.className = 'mvz-field-group' + (options.baseValueBlank ? ' mvz-blank' : '');

		function nameInput(valueText, placeholderToken, bind, callback, readOnly) {
			const input = el(doc, 'input');
			input.type = 'text';
			input.className = 'mvz-row-value';
			if (placeholderToken) input.placeholder = I18n.t(placeholderToken);
			input.value = valueText || '';
			if (bind) input.setAttribute('data-mvz-bind', bind);
			if (readOnly || !callback) input.readOnly = true;
			else input.addEventListener('input', callback);
			return input;
		}

		function baseRow() {
			const r = el(doc, 'div');
			r.className = 'mvz-row';

			const label = el(doc, 'span');
			label.className = 'mvz-row-label' + (options.onLabelClick ? ' mvz-clickable' : '');
			label.textContent = options.labelText || '';
			if (options.onLabelContextMenu) {
				label.addEventListener('contextmenu', function (event) {
					event.preventDefault();
					event.stopPropagation();
					options.onLabelContextMenu(event);
				});
			}
			if (options.onLabelClick) {
				label.addEventListener('click', function (event) { options.onLabelClick(event, label); });
			}
			r.appendChild(label);

			const values = el(doc, 'span');
			values.className = 'mvz-row-values';
			if (options.creator) {
				const c = options.creator;
				if (c.fieldMode === 1) {
					values.appendChild(nameInput(c.lastName, 'MVZ_CREATOR_FULL_NAME_PROMPT', options.bindBase + '|single', options.onCreatorEdit && function (event) {
						options.onCreatorEdit({ single: true, last: event.target.value, first: '' });
					}));
				} else {
					const last = nameInput(c.lastName, 'MVZ_CREATOR_LAST_NAME_PROMPT', options.bindBase + '|last');
					const first = nameInput(c.firstName, 'MVZ_CREATOR_FIRST_NAME_PROMPT', options.bindBase + '|first');
					const handler = options.onCreatorEdit && function () {
						options.onCreatorEdit({ single: false, last: last.value, first: first.value });
					};
					if (handler) {
						last.readOnly = false;
						first.readOnly = false;
						last.addEventListener('input', handler);
						first.addEventListener('input', handler);
					}
					const comma = el(doc, 'span');
					comma.className = 'mvz-comma';
					comma.textContent = ',';
					values.appendChild(last);
					values.appendChild(comma);
					values.appendChild(first);
				}
			} else {
				const readOnly = !options.onBaseValueEdit;
				const input = nameInput(options.baseValueText, null, options.bindBase, options.onBaseValueEdit && function (event) {
					options.onBaseValueEdit(event.target.value);
				}, readOnly);
				if (readOnly) input.classList.add('mvz-readonly');
				if (options.onBaseValueClick) input.addEventListener('click', options.onBaseValueClick);
				values.appendChild(input);
			}
			r.appendChild(values);

			const btnBox = el(doc, 'span');
			btnBox.className = 'mvz-row-buttons';
			(options.buttons || []).forEach(function (b) {
				const btn = el(doc, 'button');
				btn.type = 'button';
				btn.textContent = b.text;
				btn.title = b.title || '';
				btn.disabled = !!b.disabled;
				btn.addEventListener('click', function (event) { b.onClick(event, btn); });
				btnBox.appendChild(btn);
			});
			r.appendChild(btnBox);
			group.appendChild(r);
		}

		function variantRow(variant) {
			const r = el(doc, 'div');
			r.className = 'mvz-row mvz-variant-row';

			const label = el(doc, 'span');
			label.className = 'mvz-row-label mvz-variant-label mvz-clickable';
			const tag = el(doc, 'span');
			tag.className = 'mvz-variant-tag';
			tag.textContent = variant.tag;
			const type = el(doc, 'span');
			type.className = 'mvz-variant-type';
			type.textContent = variant.type.toUpperCase();
			label.appendChild(tag);
			label.appendChild(document_space(doc));
			label.appendChild(type);
			label.addEventListener('click', function (event) { options.onChangeVariantTag(variant, event); });
			r.appendChild(label);

			const key = (variant.field || 'creator[' + variant.creatorIndex + ']') + '|' + variant.variantIndex;
			const values = el(doc, 'span');
			values.className = 'mvz-row-values';
			if (options.creator) {
				const parts = splitVariantName(variant.value);
				if (options.creator.fieldMode === 1) {
					const input = nameInput(variant.value, 'MVZ_CREATOR_FULL_NAME_PROMPT', 'variant|' + key + '|all', function (event) {
						options.onEditVariant(variant, event.target.value);
					});
					if (!variant.value) input.classList.add('mvz-empty-variant');
					values.appendChild(input);
				} else {
					const last = nameInput(parts.last, 'MVZ_CREATOR_LAST_NAME_PROMPT', 'variant|' + key + '|last', function () {
						options.onEditVariant(variant, last.value + ' || ' + first.value);
					});
					const first = nameInput(parts.first, 'MVZ_CREATOR_FIRST_NAME_PROMPT', 'variant|' + key + '|first', function () {
						options.onEditVariant(variant, last.value + ' || ' + first.value);
					});
					if (!variant.value) { last.classList.add('mvz-empty-variant'); first.classList.add('mvz-empty-variant'); }
					const comma = el(doc, 'span');
					comma.className = 'mvz-comma';
					comma.textContent = ',';
					values.appendChild(last);
					values.appendChild(comma);
					values.appendChild(first);
				}
			} else {
				const input = nameInput(variant.value, null, 'variant|' + key + '|all', function (event) {
					options.onEditVariant(variant, event.target.value);
				});
				if (!variant.value) input.classList.add('mvz-empty-variant');
				values.appendChild(input);
			}
			r.appendChild(values);

			const btnBox = el(doc, 'span');
			btnBox.className = 'mvz-row-buttons';
			const del = el(doc, 'button');
			del.type = 'button';
			del.textContent = '-';
			del.title = I18n.t('MVZ_DELETE_VARIANT_TOOLTIP');
			del.addEventListener('click', function () { options.onDeleteVariant(variant); });
			btnBox.appendChild(del);
			r.appendChild(btnBox);
			group.appendChild(r);
		}

		baseRow();
		options.variants.forEach(variantRow);
		container.appendChild(group);
		return group;
	}

	function document_space(doc) {
		return doc.createTextNode(' ');
	}

	function ensureStylesheet(doc) {
		if (doc.getElementById('mvz-itempane-stylesheet')) return;
		const link = el(doc, 'link');
		link.id = 'mvz-itempane-stylesheet';
		link.rel = 'stylesheet';
		link.href = 'chrome://mvz/content/mvz-itempane.css';
		(doc.head || doc.documentElement).appendChild(link);
	}

	function scriptOfTag(tag) {
		const parsed = Zotero.MVZ.BCP47.parseTag(tag);
		if (parsed.script) return parsed.script;
		const first = String(tag).split('-')[0];
		return Zotero.MVZ.BCP47.isValidScript(first) ? Zotero.MVZ.BCP47.formatScript(first) : null;
	}

	function primaryCreatorTypeID(item) {
		try {
			return Zotero.CreatorTypes.getPrimaryIDForType(Zotero.ItemTypes.getID(item.itemType));
		} catch (e) {
			return 1;
		}
	}

	function structureSignature(item, state) {
		return JSON.stringify([
			item.itemType,
			item.getCreators().map(function (c) { return [c.fieldMode, c.creatorTypeID]; }),
			state.variants.map(function (v) { return [v.field, v.creatorIndex, v.type, v.tag]; }),
			Core.isLanguageFieldClean(item.getField('language') || ''),
			_pendingCreator.has(item.id) ? _pendingCreator.get(item.id).index : null
		]);
	}

	function render(body, item) {
		const doc = body.ownerDocument;
		ensureStylesheet(doc);
		body.textContent = '';
		body.classList.add('mvz-pane');

		if (!item || item.isNote() || item.isAttachment()) return;

		const state = loadState(item);
		snapshotCreators(item);
		const creators = item.getCreators();
		body.__mvzSignature = structureSignature(item, state);

		function persist() {
			applyState(item, state);
			scheduleSave(item);
		}

		function openAt(event, anchor) {
			if (event && typeof event.clientX === 'number' && (event.clientX || event.clientY)) return { x: event.clientX, y: event.clientY };
			const rect = anchor.getBoundingClientRect();
			return { x: rect.left, y: rect.bottom };
		}

		function applyVariant(type, field, creatorIndex, tag, editingVariant) {
			if (!Core.isLanguageFieldClean(item.getField('language') || '')) {
				Zotero.alert(null, I18n.t('MVZ_LANGUAGE_NOT_CLEAN_TITLE'), I18n.t('MVZ_LANGUAGE_NOT_CLEAN_BODY'));
				return;
			}
			const itemLanguages = (item.getField('language') || '').split(',').map(function (s) { return s.trim(); }).filter(Core.isValidItemLanguageTag);
			const parsedTag = Zotero.MVZ.BCP47.parseTag(tag);

			// "The UI must prevent adding an L-type variant for any language tag already listed
			// in the item's Language field, or an S-type variant for any script tag matching the
			// explicit or implied script of those item languages."
			if (type === 'l' && itemLanguages.some(function (lt) { return Zotero.MVZ.BCP47.parseTag(lt).language === parsedTag.language; })) {
				Zotero.alert(null, '', I18n.t('MVZ_LANGUAGE_ALREADY_IN_ITEM', { language_tag: tag }));
				return;
			}
			if (type === 's') {
				const tagScript = scriptOfTag(tag);
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

			const existing = creatorIndex !== null && creatorIndex !== undefined
				? variantsFor(state, null, creatorIndex)
				: variantsFor(state, field);
			if (existing.some(function (v) { return v !== editingVariant && v.type === type && v.tag === tag; })) {
				Zotero.alert(null, '', I18n.t('MVZ_DUPLICATE_VARIANT', { field_name: field || 'creator', language_tag: tag }));
				return;
			}
			if (editingVariant) {
				editingVariant.type = type;
				editingVariant.tag = tag;
			} else {
				state.variants.push({ type: type, field: field || null, creatorIndex: creatorIndex === undefined ? null : creatorIndex, variantIndex: existing.length, tag: tag, value: '' });
			}
			persist();
			render(body, item);
		}

		function chooseVariant(field, creatorIndex, editingVariant, event, anchor) {
			if (!Core.isLanguageFieldClean(item.getField('language') || '')) {
				Zotero.alert(null, I18n.t('MVZ_LANGUAGE_NOT_CLEAN_TITLE'), I18n.t('MVZ_LANGUAGE_NOT_CLEAN_BODY'));
				return;
			}
			const pos = openAt(event, anchor);
			openVariantShortlist(doc, pos.x, pos.y, function (type, tag) {
				applyVariant(type, field, creatorIndex, tag, editingVariant);
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

		// ---- creators ------------------------------------------------

		function writeCreators(list) {
			item.setCreators(list);
			snapshotCreators(item);
			applyState(item, state);
			saveItem(item);
			render(body, item);
		}

		function creatorFromEdit(base, edit) {
			const next = Object.assign({}, base);
			next.lastName = edit.last;
			next.firstName = edit.single ? '' : edit.first;
			return next;
		}

		function editCreator(index, edit) {
			const current = item.getCreators();
			if (!current[index]) return;
			item.setCreator(index, creatorFromEdit(current[index], edit));
			snapshotCreators(item);
			scheduleSave(item);
		}

		function capitalizeName(value) {
			return String(value || '').replace(/(^|\s)([^\s])/g, function (match, space, letter) {
				return space + letter.toLocaleUpperCase();
			});
		}

		function creatorHasName(c) { return !!(c.firstName || c.lastName); }

		function openCreatorTypeMenu(index, anchor, pending) {
			let types;
			try {
				types = Zotero.CreatorTypes.getTypesForItemType(Zotero.ItemTypes.getID(item.itemType));
			} catch (e) {
				Zotero.logError(e);
				return;
			}
			if (!Array.isArray(types)) return;
			const rect = anchor.getBoundingClientRect();
			const entries = [];
			types.forEach(function (entry) {
				let typeID = typeof entry === 'number' ? entry : entry && (entry.creatorTypeID || entry.id);
				if (typeID === undefined && typeof entry === 'string' && typeof Zotero.CreatorTypes.getID === 'function') typeID = Zotero.CreatorTypes.getID(entry);
				if (typeID === undefined || typeID === null) return;
				entries.push({ label: I18n.resolveCreatorType(typeID), onClick: function () {
					if (pending) {
						pending.creatorTypeID = typeID;
						render(body, item);
						return;
					}
					const next = Object.assign({}, item.getCreators()[index]);
					next.creatorTypeID = typeID;
					item.setCreator(index, next);
					snapshotCreators(item);
					saveItem(item);
					render(body, item);
				} });
			});
			openMenu(doc, rect.left, rect.bottom, entries);
		}

		function openCreatorContextMenu(index, anchor, pending) {
			const current = pending || item.getCreators()[index];
			const single = current.fieldMode === 1;
			const names = single ? [current.lastName] : [current.firstName, current.lastName];
			const rect = anchor.getBoundingClientRect();
			function commit(next) {
				if (pending) {
					Object.assign(pending, next);
					render(body, item);
					return;
				}
				item.setCreator(index, next);
				snapshotCreators(item);
				saveItem(item);
				render(body, item);
			}
			const entries = [{
				label: I18n.t('MVZ_CREATOR_FIX_CASE'),
				disabled: names.every(function (name) { return !name || capitalizeName(name) === name; }),
				onClick: function () {
					commit(Object.assign({}, current, { firstName: capitalizeName(current.firstName), lastName: capitalizeName(current.lastName) }));
				}
			}];
			if (!single) {
				entries.push({ label: I18n.t('MVZ_CREATOR_SWAP_NAMES'), onClick: function () {
					commit(Object.assign({}, current, { firstName: current.lastName, lastName: current.firstName }));
				} });
			}
			openMenu(doc, rect.left, rect.bottom, entries);
		}

		function toggleSingleName(index, pending) {
			const relatedVariants = pending ? [] : variantsFor(state, null, index);
			const base = pending || item.getCreators()[index];
			const next = Object.assign({}, base);
			if (base.fieldMode === 1) {
				// single -> two fields: last word is the last name, the rest the first name
				const words = String(base.lastName || '').trim().split(/\s+/).filter(Boolean);
				next.lastName = words.pop() || '';
				next.firstName = words.join(' ');
				next.fieldMode = 0;
				relatedVariants.forEach(function (variant) {
					const raw = String(variant.value || '').trim();
					if (raw.indexOf('||') !== -1) return;
					const w = raw.split(/\s+/).filter(Boolean);
					const last = w.pop() || '';
					variant.value = last + ' || ' + w.join(' ');
				});
			} else {
				// two fields -> single: first name, a space, last name
				next.lastName = [base.firstName, base.lastName].filter(Boolean).join(' ');
				next.firstName = '';
				next.fieldMode = 1;
				relatedVariants.forEach(function (variant) {
					const p = splitVariantName(variant.value);
					variant.value = [p.first, p.last].filter(Boolean).join(' ');
				});
			}
			if (pending) {
				Object.assign(pending, next);
				render(body, item);
				return;
			}
			item.setCreator(index, next);
			snapshotCreators(item);
			applyState(item, state);
			saveItem(item);
			render(body, item);
		}

		function deleteCreator(index, pending) {
			if (pending) {
				_pendingCreator.delete(item.id);
				render(body, item);
				return;
			}
			item.removeCreator(index, true);
			state.variants = state.variants.filter(function (v) { return v.creatorIndex !== index; });
			state.variants.forEach(function (v) { if (v.creatorIndex !== null && v.creatorIndex > index) v.creatorIndex -= 1; });
			snapshotCreators(item);
			applyState(item, state);
			saveItem(item);
			render(body, item);
		}

		function addCreatorAfter(index) {
			_pendingCreator.set(item.id, {
				index: index + 1,
				creatorTypeID: (creators[index] && creators[index].creatorTypeID) || primaryCreatorTypeID(item),
				lastName: '', firstName: '', fieldMode: (creators[index] && creators[index].fieldMode) || 0
			});
			render(body, item);
			const rows = body.querySelectorAll('[data-mvz-pending] input');
			if (rows[0]) rows[0].focus();
		}

		// A pending (blank) creator row becomes a real creator when focus leaves the row.
		function commitPending(pending, row) {
			if (!(pending.firstName || pending.lastName)) return;
			const list = item.getCreators();
			list.splice(pending.index, 0, {
				fieldMode: pending.fieldMode, firstName: pending.fieldMode === 1 ? '' : pending.firstName,
				lastName: pending.lastName, creatorTypeID: pending.creatorTypeID
			});
			state.variants.forEach(function (v) { if (v.creatorIndex !== null && v.creatorIndex >= pending.index) v.creatorIndex += 1; });
			_pendingCreator.delete(item.id);
			writeCreators(list);
		}

		function creatorButtons(index, creator, pending, soleBlank) {
			const named = creatorHasName(creator);
			return [
				{ text: creator.fieldMode === 1 ? '\u25AF\u25AF' : '\u25AD', title: I18n.t(creator.fieldMode === 1 ? 'MVZ_CREATOR_SWITCH_TWO' : 'MVZ_CREATOR_SWITCH_SINGLE'), onClick: function () { toggleSingleName(index, pending); } },
				{ text: '\u2296', title: I18n.t('MVZ_CREATOR_DELETE'), disabled: !named && !pending, onClick: function () { deleteCreator(index, pending); } },
				{ text: '\u2295', title: I18n.t('MVZ_CREATOR_CREATE'), disabled: !named && !soleBlank, onClick: function () {
					if (soleBlank) {
						const first = body.querySelector('[data-mvz-pending] input');
						if (first) first.focus();
						return;
					}
					addCreatorAfter(index);
				} },
				{ text: '\u2026', title: I18n.t('MVZ_CREATOR_CONTEXT_MENU_TOOLTIP'), onClick: function (event, btn) { openCreatorContextMenu(index, btn, pending); } }
			];
		}

		// ---- rows ------------------------------------------------------

		function renderField(fieldName) {
			const baseValue = fieldDisplayValue(item, fieldName);
			const readOnly = READ_ONLY_FIELDS.indexOf(fieldName) !== -1 || fieldName === 'language';
			renderVariantRow(doc, body, {
				labelText: I18n.resolveField(fieldName),
				baseValueText: baseValue,
				baseValueBlank: !baseValue,
				bindBase: 'field|' + fieldName,
				variants: variantsFor(state, fieldName),
				onLabelContextMenu: function (event) {
					if (!Core.isVariantField(fieldName)) {
						Zotero.alert(null, '', I18n.t('MVZ_VARIANTS_UNAVAILABLE', { field_name: I18n.resolveField(fieldName) }));
						return;
					}
					chooseVariant(fieldName, null, null, event, body);
				},
				onBaseValueEdit: readOnly ? null : Core.debounce(function (value) {
					try {
						item.setField(fieldName, value);
					} catch (e) {
						Zotero.logError(e);
						return;
					}
					saveItem(item);
				}, 300),
				onBaseValueClick: fieldName === 'language' ? function () { onLanguageFieldFocus(doc.defaultView); } : null,
				onEditVariant: editVariant,
				onDeleteVariant: deleteVariant,
				onChangeVariantTag: function (variant, event) { chooseVariant(variant.field, variant.creatorIndex, variant, event, body); }
			});
		}

		function renderCreator(index) {
			const creator = creators[index];
			renderVariantRow(doc, body, {
				labelText: I18n.resolveCreatorType(creator.creatorTypeID) + ' \u25BC',
				baseValueBlank: !creatorHasName(creator),
				bindBase: 'creator|' + index,
				creator: creator,
				buttons: creatorButtons(index, creator, null, false),
				variants: variantsFor(state, null, index),
				onLabelClick: function (event, label) { openCreatorTypeMenu(index, label, null); },
				onLabelContextMenu: function (event) { chooseVariant(null, index, null, event, body); },
				onCreatorEdit: Core.debounce(function (edit) { editCreator(index, edit); }, 300),
				onEditVariant: editVariant,
				onDeleteVariant: deleteVariant,
				onChangeVariantTag: function (variant, event) { chooseVariant(variant.field, variant.creatorIndex, variant, event, body); }
			});
		}

		function renderPending(pending) {
			const group = renderVariantRow(doc, body, {
				labelText: I18n.resolveCreatorType(pending.creatorTypeID) + ' \u25BC',
				baseValueBlank: true,
				bindBase: 'pending',
				creator: pending,
				buttons: creatorButtons(pending.index, pending, pending, creators.length === 0),
				variants: [],
				onLabelClick: function (event, label) { openCreatorTypeMenu(pending.index, label, pending); },
				onLabelContextMenu: function () { Zotero.alert(null, '', I18n.t('MVZ_VARIANTS_UNAVAILABLE', { field_name: I18n.resolveCreatorType(pending.creatorTypeID) })); },
				onCreatorEdit: function (edit) {
					pending.lastName = edit.last;
					pending.firstName = edit.single ? '' : edit.first;
				}
			});
			group.setAttribute('data-mvz-pending', 'true');
			group.addEventListener('focusout', function (event) {
				if (event.relatedTarget && group.contains(event.relatedTarget)) return;
				setTimeout(function () { if (_pendingCreator.get(item.id) === pending) commitPending(pending, group); }, 0);
			});
		}

		// ---- Item Type, then Zotero's own sequence of fields and creators ----

		const itemTypeLabel = I18n.resolveField('itemType');
		renderVariantRow(doc, body, {
			labelText: itemTypeLabel && itemTypeLabel !== 'itemType' ? itemTypeLabel : I18n.t('MVZ_ITEM_TYPE_LABEL'),
			baseValueText: I18n.resolveItemType(item.itemType),
			baseValueBlank: false,
			bindBase: 'itemType',
			variants: [],
			onLabelContextMenu: function () { Zotero.alert(null, '', I18n.t('MVZ_VARIANTS_UNAVAILABLE', { field_name: itemTypeLabel })); }
		});

		let pending = _pendingCreator.get(item.id);
		if (!creators.length && !pending) {
			pending = { index: 0, creatorTypeID: primaryCreatorTypeID(item), lastName: '', firstName: '', fieldMode: 0 };
			_pendingCreator.set(item.id, pending);
			body.__mvzSignature = structureSignature(item, state);
		}

		const entries = orderedInfoEntries(item, doc, creators.length);
		let placed = creators.length > 0 || !pending;
		entries.forEach(function (entry, i) {
			if (entry.kind === 'field') {
				renderField(entry.name);
				// With no creators the blank row sits straight after the first field (Title).
				if (!creators.length && pending && !placed && i === 0) { renderPending(pending); placed = true; }
			} else {
				if (pending && pending.index === entry.index && pending.index === 0) renderPending(pending);
				renderCreator(entry.index);
				if (pending && pending.index === entry.index + 1) renderPending(pending);
			}
		});
		if (!creators.length && pending && !placed) renderPending(pending);
	}

	// Brings the displayed values in line with the item after a change made elsewhere
	// (e.g. in Zotero's own Info pane), without disturbing the field being edited.
	function syncSection(item) {
		if (!_section || !_section.body || !_section.item || _section.item.id !== item.id) return;
		const body = _section.body;
		if (!body.isConnected) return;
		const state = loadState(item);
		if (body.__mvzSignature !== structureSignature(item, state)) {
			if (typeof _section.refresh === 'function') _section.refresh();
			else render(body, item);
			return;
		}
		const active = body.ownerDocument.activeElement;
		const creators = item.getCreators();
		body.querySelectorAll('[data-mvz-bind]').forEach(function (input) {
			if (input === active) return;
			const bind = input.getAttribute('data-mvz-bind').split('|');
			let value = null;
			if (bind[0] === 'field') {
				value = fieldDisplayValue(item, bind[1]);
			} else if (bind[0] === 'creator') {
				const c = creators[parseInt(bind[1], 10)];
				if (c) value = bind[2] === 'first' ? c.firstName : c.lastName;
			} else if (bind[0] === 'variant') {
				const v = state.variants.find(function (candidate) {
					return ((candidate.field || 'creator[' + candidate.creatorIndex + ']') + '|' + candidate.variantIndex) === bind[1] + '|' + bind[2];
				});
				if (v) value = bind[3] === 'last' ? splitVariantName(v.value).last : bind[3] === 'first' ? splitVariantName(v.value).first : v.value;
			}
			if (value !== null && input.value !== value) input.value = value;
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
			// Icons must be chrome:// URLs; the 16 px icon is used for both the header and the
			// side navigation (TEST_REPORT_Alpha.3 test 203: the larger icon looked cropped).
			_sectionID = Zotero.ItemPaneManager.registerSection({
				paneID: PANE_ID,
				pluginID: PLUGIN_ID,
				header: {
					l10nID: 'MVZ_PANE_TITLE',
					icon: 'chrome://mvz/content/icon16.png'
				},
				sidenav: {
					l10nID: 'MVZ_PANE_SECTION_TOOLTIP',
					icon: 'chrome://mvz/content/icon16.png'
				},
				onInit: function (props) {
					_section = { body: props.body, item: props.item, refresh: props.refresh };
				},
				onRender: function (props) {
					try {
						_section = { body: props.body, item: props.item, refresh: (_section && _section.refresh) || null };
						render(props.body, props.item);
					} catch (e) {
						Zotero.logError(e);
						try {
							props.body.textContent = 'MVZ error: ' + (e && e.message ? e.message : String(e));
						} catch (e2) { /* ignore - body itself may be unusable */ }
					}
				}
			});
			if (!_sectionID) Zotero.logError(new Error('MVZ: registerSection returned no ID (a section with the same paneID may already be registered).'));
		} catch (e) {
			Zotero.logError(e);
		}
	}

	function unregisterPane() {
		try {
			if (_sectionID) Zotero.ItemPaneManager.unregisterSection(_sectionID);
		} catch (e) {
			Zotero.logError(e);
		}
		_sectionID = null;
		_section = null;
		closeMenu();
	}

	// -----------------------------------------------------------------
	// Creator listener (SPECIFICATION > "Creator listener") + pane synchronisation
	// -----------------------------------------------------------------

	let _creatorObserverID = null;

	function registerCreatorListener() {
		_creatorObserverID = Zotero.Notifier.registerObserver({
			notify: function (event, type, ids) {
				if (event !== 'modify' || type !== 'item') return;
				ids.forEach(function (id) {
					handleItemModified(id);
					try {
						const item = Zotero.Items.get(id);
						if (item) syncSection(item);
					} catch (e) {
						Zotero.logError(e);
					}
				});
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
			snapshotCreators(item);

			if (current.length >= previous.length) return; // Not a deletion.

			// Find the first index whose previous creator differs from the new one at the same
			// position - i.e. the deleted index (single-removal case described in the specification).
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
			saveState(item, state);
		} catch (e) {
			Zotero.logError(e);
			Zotero.alert(null, I18n.t('MVZ_CREATOR_SYNC_ERROR_TITLE'), I18n.t('MVZ_CREATOR_SYNC_ERROR_BODY', { error_message: String(e) }));
		}
	}

	function sameCreator(a, b) {
		if (!a || !b) return false;
		return a.firstName === b.firstName && a.lastName === b.lastName && a.creatorTypeID === b.creatorTypeID;
	}

	// -----------------------------------------------------------------
	// Extra field popup (SPECIFICATION > "Extra field popup")
	// -----------------------------------------------------------------

	const _extraCache = new Map(); // itemID -> cached mvz/ variants, while the Extra field is being edited.
	const _extraWarningOpen = new Set();
	const _languagePopupOpen = new Set();
	const _installedWindows = []; // { doc, onFocusIn, onFocusOut }

	function _findFieldRow(doc, fieldName) {
		const control = doc.querySelector('editable-text[fieldname="' + fieldName + '"]');
		return control ? control.closest('.meta-row') : null;
	}

	function installFieldPopups(mainWindow) {
		const doc = mainWindow.document;

		function onFocusIn(ev) {
			const extraRow = _findFieldRow(doc, 'extra');
			if (extraRow && extraRow.contains(ev.target)) onExtraFieldFocus(mainWindow);
			const langRow = _findFieldRow(doc, 'language');
			if (langRow && langRow.contains(ev.target)) {
				// Take focus out of the native field, otherwise the user could keep typing in it
				// and its stale value would overwrite what the popup saves (TEST_REPORT_Alpha.3 804/809).
				try { ev.target.blur(); } catch (e) { /* ignore */ }
				setTimeout(function () { onLanguageFieldFocus(mainWindow); }, 0);
			}
		}
		function onFocusOut(ev) {
			const extraRow = _findFieldRow(doc, 'extra');
			if (extraRow && extraRow.contains(ev.target)) onExtraFieldBlur(mainWindow, ev.target);
		}
		doc.addEventListener('focusin', onFocusIn, true);
		doc.addEventListener('focusout', onFocusOut, true);
		_installedWindows.push({ doc: doc, onFocusIn: onFocusIn, onFocusOut: onFocusOut });
	}

	function uninstallFieldPopups() {
		_installedWindows.splice(0).forEach(function (entry) {
			entry.doc.removeEventListener('focusin', entry.onFocusIn, true);
			entry.doc.removeEventListener('focusout', entry.onFocusOut, true);
		});
	}

	function currentItem(mainWindow) {
		try {
			return mainWindow.ZoteroPane.getSelectedItems()[0];
		} catch (e) {
			return null;
		}
	}

	function popupShell(doc, titleToken) {
		const overlay = el(doc, 'div');
		overlay.className = 'mvz-modal-overlay';
		const dialog = el(doc, 'div');
		dialog.className = 'mvz-modal-dialog';
		if (titleToken) {
			const title = el(doc, 'h3');
			title.textContent = I18n.t(titleToken);
			dialog.appendChild(title);
		}
		const content = el(doc, 'div');
		dialog.appendChild(content);
		overlay.appendChild(dialog);
		doc.documentElement.appendChild(overlay);
		return { overlay: overlay, content: content, close: function () { overlay.remove(); } };
	}

	function onExtraFieldFocus(mainWindow) {
		const item = currentItem(mainWindow);
		if (!item || _extraCache.has(item.id)) return;
		const state = loadState(item);
		_extraCache.set(item.id, state.variants);
		_extraWarningOpen.add(item.id);
		const doc = mainWindow.document;
		const active = doc.activeElement;
		const start = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
		const end = active && typeof active.selectionEnd === 'number' ? active.selectionEnd : null;
		const popup = popupShell(doc, 'MVZ_EXTRA_WARNING_TITLE');
		const message = el(doc, 'p');
		message.textContent = I18n.t('MVZ_EXTRA_WARNING');
		const understood = el(doc, 'button');
		understood.type = 'button';
		understood.textContent = I18n.t('MVZ_EXTRA_WARNING_BUTTON');
		understood.addEventListener('click', function () {
			_extraWarningOpen.delete(item.id);
			popup.close();
			const row = _findFieldRow(doc, 'extra');
			const control = row && row.querySelector('textarea');
			if (control) {
				control.focus();
				if (start !== null && end !== null) control.setSelectionRange(start, end);
			}
		});
		popup.content.appendChild(message);
		popup.content.appendChild(understood);
		understood.focus();
	}

	function onExtraFieldBlur(mainWindow, target) {
		const item = currentItem(mainWindow);
		if (!item || _extraWarningOpen.has(item.id)) return;
		const cachedVariants = _extraCache.get(item.id);
		if (!cachedVariants) return;
		const row = _findFieldRow(mainWindow.document, 'extra');
		const control = target && target.localName === 'textarea' ? target : row && row.querySelector('textarea');
		const rawExtra = control ? control.value : item.getField('extra') || '';
		setTimeout(function () {
			_extraCache.delete(item.id);
			const preserved = Core.parseExtra(rawExtra).preserved;
			saveState(item, { preserved: preserved, variants: cachedVariants });
		}, 0);
	}

	// -----------------------------------------------------------------
	// Language field popup (SPECIFICATION > "Language field popup")
	// -----------------------------------------------------------------

	function onLanguageFieldFocus(mainWindow) {
		const item = currentItem(mainWindow);
		if (!item || _languagePopupOpen.has(item.id)) return;
		_languagePopupOpen.add(item.id);
		const doc = mainWindow.document;
		const raw = item.getField('language') || '';
		const current = raw ? raw.split(',').map(function (s) { return s.trim(); }) : [];
		openLanguageListEditor(doc, item, current, function () { _languagePopupOpen.delete(item.id); });
	}

	function openLanguageListEditor(doc, item, tags, onClose) {
		const popup = popupShell(doc, 'MVZ_LANGUAGE_FIELD_EDITOR_TITLE');
		const host = el(doc, 'div');
		CommonUI.renderList(host, {
			mode: 'language',
			getItems: function () { return tags; },
			setItems: function (next) { tags = next; },
			onChange: function () {}
		});
		popup.content.appendChild(host);
		const buttons = el(doc, 'div');
		buttons.className = 'mvz-dialog-buttons';
		const save = el(doc, 'button');
		save.type = 'button';
		save.textContent = I18n.t('MVZ_OK_BUTTON');
		save.addEventListener('click', function () {
			popup.close();
			onClose();
			item.setField('language', tags.join(', '));
			saveItem(item).then(function () {
				if (_section && _section.item && _section.item.id === item.id) syncSection(item);
			});
		});
		const cancel = el(doc, 'button');
		cancel.type = 'button';
		cancel.textContent = I18n.t('MVZ_CANCEL_BUTTON');
		cancel.addEventListener('click', function () {
			popup.close();
			onClose();
		});
		buttons.appendChild(save);
		buttons.appendChild(cancel);
		popup.content.appendChild(buttons);
	}

	return {
		registerPane: registerPane,
		unregisterPane: unregisterPane,
		registerCreatorListener: registerCreatorListener,
		unregisterCreatorListener: unregisterCreatorListener,
		installFieldPopups: installFieldPopups,
		uninstallFieldPopups: uninstallFieldPopups,
		render: render
	};
})();

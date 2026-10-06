/*
 * MVZ Plugin - Item Pane front end
 * (SPECIFICATION_MVZ1_PLUGIN.md > "MVZ pane layout and interaction",
 * "Creator listener", "Extra field popup", "Language field popup")
 *
 * The Extra-field and Language-field listeners use Zotero 10 Info-pane
 * markup verified through the Zotero Developer > Run JavaScript DOM query:
 * editable-text[fieldname="extra|language"] inside .meta-row.
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

	function openVariantShortlist(doc, onSelect) {
		const overlay = el(doc, 'div');
		overlay.className = 'mvz-modal-overlay';
		const dialog = el(doc, 'div');
		dialog.className = 'mvz-modal-dialog mvz-shortlist-dialog';
		const columns = el(doc, 'div');
		columns.className = 'mvz-shortlist-columns';
		const lists = [
			{ type: 'l', token: 'MVZ_SHORTLIST_L_LABEL', values: Core.getJSONPref('languageShortlist', []) },
			{ type: 's', token: 'MVZ_SHORTLIST_S_LABEL', values: Core.getJSONPref('scriptShortlist', []) }
		];
		let count = 0;
		lists.forEach(function (entry) {
			const column = el(doc, 'div');
			const heading = el(doc, 'h4');
			heading.textContent = I18n.t(entry.token);
			column.appendChild(heading);
			entry.values.forEach(function (value) {
				const tag = typeof value === 'string' ? value : value.tag;
				if (!tag) return;
				count++;
				const option = el(doc, 'button');
				option.type = 'button';
				option.textContent = tag;
				option.addEventListener('click', function () {
					overlay.remove();
					onSelect(entry.type, tag);
				});
				column.appendChild(option);
			});
			columns.appendChild(column);
		});
		if (!count) {
			const empty = el(doc, 'p');
			empty.textContent = I18n.t('MVZ_SHORTLIST_EMPTY');
			dialog.appendChild(empty);
		} else {
			dialog.appendChild(columns);
		}
		const help = el(doc, 'p');
		help.textContent = I18n.t('MVZ_SHORTLIST_EDIT_PREFS');
		dialog.appendChild(help);
		overlay.appendChild(dialog);
		overlay.addEventListener('click', function (event) {
			if (event.target === overlay) overlay.remove();
		});
		doc.documentElement.appendChild(overlay);
	}

	function variantsFor(state, field, creatorIndex) {
		return state.variants.filter(function (v) {
			if (creatorIndex !== undefined && creatorIndex !== null) return v.creatorIndex === creatorIndex;
			return v.field === field;
		}).sort(function (a, b) {
			return (a.variantIndex || 0) - (b.variantIndex || 0);
		});
	}

	// -----------------------------------------------------------------
	// Ordered list of fields for an item (Appendix 2,
	// "same order as Zotero shows them in the main item pane").
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
				if (fieldName && fieldName !== 'extra') add({ kind: 'field', name: fieldName });
			});
		}
		orderedFieldsForItem(item).forEach(function (name) { add({ kind: 'field', name: name }); });
		for (let index = 0; index < creatorCount; index++) add({ kind: 'creator', index: index });
		return entries;
	}

	// -----------------------------------------------------------------
	// Rendering
	// -----------------------------------------------------------------

	function clear(container) {
		container.textContent = '';
	}

	function renderVariantRow(doc, container, options) {
		// options: { labelText, baseValueText, baseValueBlank, variants,
		//   onLabelContextMenu, onBaseValueEdit, onEditVariant(variant, newValue),
		//   onDeleteVariant(variant), onChangeVariantTag(variant) }
		const group = el(doc, 'div');
		group.className = 'mvz-field-group' + (options.baseValueBlank ? ' mvz-blank' : '');

		function row(labelText, valueText, buttons, rowOptions) {
			const r = el(doc, 'div');
			r.className = 'mvz-row';

			const label = el(doc, 'span');
			label.className = 'mvz-row-label';
			label.textContent = labelText || '';
			if (rowOptions && rowOptions.onLabelContextMenu) {
				label.addEventListener('contextmenu', function (event) {
					event.preventDefault();
					event.stopPropagation();
					rowOptions.onLabelContextMenu(event);
				});
			}
			if (rowOptions && rowOptions.onLabelClick) label.addEventListener('click', rowOptions.onLabelClick);
			r.appendChild(label);

			if (rowOptions && rowOptions.creatorData) {
				const data = rowOptions.creatorData;
				const nameParts = rowOptions.variantValue !== undefined
					? String(rowOptions.variantValue).split('||').map(function (part) { return part.trim(); })
					: [data.lastName || '', data.firstName || ''];
				const values = el(doc, 'span');
				values.className = 'mvz-creator-values';
				function createNameInput(valueText, placeholder, callback) {
					const input = el(doc, 'input');
					input.type = 'text';
					input.className = 'mvz-row-value';
					input.placeholder = I18n.t(placeholder);
					input.value = valueText || '';
					input.readOnly = !callback;
					if (callback) input.addEventListener('input', callback);
					values.appendChild(input);
					return input;
				}
				if (data.fieldMode === 1) {
					createNameInput(rowOptions.variantValue !== undefined ? rowOptions.variantValue : data.name, 'MVZ_CREATOR_FULL_NAME_PROMPT', function (event) {
						rowOptions.onValueEdit(event.target.value);
					});
				} else {
					const lastName = createNameInput(nameParts[0], 'MVZ_CREATOR_LAST_NAME_PROMPT', function () {
						const first = values.querySelectorAll('input')[1];
						rowOptions.onValueEdit(lastName.value + ' || ' + first.value);
					});
					const firstName = createNameInput(nameParts[1], 'MVZ_CREATOR_FIRST_NAME_PROMPT', function () {
						rowOptions.onValueEdit(lastName.value + ' || ' + firstName.value);
					});
				}
				r.appendChild(values);
			} else {
				const value = el(doc, 'input');
				value.type = 'text';
				value.className = 'mvz-row-value';
				value.value = valueText || '';
				value.readOnly = !(rowOptions && rowOptions.onValueEdit);
				if (rowOptions && rowOptions.onValueEdit) {
					value.addEventListener('input', function () { rowOptions.onValueEdit(value.value); });
				}
				if (rowOptions && rowOptions.onValueClick) value.addEventListener('click', rowOptions.onValueClick);
				r.appendChild(value);
			}

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
		row(options.labelText, options.baseValueText, options.buttons || [], {
			onLabelContextMenu: options.onLabelContextMenu,
			onLabelClick: options.onLabelClick,
			onValueEdit: options.onBaseValueEdit,
			onValueClick: options.onBaseValueClick,
			creatorData: options.creatorData
		});

		if (first) renderVariantLine(doc, group, first, options);
		options.variants.slice(1).forEach(function (v) { renderVariantLine(doc, group, v, options); });

		container.appendChild(group);
		return group;
	}

	function renderVariantLine(doc, group, variant, options) {
		const r = el(doc, 'div');
		r.className = 'mvz-row mvz-variant-row';

		const typeLabel = el(doc, 'span');
		typeLabel.className = 'mvz-row-label mvz-type-indicator';
		typeLabel.textContent = variant.type.toUpperCase();
		r.appendChild(typeLabel);

		const tag = el(doc, 'span');
		tag.className = 'mvz-row-tag mvz-clickable';
		tag.textContent = variant.tag;
		tag.addEventListener('click', function () { options.onChangeVariantTag(variant); });
		r.appendChild(tag);

		if (options.creatorData) {
			const values = el(doc, 'span');
			values.className = 'mvz-creator-values';
			const parts = String(variant.value || '').split('||').map(function (part) { return part.trim(); });
			function addCreatorInput(valueText, placeholder, onInput) {
				const input = el(doc, 'input');
				input.type = 'text';
				input.className = 'mvz-row-value mvz-variant-value' + (valueText ? '' : ' mvz-empty-variant');
				input.placeholder = I18n.t(placeholder);
				input.value = valueText || '';
				input.addEventListener('input', onInput);
				values.appendChild(input);
				return input;
			}
			if (options.creatorData.fieldMode === 1) {
				addCreatorInput(variant.value, 'MVZ_CREATOR_FULL_NAME_PROMPT', function (event) {
					options.onEditVariant(variant, event.target.value);
				});
			} else {
				let lastName;
				let firstName;
				lastName = addCreatorInput(parts[0], 'MVZ_CREATOR_LAST_NAME_PROMPT', function () {
					options.onEditVariant(variant, lastName.value + ' || ' + firstName.value);
				});
				firstName = addCreatorInput(parts[1], 'MVZ_CREATOR_FIRST_NAME_PROMPT', function () {
					options.onEditVariant(variant, lastName.value + ' || ' + firstName.value);
				});
			}
			r.appendChild(values);
		} else {
			const value = el(doc, 'input');
			value.type = 'text';
			value.className = 'mvz-row-value mvz-variant-value' + (variant.value ? '' : ' mvz-empty-variant');
			value.value = variant.value;
			value.addEventListener('input', function () { options.onEditVariant(variant, value.value); });
			r.appendChild(value);
		}

		const del = el(doc, 'button');
		del.className = 'mvz-row-delete';
		del.textContent = '-';
		del.title = I18n.t('MVZ_DELETE_VARIANT_TOOLTIP');
		del.addEventListener('click', function () {
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
		const creatorData = item.getCreators();

		function persist() {
			debouncedSave(item, state);
		}

		function saveItem() {
			item.saveTx().catch(function (e) {
				Zotero.logError(e);
				Zotero.alert(null, I18n.t('MVZ_SAVE_ERROR_TITLE'), I18n.t('MVZ_SAVE_ERROR_BODY', { error_message: String(e) }));
			});
		}

		function scriptOfTag(tag) {
			const parsed = Zotero.MVZ.BCP47.parseTag(tag);
			if (parsed.script) return parsed.script;
			const first = String(tag).split('-')[0];
			return Zotero.MVZ.BCP47.isValidScript(first) ? Zotero.MVZ.BCP47.formatScript(first) : null;
		}

		function applyVariant(type, field, creatorIndex, tag, editingVariant) {
			if (!languageClean) {
				Zotero.alert(null, I18n.t('MVZ_LANGUAGE_NOT_CLEAN_TITLE'), I18n.t('MVZ_LANGUAGE_NOT_CLEAN_BODY'));
				return;
			}
			const itemLanguages = (item.getField('language') || '').split(',').map(function (s) { return s.trim(); }).filter(Core.isValidItemLanguageTag);
			const parsedTag = Zotero.MVZ.BCP47.parseTag(tag);

			// "The UI must prevent adding an L-type variant for any language
			// tag already listed in the item's Language field, or an S-type
			// variant for any script tag matching the explicit or implied
			// script of those item languages."
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
				Zotero.alert(null, '', I18n.t('MVZ_DUPLICATE_VARIANT', {
					field_name: field || 'creator',
					language_tag: tag
				}));
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

		function chooseVariant(field, creatorIndex, editingVariant) {
			if (!Core.isLanguageFieldClean(item.getField('language') || '')) {
				Zotero.alert(null, I18n.t('MVZ_LANGUAGE_NOT_CLEAN_TITLE'), I18n.t('MVZ_LANGUAGE_NOT_CLEAN_BODY'));
				return;
			}
			openVariantShortlist(doc, function (type, tag) {
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

		function changeVariantTag(variant) {
			chooseVariant(variant.field, variant.creatorIndex, variant);
		}

		function editCreator(index, value) {
			const creator = Object.assign({}, item.getCreators()[index]);
			if (!creator) return;
			if (creator.fieldMode === 1) {
				creator.name = value;
			} else {
				const parts = value.split('||');
				creator.lastName = (parts[0] || '').trim();
				creator.firstName = (parts[1] || '').trim();
			}
			item.setCreator(index, creator);
			saveItem();
		}

		function openCreatorTypeMenu(index) {
			let types;
			try {
				const itemTypeID = Zotero.ItemTypes.getID(item.itemType);
				if (!Zotero.CreatorTypes || typeof Zotero.CreatorTypes.getTypesForItemType !== 'function') return;
				types = Zotero.CreatorTypes.getTypesForItemType(itemTypeID);
			} catch (e) {
				Zotero.logError(e);
				return;
			}
			if (!Array.isArray(types)) return;
			const menu = popupShell(doc, 'MVZ_CREATOR_TYPE_MENU_TITLE');
			menu.overlay.addEventListener('click', function (event) {
				if (event.target === menu.overlay) menu.close();
			});
			types.forEach(function (entry) {
				let typeID = typeof entry === 'number' ? entry : entry && (entry.creatorTypeID || entry.id);
				if (typeID === undefined && typeof entry === 'string' && typeof Zotero.CreatorTypes.getID === 'function') {
					typeID = Zotero.CreatorTypes.getID(entry);
				}
				if (typeID === undefined || typeID === null) return;
				const option = el(doc, 'button');
				option.type = 'button';
				option.textContent = I18n.resolveCreatorType(typeID);
				option.addEventListener('click', function () {
					const next = Object.assign({}, item.getCreators()[index]);
					next.creatorTypeID = typeID;
					item.setCreator(index, next);
					saveItem();
					menu.close();
					render(body, item);
				});
				menu.content.appendChild(option);
			});
		}

		function capitalizeName(value) {
			return String(value || '').replace(/(^|\s)([^\s])/g, function (match, space, letter) {
				return space + letter.toLocaleUpperCase();
			});
		}

		function openCreatorContextMenu(index) {
			const current = item.getCreators()[index];
			const single = current.fieldMode === 1;
			const menu = popupShell(doc, 'MVZ_CREATOR_CONTEXT_MENU_TITLE');
			menu.overlay.addEventListener('click', function (event) {
				if (event.target === menu.overlay) menu.close();
			});
			const fix = el(doc, 'button');
			fix.type = 'button';
			fix.textContent = I18n.t('MVZ_CREATOR_FIX_CASE');
			const names = single ? [current.name] : [current.firstName, current.lastName];
			fix.disabled = names.every(function (name) { return !name || capitalizeName(name) === name; });
			fix.addEventListener('click', function () {
				const next = Object.assign({}, current);
				if (single) next.name = capitalizeName(next.name);
				else {
					next.firstName = capitalizeName(next.firstName);
					next.lastName = capitalizeName(next.lastName);
				}
				item.setCreator(index, next);
				saveItem();
				menu.close();
				render(body, item);
			});
			menu.content.appendChild(fix);
			if (!single) {
				const swap = el(doc, 'button');
				swap.type = 'button';
				swap.textContent = I18n.t('MVZ_CREATOR_SWAP_NAMES');
				swap.addEventListener('click', function () {
					const next = Object.assign({}, current);
					const last = next.lastName;
					next.lastName = next.firstName;
					next.firstName = last;
					item.setCreator(index, next);
					saveItem();
					menu.close();
					render(body, item);
				});
				menu.content.appendChild(swap);
			}
		}

		function creatorButtons(index, creator) {
			const single = creator.fieldMode === 1;
			return [
				{ text: single ? 'Ⅱ' : '▭', title: I18n.t(single ? 'MVZ_CREATOR_SWITCH_TWO' : 'MVZ_CREATOR_SWITCH_SINGLE'), onClick: function () {
					const next = Object.assign({}, item.getCreators()[index]);
					const relatedVariants = variantsFor(state, null, index);
					if (next.fieldMode === 1) {
						const words = (next.name || '').trim().split(/\s+/).filter(Boolean);
						next.lastName = words.pop() || '';
						next.firstName = words.join(' ');
						next.name = '';
						next.fieldMode = 0;
						relatedVariants.forEach(function (variant) {
							const raw = String(variant.value || '').trim();
							const parts = raw.includes('||')
								? raw.split('||').map(function (part) { return part.trim(); })
								: (function () {
									const words = raw.split(/\s+/).filter(Boolean);
									const lastName = words.pop() || '';
									return [lastName, words.join(' ')];
								})();
							variant.value = (parts[0] || '') + ' || ' + (parts[1] || '');
						});
					} else {
						next.name = [next.firstName, next.lastName].filter(Boolean).join(' ');
						next.firstName = '';
						next.lastName = '';
						next.fieldMode = 1;
						relatedVariants.forEach(function (variant) {
							const parts = String(variant.value || '').split('||').map(function (part) { return part.trim(); });
							variant.value = [parts[1] || '', parts[0] || ''].filter(Boolean).join(' ');
						});
					}
					item.setCreator(index, next);
					persist();
					saveItem();
					render(body, item);
				}},
				{ text: '⊖', title: I18n.t('MVZ_CREATOR_DELETE'), disabled: !(creator.firstName || creator.lastName || creator.name), onClick: function () {
					const list = item.getCreators();
					if (list.length === 1) {
						list[0].firstName = '';
						list[0].lastName = '';
						list[0].name = '';
						list[0].fieldMode = 0;
						state.variants = state.variants.filter(function (variant) { return variant.creatorIndex !== index; });
					} else {
						list.splice(index, 1);
						state.variants = state.variants.filter(function (variant) { return variant.creatorIndex !== index; });
						state.variants.forEach(function (variant) {
							if (variant.creatorIndex > index) variant.creatorIndex -= 1;
						});
					}
					persist();
					item.setCreators(list);
					saveItem();
					render(body, item);
				}},
				{ text: '⊕', title: I18n.t('MVZ_CREATOR_CREATE'), disabled: !(creator.firstName || creator.lastName || creator.name), onClick: function () {
					const list = item.getCreators();
					list.splice(index + 1, 0, { firstName: '', lastName: '', fieldMode: 0, creatorTypeID: creator.creatorTypeID });
					state.variants.forEach(function (variant) {
						if (variant.creatorIndex >= index + 1) variant.creatorIndex += 1;
					});
					persist();
					item.setCreators(list);
					saveItem();
					render(body, item);
				}},
				{ text: '…', title: I18n.t('MVZ_CREATOR_CONTEXT_MENU_TOOLTIP'), onClick: function () { openCreatorContextMenu(index); } }
			];
		}

		// --- Regular fields --------------------------------------------
		function renderField(fieldName) {
			const baseValue = String(item.getField(fieldName) || '');
			renderVariantRow(doc, body, {
				labelText: I18n.resolveField(fieldName),
				baseValueText: baseValue,
				baseValueBlank: !baseValue,
				variants: variantsFor(state, fieldName),
				onLabelContextMenu: function () {
					if (!Core.isVariantField(fieldName)) {
						Zotero.alert(null, '', I18n.t('MVZ_VARIANTS_UNAVAILABLE', { field_name: I18n.resolveField(fieldName) }));
						return;
					}
					chooseVariant(fieldName, null, null);
				},
				onBaseValueEdit: fieldName === 'language' ? null : Core.debounce(function (value) {
					item.setField(fieldName, value);
					saveItem();
				}, 300),
				onBaseValueClick: fieldName === 'language' ? function () { onLanguageFieldFocus(doc.defaultView); } : null,
				onEditVariant: editVariant,
				onDeleteVariant: deleteVariant,
				onChangeVariantTag: changeVariantTag
			});
		}

		// --- Creators -----------------------------------------------------
		function renderCreator(index) {
			const creator = creatorData[index];
			const baseValue = creator.fieldMode === 1
				? (creator.name || '')
				: [creator.lastName, creator.firstName].filter(Boolean).join(', ');
			let creatorTypeLabel = String(creator.creatorTypeID);
			try { creatorTypeLabel = I18n.resolveCreatorType(creator.creatorTypeID); } catch (e) { Zotero.logError(e); }
			renderVariantRow(doc, body, {
				labelText: creatorTypeLabel + ' ▼',
				baseValueText: baseValue,
				baseValueBlank: !baseValue,
				buttons: creatorButtons(index, creator),
				creatorData: creator,
				variants: variantsFor(state, null, index),
				onLabelClick: function () { openCreatorTypeMenu(index); },
				onLabelContextMenu: function () { chooseVariant(null, index, null); },
				onBaseValueEdit: Core.debounce(function (value) { editCreator(index, value); }, 300),
				onEditVariant: editVariant,
				onDeleteVariant: deleteVariant,
				onChangeVariantTag: changeVariantTag
			});
		}

		renderVariantRow(doc, body, {
			labelText: I18n.t('MVZ_ITEM_TYPE_LABEL'),
			baseValueText: I18n.resolveItemType(item.itemType),
			baseValueBlank: false,
			variants: [],
			onBaseValueEdit: null,
			onLabelContextMenu: function () { Zotero.alert(null, '', I18n.t('MVZ_VARIANTS_UNAVAILABLE', { field_name: I18n.t('MVZ_ITEM_TYPE_LABEL') })); }
		});
		orderedInfoEntries(item, doc, creatorData.length).forEach(function (entry) {
			if (entry.kind === 'field') renderField(entry.name);
			else renderCreator(entry.index);
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
		const control = doc.querySelector('editable-text[fieldname="' + fieldName + '"]');
		return control ? control.closest('.meta-row') : null;
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
				onExtraFieldBlur(mainWindow, ev.target);
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

	const _extraWarningOpen = new Set();
	const _languagePopupOpen = new Set();

	function popupShell(doc, titleToken) {
		const overlay = el(doc, 'div');
		overlay.className = 'mvz-modal-overlay';
		const dialog = el(doc, 'div');
		dialog.className = 'mvz-modal-dialog';
		const title = el(doc, 'h3');
		title.textContent = I18n.t(titleToken);
		const content = el(doc, 'div');
		dialog.appendChild(title);
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
			item.setField('language', tags.join(', '));
			item.saveTx().catch(function (e) { Zotero.logError(e); });
			popup.close();
			onClose();
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
		registerCreatorListener: registerCreatorListener,
		unregisterCreatorListener: unregisterCreatorListener,
		installFieldPopups: installFieldPopups,
		render: render
	};
})();

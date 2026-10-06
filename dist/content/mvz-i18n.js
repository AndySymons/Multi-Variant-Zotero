/*
 * MVZ Plugin - internationalisation engine
 *
 * Implements SPECIFICATION_MVZ1_PLUGIN.md > "Internationalisation (I18n)" >
 * "Nested token resolution": every MVZ_ token is a key into the MVZ locale
 * file (mvz.ftl); its value is a *message template* containing named
 * parameters; parameters that reference database elements (item types,
 * field names, creator types) are resolved exclusively through Zotero's own
 * native locale API (never hard-coded or duplicated in mvz.ftl - see
 * "Locale file precedence").
 *
 * IMPLEMENTATION NOTE on placeholder syntax
 * ------------------------------------------
 * The specification's prose denotes parameters with double curly braces,
 * e.g. {{field-field_name}}. That notation is a *documentation* convention
 * for describing each token's parameter contract (name + type); it is not
 * itself valid Fluent syntax (a real .ftl file uses single-brace variable
 * references, e.g. { $field_name }), and round-tripping literal "{{" / "}}"
 * text through a real Fluent engine would require escaping every brace
 * (Fluent would otherwise parse "{{" as nested placeables and fail to
 * resolve). To keep mvz.ftl both genuinely valid Fluent *and* faithful to
 * the documented parameter contracts, MVZ stores each token's parameter
 * list in PARAM_TYPES below (name -> type: 'literal' | 'index' | 'item' |
 * 'field' | 'creator') and writes the actual template text using Fluent's
 * native "{ $name }" variable syntax. At resolution time this module:
 *   1. Looks up the declared type for each supplied parameter name.
 *   2. For 'literal' / 'index' parameters, passes the value straight
 *      through as a Fluent variable.
 *   3. For 'item' / 'field' / 'creator' parameters, resolves the database
 *      element name to its localized display name via Zotero's native
 *      API *before* passing it to Fluent as a variable - the Zotero
 *      element name itself is never stored or duplicated in mvz.ftl.
 */

/* global Zotero, ChromeUtils */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.I18n = (function () {
	'use strict';

	// Parameter contracts per token: { paramName: 'literal'|'index'|'item'|'field'|'creator' }
	const PARAM_TYPES = {
		MVZ_DUPLICATE_VARIANT: { field_name: 'field', language_tag: 'literal' },
		MVZ_BASE_FIELD: { base_field_name: 'field' },
		MVZ_VARIANT: { language_tag: 'literal' },
		MVZ_VARIANTS_UNAVAILABLE: { field_name: 'literal' },
		MVZ_CREATOR_FIELD_LABEL: { this_creator_index: 'index' },
		MVZ_FIELD_BLANK_TOOLTIP: { field_name: 'field' },
		MVZ_CREATOR_SYNC_ERROR_BODY: { error_message: 'literal' },
		MVZ_SAVE_ERROR_BODY: { error_message: 'literal' },
		MVZ_LANGUAGE_UNRECOGNIZED_ANOMALY: { token: 'literal' },
		MVZ_LANGUAGE_NORMALIZED_ANOMALY: { token: 'literal' },
		MVZ_LANGUAGE_ALREADY_IN_ITEM: { language_tag: 'literal' },
		MVZ_SCRIPT_ALREADY_IN_ITEM: { script_tag: 'literal' },
		MVZ_CITEPROC_HOOK_UNAVAILABLE_BODY: {}
	};

	let _l10n = null;

	function init() {
		if (_l10n) return _l10n;
		try {
			const { Localization } = ChromeUtils.importESModule('resource://gre/modules/Localization.sys.mjs');
			_l10n = new Localization(['mvz.ftl'], true);
		} catch (e) {
			Zotero.logError(e);
			_l10n = null;
		}
		return _l10n;
	}

	let _fallbackMessages = null;

	function fallbackMessages() {
		if (_fallbackMessages) return _fallbackMessages;
		_fallbackMessages = {};
		const locale = Zotero.locale || 'en-GB';
		const candidates = [locale, 'en-GB'];
		candidates.forEach(function (candidate) {
			try {
				const text = Zotero.File.getContentsFromURL('chrome://mvz/locale/' + candidate + '/mvz.ftl');
				String(text || '').split(/\r?\n/).forEach(function (line) {
					const match = /^([A-Z][A-Z0-9_-]*)\s*=\s*(.*)$/.exec(line);
					if (match && !_fallbackMessages[match[1]]) _fallbackMessages[match[1]] = match[2];
				});
			} catch (e) {}
		});
		return _fallbackMessages;
	}

	function fallbackValue(token, args) {
		const template = fallbackMessages()[token];
		if (!template) return token;
		return template.replace(/\{\s*\$([A-Za-z0-9_]+)\s*\}/g, function (match, name) {
			return Object.prototype.hasOwnProperty.call(args, name) ? String(args[name]) : match;
		});
	}

	// --- Database-element resolution (Locale file precedence) --------------

	function resolveField(fieldName) {
		try {
			return Zotero.ItemFields.getLocalizedString(fieldName);
		} catch (e) {
			try {
				return Zotero.ItemFields.getLocalizedString(null, fieldName);
			} catch (e2) {
				return fieldName;
			}
		}
	}

	function resolveItemType(itemType) {
		try {
			return Zotero.ItemTypes.getLocalizedString(itemType);
		} catch (e) {
			return itemType;
		}
	}

	function resolveCreatorType(creatorType) {
		try {
			return Zotero.CreatorTypes.getLocalizedString(creatorType);
		} catch (e) {
			return creatorType;
		}
	}

	function resolveParam(type, value) {
		switch (type) {
			case 'field': return resolveField(value);
			case 'item': return resolveItemType(value);
			case 'creator': return resolveCreatorType(value);
			case 'literal':
			case 'index':
			default:
				return value;
		}
	}

	/**
	 * @param {string} token An MVZ_ token (Fluent message id).
	 * @param {Object<string, *>} [rawParams] Keyed by parameter *name* (not
	 *   the type-prefixed placeholder form used in the specification prose).
	 * @returns {string}
	 */
	function t(token, rawParams) {
		const l10n = init();
		const declared = PARAM_TYPES[token] || {};
		const args = {};
		if (rawParams) {
			Object.keys(rawParams).forEach(function (name) {
				const type = declared[name] || 'literal';
				args[name] = resolveParam(type, rawParams[name]);
			});
		}

		if (!l10n) return fallbackValue(token, args); // Defensive fallback - never throw into the UI.

		try {
			const value = l10n.formatValueSync(token, args);
			return value === null || value === undefined || value === token ? fallbackValue(token, args) : value;
		} catch (e) {
			Zotero.logError(e);
			return fallbackValue(token, args);
		}
	}

	return { init: init, t: t, resolveField: resolveField, resolveItemType: resolveItemType, resolveCreatorType: resolveCreatorType };
})();

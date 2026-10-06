/*
 * MVZ Plugin - Citation engine (back end)
 * (SPECIFICATION_MVZ1_PLUGIN.md > "Backend - the Citation engine")
 *
 * KNOWN FRAGILE INTEGRATION POINT: the specification names the hook point
 * as "Zotero.Cite.getItemData". That exact symbol could not be verified
 * against a live Zotero 10 install from this workspace. Zotero's
 * documented/observed CSL-JSON conversion entry point is
 * `Zotero.Utilities.itemToCSLJSON()`, which `installHook()` below also
 * wraps defensively. Per spec ("the plugin MUST check that the function
 * exists with the expected form. If not, the citation feature is disabled
 * with a visible warning"), if NEITHER symbol is found in the expected
 * form, MVZ disables this feature and warns once, while the MVZ pane keeps
 * working. The developer should confirm the correct hook point against a
 * live install and report back if neither of these matches.
 */

/* global Zotero */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.Citeproc = (function () {
	'use strict';

	const Core = Zotero.MVZ.Core;
	const BCP47 = Zotero.MVZ.BCP47;
	const I18n = Zotero.MVZ.I18n;

	let _installed = false;

	// -----------------------------------------------------------------
	// Template mini-engine (Transliteration and translation style
	// settings > "Template syntax")
	// -----------------------------------------------------------------

	const ALLOWED_TAGS_RE = /^<\/?(i|b)>$/i;

	/** Strip every HTML tag except <i>, </i>, <b>, </b> (custom templates only). */
	function sanitizeTemplate(template) {
		return template.replace(/<[^>]*>/g, function (tag) {
			return ALLOWED_TAGS_RE.test(tag) ? tag : '';
		});
	}

	function substitutePlaceholders(text, values) {
		return text.replace(/\{(original|transliteration|translation)\}/g, function (m, name) {
			return values[name] || '';
		});
	}

	/**
	 * Renders a style template. `[...]` groups are dropped entirely if the
	 * *first* {placeholder} found within them is blank; otherwise their
	 * raw content (including any further literal, non-reprocessed `[`/`]`
	 * characters - see the specification's own `[ [{Translation}]]`
	 * example) is kept, with placeholders substituted.
	 */
	function renderTemplate(template, values) {
		let i = 0;
		let out = '';
		while (i < template.length) {
			const ch = template[i];
			if (ch === '[') {
				let depth = 1;
				let j = i + 1;
				while (j < template.length && depth > 0) {
					if (template[j] === '[') depth++;
					else if (template[j] === ']') depth--;
					j++;
				}
				const inner = template.slice(i + 1, j - 1);
				const firstParam = /\{(original|transliteration|translation)\}/.exec(inner);
				const controllingBlank = firstParam ? !values[firstParam[1]] : false;
				out += controllingBlank ? '' : substitutePlaceholders(inner, values);
				i = j;
			} else if (ch === '{') {
				const close = template.indexOf('}', i);
				if (close === -1) { out += ch; i++; continue; }
				const name = template.slice(i + 1, close);
				out += (values[name] || '');
				i = close + 1;
			} else {
				out += ch;
				i++;
			}
		}
		return out;
	}

	// Built-in style templates ("Examples of rendering based on these options").
	const BUILTIN_STYLES = {
		apa: {
			standalone: '<i>{transliteration}</i>[ [{translation}]]',
			contained: '{transliteration}[ [{translation}]]'
		},
		cmos: {
			standalone: '<i>{transliteration}</i>[ {original}][ [{translation}]]',
			contained: '"{transliteration}"[ {original}][ [{translation}]]'
		},
		mla: {
			standalone: '[{original};][ <i>{transliteration}</i>][ [<i>{translation}</i>]]',
			contained: '[{original};] “{transliteration}”[ [“{translation}”]]'
		},
		mhra: {
			standalone: '<i>{transliteration}</i>[ {original}][ [{translation}]]',
			contained: "'{transliteration}'[ {original}][ ['{translation}']]"
		}
	};

	function getStyleTemplates() {
		const style = Core.getPref('targetDocument.style', 'apa');
		if (style === 'custom') {
			return {
				standalone: sanitizeTemplate(Core.getPref('targetDocument.customTemplateStandalone', '') || BUILTIN_STYLES.apa.standalone),
				contained: sanitizeTemplate(Core.getPref('targetDocument.customTemplateContained', '') || BUILTIN_STYLES.apa.contained)
			};
		}
		return BUILTIN_STYLES[style] || BUILTIN_STYLES.apa;
	}

	// -----------------------------------------------------------------
	// Preliminary item-level checks (Citation resolution > 1.)
	// -----------------------------------------------------------------

	function parseTargetDocument() {
		const raw = Core.getTargetDocumentLanguage();
		const parsed = BCP47.parseTag(raw);
		if (!parsed.valid) return { language: 'en', script: 'latn', region: null };
		const script = parsed.script || (BCP47.defaultScriptForLanguage(parsed.language) || '').toLowerCase();
		return { language: parsed.language, script: script, region: parsed.region };
	}

	function itemLanguageTags(item) {
		const raw = item.getField('language') || '';
		return raw.split(',').map(function (s) { return s.trim(); }).filter(Core.isValidItemLanguageTag).map(function (t) { return BCP47.parseTag(t); });
	}

	function preliminaryChecks(item, target) {
		const langs = itemLanguageTags(item);
		if (!langs.length) {
			return { translationRequired: false, transliterationRequired: false, langs: langs };
		}
		const translationRequired = !langs.some(function (l) { return l.language === target.language; });
		const transliterationRequired = !langs.some(function (l) {
			const script = l.script || BCP47.defaultScriptForLanguage(l.language);
			return script && script.toLowerCase() === target.script;
		});
		return { translationRequired: translationRequired, transliterationRequired: transliterationRequired, langs: langs };
	}

	// -----------------------------------------------------------------
	// Variant lookup (Citation resolution > 2. and > 3.)
	// -----------------------------------------------------------------

	function tagParts(variant) {
		let p = BCP47.parseTag(variant.tag);
		if (!p.valid) {
			const first = String(variant.tag).split('-')[0];
			if (BCP47.isValidScript(first)) p = BCP47.parseTag('und-' + variant.tag);
		}
		return { language: p.language || 'und', script: p.script };
	}

	/** 2.1 / 3.2 - find the best S-type (transliteration) match. */
	function findTransliteration(candidates, langs, targetScript) {
		const itemLangCodes = langs.map(function (l) { return l.language; });
		let match = candidates.find(function (v) {
			const p = tagParts(v);
			return p.script === targetScript && itemLangCodes.indexOf(p.language) !== -1;
		});
		if (match) return match;
		match = candidates.find(function (v) {
			const p = tagParts(v);
			return p.script === targetScript && p.language === 'und';
		});
		return match || null;
	}

	/** 2.2 / 3.3 - find the best L-type (translation) match. */
	function findTranslation(candidates, targetLang, targetRegion) {
		const sameLang = candidates.filter(function (v) { return tagParts(v).language === targetLang; });
		if (!sameLang.length) return null;
		function byRegion(region) {
			return sameLang.find(function (v) { return BCP47.parseTag(v.tag).region === region; });
		}
		if (targetRegion) {
			return byRegion(targetRegion)
				|| sameLang.find(function (v) { return !BCP47.parseTag(v.tag).region; })
				|| sameLang[0];
		}
		return sameLang.find(function (v) { return !BCP47.parseTag(v.tag).region; }) || sameLang[0];
	}

	// -----------------------------------------------------------------
	// Regular field resolution (2.1, 2.2, 2.3)
	// -----------------------------------------------------------------

	function resolveRegularField(item, fieldName, variants, prelim, target, matrix) {
		const originalValue = item.getField(fieldName) || '';
		if (!originalValue) return null;

		const rowKey = Core.rowKeyForField(fieldName);
		const prefs = (matrix && matrix[rowKey]) || { original: true, transliteration: false, translation: false };

		const sCandidates = variants.filter(function (v) { return v.type === 's' && v.field === fieldName; });
		const lCandidates = variants.filter(function (v) { return v.type === 'l' && v.field === fieldName; });

		let translitValue = null;
		if (prelim.transliterationRequired && prefs.transliteration) {
			const m = findTransliteration(sCandidates, prelim.langs, target.script);
			translitValue = m ? m.value : null;
		}

		let translationValue = null;
		if (prelim.translationRequired && prefs.translation) {
			const m = findTranslation(lCandidates, target.language, target.region);
			translationValue = m ? m.value : null;
		}

		// Assembly (2.3) - see "General rules": if the leading {transliteration}
		// slot has nothing to show (not required, not ticked, or not found),
		// the original fills that slot instead, and the dedicated {original}
		// slot is left blank to avoid duplicating it.
		let transliterationSlot, originalSlot;
		if (translitValue) {
			transliterationSlot = translitValue;
			originalSlot = prefs.original && Core.getPref('targetDocument.includeOriginal', true) ? originalValue : '';
		} else {
			transliterationSlot = originalValue;
			originalSlot = '';
		}

		const templates = getStyleTemplates();
		const isStandalone = !Core.isContainedItemType(item.itemType);
		const template = isStandalone ? templates.standalone : templates.contained;

		return renderTemplate(template, {
			original: originalSlot,
			transliteration: transliterationSlot,
			translation: translationValue || ''
		});
	}

	// -----------------------------------------------------------------
	// Creator resolution (3.1, 3.2, 3.3)
	// -----------------------------------------------------------------

	function splitCreatorValue(value, fieldMode) {
		if (fieldMode === 1) return { literal: value };
		const parts = value.split('||').map(function (s) { return s.trim(); });
		return { family: parts[0] || '', given: parts[1] || '' };
	}

	function originalCreatorJSON(creator) {
		if (creator.fieldMode === 1) return { literal: creator.name || creator.lastName };
		return { family: creator.lastName || '', given: creator.firstName || '' };
	}

	function resolveCreator(creator, index, variants, prelim, target, matrix) {
		const prefs = (matrix && matrix.creator) || { original: false, transliteration: true, translation: false };
		const sCandidates = variants.filter(function (v) { return v.type === 's' && v.creatorIndex === index; });
		const lCandidates = variants.filter(function (v) { return v.type === 'l' && v.creatorIndex === index; });

		if (prefs.transliteration) {
			const s = prelim.transliterationRequired ? findTransliteration(sCandidates, prelim.langs, target.script) : null;
			if (s) return splitCreatorValue(s.value, creator.fieldMode);
			const l = prelim.translationRequired ? findTranslation(lCandidates, target.language, target.region) : null;
			if (l) return splitCreatorValue(l.value, creator.fieldMode);
			return originalCreatorJSON(creator);
		}

		if (prefs.translation) {
			const l = prelim.translationRequired ? findTranslation(lCandidates, target.language, target.region) : null;
			if (l) return splitCreatorValue(l.value, creator.fieldMode);
			const s = prelim.transliterationRequired ? findTransliteration(sCandidates, prelim.langs, target.script) : null;
			if (s) return splitCreatorValue(s.value, creator.fieldMode);
			return originalCreatorJSON(creator);
		}

		return originalCreatorJSON(creator);
	}

	// -----------------------------------------------------------------
	// Top-level entry point
	// -----------------------------------------------------------------

	/**
	 * Mutates (and returns) a CSL-JSON object for `item`, filling in
	 * assembled original/transliteration/translation values per the MVZ
	 * preferences.
	 */
	function annotate(item, cslData) {
		try {
			const target = parseTargetDocument();
			const prelim = preliminaryChecks(item, target);
			const extra = Core.parseExtra(item.getField('extra') || '');
			const matrix = Core.getFieldInclusionMatrix();

			if (prelim.langs.length) {
				Core.VARIANT_FIELDS.forEach(function (fieldName) {
					if (!(fieldName in cslData) && !item.getField(fieldName)) return;
					const assembled = resolveRegularField(item, fieldName, extra.variants, prelim, target, matrix);
					if (assembled !== null) cslData[fieldName] = assembled;
				});

				const creators = item.getCreators();
				// CSL-JSON keys creators by creator-type role (author, editor,
				// translator, ...); rebuild whichever role arrays are present
				// using the same per-creator-index resolution.
				if (creators.length) {
					Object.keys(cslData).forEach(function (key) {
						if (!Array.isArray(cslData[key])) return;
						const used = new Set();
					cslData[key] = cslData[key].map(function (entry) {
							const creatorIndex = creators.findIndex(function (c, i) {
								const original = originalCreatorJSON(c);
								return !used.has(i) && (original.family === entry.family || original.literal === entry.literal);
							});
							if (creatorIndex === -1) return entry;
							used.add(creatorIndex);
							return Object.assign({}, entry, resolveCreator(creators[creatorIndex], creatorIndex, extra.variants, prelim, target, matrix));
						});
					});
				}
			}
		} catch (e) {
			Zotero.logError(e);
		}
		return cslData;
	}

	// -----------------------------------------------------------------
	// Hook installation (Backend > citeproc-js Runtime Interception)
	// -----------------------------------------------------------------

	function wrapGetItemData() {
		if (Zotero.Cite && typeof Zotero.Cite.getItemData === 'function') {
			const original = Zotero.Cite.getItemData;
			Zotero.Cite.getItemData = function (item) {
				const data = original.apply(this, arguments);
				return annotate(item, data);
			};
			return true;
		}
		return false;
	}

	function wrapItemToCSLJSON() {
		if (Zotero.Utilities && typeof Zotero.Utilities.itemToCSLJSON === 'function') {
			const original = Zotero.Utilities.itemToCSLJSON;
			Zotero.Utilities.itemToCSLJSON = function (item) {
				const data = original.apply(this, arguments);
				const zoteroItem = item && item.id ? item : (item && item.uri ? Zotero.Items.getByLibraryAndKey(item.libraryID, item.key) : null);
				return zoteroItem ? annotate(zoteroItem, data) : data;
			};
			return true;
		}
		return false;
	}

	function installHook() {
		if (_installed) return;
		const ok = wrapGetItemData() || wrapItemToCSLJSON();
		if (!ok) {
			Zotero.logError(new Error('MVZ: no supported citeproc hook point found (Zotero.Cite.getItemData / Zotero.Utilities.itemToCSLJSON).'));
			Zotero.alert(null, I18n.t('MVZ_CITEPROC_HOOK_UNAVAILABLE_TITLE'), I18n.t('MVZ_CITEPROC_HOOK_UNAVAILABLE_BODY'));
			return;
		}
		_installed = true;
	}

	return {
		installHook: installHook,
		renderTemplate: renderTemplate,
		sanitizeTemplate: sanitizeTemplate,
		annotate: annotate
	};
})();

/*
 * MVZ Plugin - core module
 *
 * Shared, UI-independent logic used by both the Item Pane (mvz-itempane.js)
 * and the citation engine (mvz-citeproc.js):
 *   - the MVZ version string (Versioning & Build Identification Rules)
 *   - the field catalog (Appendix 2 - fields that can have variants)
 *   - the Extra-field MVZ tag parser/serialiser (Appendix 3)
 *   - the item Language field cleaner (Common UI > Language field cleaner)
 *   - preference accessors
 *   - a small debounce helper (MVZ pane > Synchronisation, "300ms debounce")
 */

/* global Zotero */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.VERSION = '1.0.0-alpha.2';

Zotero.MVZ.Core = (function () {
	'use strict';

	// ---------------------------------------------------------------------
	// Field catalog (Appendix 2 - "Yes" rows only; grouped per "Multiple
	// fields -> one translation"). `key` is the matrix/preference row key;
	// `fields` lists the underlying camelCase database field(s) it governs;
	// `labelField` is the field whose Zotero-native display name should be
	// shown as the row label (per the "no duplicate translation" rule, the
	// grouped fields share one visible label).
	// ---------------------------------------------------------------------

	const FIELD_CATALOG = [
		{ key: 'album', fields: ['album'], labelField: 'album' },
		{ key: 'archive', fields: ['archive'], labelField: 'archive' },
		{ key: 'archiveLocation', fields: ['archiveLocation'], labelField: 'archiveLocation' },
		{ key: 'authority', fields: ['regulatoryBody'], labelField: 'regulatoryBody' },
		{ key: 'blogTitle', fields: ['blogTitle'], labelField: 'blogTitle' },
		{ key: 'bookTitle', fields: ['bookTitle'], labelField: 'bookTitle' },
		{ key: 'caseName', fields: ['caseName'], labelField: 'caseName' },
		{ key: 'caseType', fields: ['reign'], labelField: 'reign' },
		{ key: 'code', fields: ['code'], labelField: 'code' },
		{ key: 'committee', fields: ['committee'], labelField: 'committee' },
		{ key: 'company', fields: ['company'], labelField: 'company' },
		{ key: 'conferenceName', fields: ['conferenceName'], labelField: 'conferenceName' },
		{ key: 'court', fields: ['court'], labelField: 'court' },
		{ key: 'distributor', fields: ['distributor'], labelField: 'distributor' },
		{ key: 'dictionaryTitle', fields: ['dictionaryTitle'], labelField: 'dictionaryTitle' },
		{ key: 'documentName', fields: ['documentName'], labelField: 'documentName' },
		{ key: 'edition', fields: ['edition'], labelField: 'edition' },
		{ key: 'encyclopediaTitle', fields: ['encyclopediaTitle'], labelField: 'encyclopediaTitle' },
		{ key: 'format', fields: ['audioRecordingFormat', 'videoRecordingFormat'], labelField: 'audioRecordingFormat' },
		{ key: 'forumTitle', fields: ['forumTitle'], labelField: 'forumTitle' },
		{ key: 'genre', fields: ['genre'], labelField: 'genre' },
		{ key: 'institution', fields: ['institution'], labelField: 'institution' },
		{ key: 'jurisdiction', fields: ['jurisdiction'], labelField: 'jurisdiction' },
		{ key: 'label', fields: ['label'], labelField: 'label' },
		{ key: 'legislativeBody', fields: ['legislativeBody'], labelField: 'legislativeBody' },
		{ key: 'medium', fields: ['artworkMedium', 'interviewMedium', 'medium'], labelField: 'medium' },
		{ key: 'nameOfAct', fields: ['nameOfAct'], labelField: 'nameOfAct' },
		{ key: 'network', fields: ['network'], labelField: 'network' },
		{ key: 'place', fields: ['place'], labelField: 'place' },
		{ key: 'postType', fields: ['postType'], labelField: 'postType' },
		{ key: 'proceedingsTitle', fields: ['proceedingsTitle'], labelField: 'proceedingsTitle' },
		{ key: 'programTitle', fields: ['programTitle'], labelField: 'programTitle' },
		{ key: 'publisher', fields: ['publisher'], labelField: 'publisher' },
		{ key: 'release', fields: ['release'], labelField: 'release' },
		{ key: 'reportType', fields: ['reportType'], labelField: 'reportType' },
		{ key: 'repository', fields: ['repository'], labelField: 'repository' },
		{ key: 'resolutionLabel', fields: ['resolutionLabel'], labelField: 'resolutionLabel' },
		{ key: 'series', fields: ['series'], labelField: 'series' },
		{ key: 'seriesText', fields: ['seriesText'], labelField: 'seriesText' },
		{ key: 'seriesTitle', fields: ['seriesTitle'], labelField: 'seriesTitle' },
		{ key: 'sessionType', fields: ['sessionType'], labelField: 'sessionType' },
		{ key: 'shortTitle', fields: ['shortTitle'], labelField: 'shortTitle' },
		{ key: 'studio', fields: ['studio'], labelField: 'studio' },
		{ key: 'supplementName', fields: ['supplementName'], labelField: 'supplementName' },
		{ key: 'title', fields: ['title', 'publicationTitle'], labelField: 'title' },
		{ key: 'type', fields: ['letterType', 'manuscriptType', 'mapType', 'presentationType', 'thesisType'], labelField: 'letterType' },
		{ key: 'university', fields: ['university'], labelField: 'university' },
		{ key: 'websiteTitle', fields: ['websiteTitle'], labelField: 'websiteTitle' },
		{ key: 'websiteType', fields: ['websiteType'], labelField: 'websiteType' }
	];

	// Reverse index: camelCase database field name -> matrix row key.
	const FIELD_TO_ROW = {};
	FIELD_CATALOG.forEach(function (row) {
		row.fields.forEach(function (f) { FIELD_TO_ROW[f] = row.key; });
	});

	// Flat list of every individual variant-capable field (Appendix 2 "Yes"
	// rows, ungrouped). Used by the MVZ Pane, which displays one row per
	// actual Zotero base field ("in the same order as Zotero shows them"),
	// as opposed to FIELD_CATALOG/FIELD_TO_ROW above, which group fields
	// only for the Field Inclusion Matrix *preference* (Appendix 2 note
	// "Multiple fields -> one translation").
	const VARIANT_FIELDS = Object.keys(FIELD_TO_ROW);

	// Items that are "Contained" vs "Standalone" (Transliteration/translation
	// style settings > Standalone and contained items).
	const CONTAINED_ITEM_TYPES = [
		'bookSection', 'journalArticle', 'newspaperArticle', 'magazineArticle',
		'encyclopediaArticle', 'dictionaryEntry', 'conferencePaper', 'webPage',
		'blogPost', 'forumPost'
	];
	const STANDALONE_ITEM_TYPES = [
		'bookTitle', 'publicationTitle', 'encyclopediaTitle', 'dictionaryTitle',
		'proceedingsTitle', 'websiteTitle', 'blogTitle', 'forumTitle'
	];

	function isVariantField(fieldName) {
		return Object.prototype.hasOwnProperty.call(FIELD_TO_ROW, fieldName);
	}

	function rowKeyForField(fieldName) {
		return FIELD_TO_ROW[fieldName] || null;
	}

	function isContainedItemType(itemType) {
		return CONTAINED_ITEM_TYPES.indexOf(itemType) !== -1;
	}

	// -----------------------------------------------------------------
	// DOM helper
	//
	// BUG FIX (see TEST_REPORT_Alpha.1.md, "Main pane ... Nothing at all -
	// just a grey background"): Zotero's main window (and its preferences
	// window) are XUL documents. `document.createElement(tag)` on a XUL
	// document creates a XUL element for an unqualified tag name (not an
	// HTML element!) - a XUL "div"/"span"/"button" has no intrinsic layout
	// box, so a whole tree built this way is present in the DOM but renders
	// as nothing. Every element MVZ injects into a *host* Zotero document
	// (the item pane body, the preferences pane) must therefore be created
	// with an explicit XHTML namespace.
	// -----------------------------------------------------------------

	const XHTML_NS = 'http://www.w3.org/1999/xhtml';

	function createElement(doc, tagName) {
		return doc.createElementNS(XHTML_NS, tagName);
	}

	// -----------------------------------------------------------------
	// Extra field MVZ tag parsing / serialisation (Appendix 3)
	//
	// Line syntax: mvz/<l|s>/<body>/<suffix>: <value>
	//   body   = camelCase field name, or creator[<n>]
	//   suffix = a BCP-47-like tag (incl. optional -t-/-m0- extensions)
	// -----------------------------------------------------------------

	const MVZ_LINE_RE = /^mvz\/(l|s)\/([^/]+)\/([^:]+):[ ](.*)$/;
	const CREATOR_BODY_RE = /^creator\[(\d+)\]$/;

	/**
	 * @param {string} extraText raw contents of item.getField('extra')
	 * @returns {{preserved: string, variants: Array}} `preserved` is every
	 *   line NOT starting with 'mvz/', verbatim and in original order;
	 *   `variants` is the parsed MVZ tags.
	 */
	function parseExtra(extraText) {
		const lines = (extraText || '').split('\n');
		const preservedLines = [];
		const variants = [];

		lines.forEach(function (line) {
			if (!line.startsWith('mvz/')) {
				preservedLines.push(line);
				return;
			}
			const m = MVZ_LINE_RE.exec(line);
			if (!m) {
				// Corrupted/unrecognised mvz/ line - drop it silently; it will be
				// regenerated from the MVZ pane's in-memory state on next write.
				return;
			}
			const [, type, body, tag, value] = m;
			const creatorMatch = CREATOR_BODY_RE.exec(body);
			variants.push({
				type: type, // 'l' or 's'
				field: creatorMatch ? null : body,
				creatorIndex: creatorMatch ? parseInt(creatorMatch[1], 10) : null,
				tag: tag,
				value: value
			});
		});

		// Trim one trailing blank line produced by a trailing '\n' in the source
		// (keeps round-tripping idempotent without accumulating blank lines).
		while (preservedLines.length && preservedLines[preservedLines.length - 1] === '') {
			preservedLines.pop();
		}

		return { preserved: preservedLines.join('\n'), variants: variants };
	}

	/**
	 * Rebuild the Extra field text: preserved (non-mvz) text, exactly one
	 * trailing newline, then the mvz/ lines (Preservation Rule, Appendix 3).
	 * @param {string} preservedText
	 * @param {Array} variants
	 * @returns {string}
	 */
	function serializeExtra(preservedText, variants) {
		const mvzLines = variants.map(function (v) {
			const body = v.creatorIndex !== null && v.creatorIndex !== undefined
				? 'creator[' + v.creatorIndex + ']'
				: v.field;
			return 'mvz/' + v.type + '/' + body + '/' + v.tag + ': ' + v.value;
		});

		const trimmed = (preservedText || '').replace(/\n+$/, '');
		if (!trimmed) return mvzLines.join('\n');
		if (!mvzLines.length) return trimmed;
		return trimmed + '\n' + mvzLines.join('\n');
	}

	// -----------------------------------------------------------------
	// Debounce (MVZ pane > Synchronisation with the Extra field)
	// -----------------------------------------------------------------

	function debounce(fn, wait) {
		let timer = null;
		return function (...args) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(function () {
				timer = null;
				fn.apply(null, args);
			}, wait);
		};
	}

	// -----------------------------------------------------------------
	// Preferences
	// -----------------------------------------------------------------

	const PREF_BRANCH = 'extensions.mvz.';

	function getPref(name, defaultValue) {
		try {
			const value = Zotero.Prefs.get(PREF_BRANCH + name, true);
			return value === undefined || value === null ? defaultValue : value;
		} catch (e) {
			Zotero.logError(e);
			return defaultValue;
		}
	}

	function setPref(name, value) {
		Zotero.Prefs.set(PREF_BRANCH + name, value, true);
	}

	function getJSONPref(name, defaultValue) {
		const raw = getPref(name, null);
		if (!raw) return defaultValue;
		try {
			return JSON.parse(raw);
		} catch (e) {
			Zotero.logError(e);
			return defaultValue;
		}
	}

	function setJSONPref(name, value) {
		setPref(name, JSON.stringify(value));
	}

	/**
	 * "By default, [the target document language] is set to the same value
	 * as the Zotero UI language setting." (Target document language)
	 */
	function getTargetDocumentLanguage() {
		const explicit = getPref('targetDocument.language', '');
		if (explicit) return explicit;
		try {
			return Zotero.locale || 'en-US';
		} catch (e) {
			return 'en-US';
		}
	}

	function getFieldInclusionMatrix() {
		return getJSONPref('fieldInclusion', {});
	}

	function setFieldInclusionMatrix(matrix) {
		setJSONPref('fieldInclusion', matrix);
	}

	// -----------------------------------------------------------------
	// Item Language field cleaner
	// (Common UI > Script/language tag editor > The item Language field
	// cleaner > Language field extraction algorithm)
	// -----------------------------------------------------------------

	let _languageNameIndex = null; // locale -> { name.toLowerCase(): code }

	function buildLanguageNameIndex(locale) {
		if (_languageNameIndex && _languageNameIndex.locale === locale) {
			return _languageNameIndex.map;
		}
		const map = {};
		try {
			const dn = new Intl.DisplayNames([locale], { type: 'language' });
			Zotero.MVZ.BCP47.allLanguages().forEach(function (code) {
				try {
					const name = dn.of(code);
					if (name) map[name.toLowerCase()] = code;
				} catch (e) {
					// Some registry codes are not valid Intl.DisplayNames subtags
					// (e.g. collective/historical codes) - skip them defensively.
				}
			});
		} catch (e) {
			Zotero.logError(e);
		}
		_languageNameIndex = { locale: locale, map: map };
		return map;
	}

	/**
	 * Attempt to resolve a single candidate phrase (one or more words) to a
	 * BCP-47 tag, either because it already looks like one, or because it
	 * matches a known language display name.
	 * @returns {string|null} normalised BCP-47 tag, or null on failure.
	 */
	function resolveCandidate(phrase, locale) {
		// 1. Does it already look like a BCP-47 code (contains a hyphen, or is
		// a bare 2/3-letter code)? Validate via the subtag registry.
		if (/^[A-Za-z]{2,3}(-[A-Za-z0-9]+)*$/.test(phrase)) {
			const parsed = Zotero.MVZ.BCP47.parseTag(phrase);
			if (parsed.valid) return Zotero.MVZ.BCP47.formatTag(parsed);
		}
		// 2. Does it match a known language display name (case-insensitive)?
		const index = buildLanguageNameIndex(locale);
		const code = index[phrase.toLowerCase()];
		if (code) return Zotero.MVZ.BCP47.formatTag(Zotero.MVZ.BCP47.parseTag(code));
		return null;
	}

	/**
	 * Language field extraction algorithm (GLOSSARY.md / SPECIFICATION
	 * "Language field extraction algorithm"). Normalises the free-text
	 * Language field into a clean, comma-separated list of BCP-47 tags.
	 *
	 * @param {string} rawText
	 * @param {string} [locale] UI locale for language-name matching; defaults
	 *   to the current Zotero UI locale.
	 * @returns {{ normalized: string, anomalies: Array<{token: string, kind: string}> }}
	 */
	function cleanLanguageField(rawText, locale) {
		locale = locale || Zotero.locale || 'en-US';
		const anomalies = [];

		if (!rawText || !rawText.trim()) {
			return { normalized: '', anomalies: anomalies };
		}

		// 1. Normalise punctuation: split on , ; / | as hard boundaries. Do NOT
		// split on '-', '_' or parentheses.
		const segments = rawText.split(/[,;/|]/);

		const results = [];

		segments.forEach(function (segment) {
			const trimmed = segment.trim();
			if (!trimmed) return;

			// 2. Split word boundaries.
			const tokens = trimmed.split(/\s+/).filter(Boolean);

			// 3. Greedy right-to-left windowed matching.
			let pos = 0;
			while (pos < tokens.length) {
				let w = Math.min(tokens.length - pos, 4);
				let matched = null;
				while (w >= 1) {
					const candidate = tokens.slice(pos, pos + w).join(' ');
					const resolved = resolveCandidate(candidate, locale);
					if (resolved) {
						matched = { tag: resolved, width: w, candidate: candidate };
						break;
					}
					w--;
				}
				if (matched) {
					// Flag as a "normalised language" anomaly if the matched phrase
					// was not already an exact BCP-47-looking token (i.e. it was
					// resolved via a display name lookup, not a literal code).
					const wasLiteralCode = /^[A-Za-z]{2,3}(-[A-Za-z0-9]+)*$/.test(matched.candidate)
						&& Zotero.MVZ.BCP47.parseTag(matched.candidate).valid;
					if (!wasLiteralCode) {
						anomalies.push({ token: matched.candidate, kind: 'normalized-language' });
					}
					results.push(matched.tag);
					pos += matched.width;
				} else {
					anomalies.push({ token: tokens[pos], kind: 'unrecognized-language' });
					pos += 1;
				}
			}
		});

		return { normalized: results.join(', '), anomalies: anomalies };
	}

	/**
	 * Blank counts as 'clean'. A non-blank Language field is 'clean' only if
	 * every comma-separated entry already parses as a valid BCP-47 tag.
	 */
	function isLanguageFieldClean(rawText) {
		if (!rawText || !rawText.trim()) return true;
		return rawText.split(',').every(function (part) {
			return Zotero.MVZ.BCP47.parseTag(part.trim()).valid;
		});
	}

	return {
		FIELD_CATALOG: FIELD_CATALOG,
		VARIANT_FIELDS: VARIANT_FIELDS,
		isVariantField: isVariantField,
		rowKeyForField: rowKeyForField,
		isContainedItemType: isContainedItemType,
		XHTML_NS: XHTML_NS,
		createElement: createElement,
		parseExtra: parseExtra,
		serializeExtra: serializeExtra,
		debounce: debounce,
		getPref: getPref,
		setPref: setPref,
		getJSONPref: getJSONPref,
		setJSONPref: setJSONPref,
		getTargetDocumentLanguage: getTargetDocumentLanguage,
		getFieldInclusionMatrix: getFieldInclusionMatrix,
		setFieldInclusionMatrix: setFieldInclusionMatrix,
		cleanLanguageField: cleanLanguageField,
		isLanguageFieldClean: isLanguageFieldClean
	};
})();

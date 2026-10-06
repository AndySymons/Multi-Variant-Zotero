/*
 * MVZ Plugin - BCP-47 tag support
 *
 * A small, dependency-free BCP-47 tag parser/validator/formatter, driven by
 * the IANA Language Subtag Registry validity sets and the CLDR
 * "likelySubtags" / "languageData" supplemental data bundled in
 * content/lib/data/ (see SPECIFICATION_MVZ1_PLUGIN.md, "Script/language tag
 * editor" and "Script/language list").
 *
 * Human-readable display names for codes are NOT bundled as data (no CLDR
 * displayNames file is included in the workspace); they are obtained at
 * render time from Zotero's host environment via Intl.DisplayNames, which
 * is natively available in Zotero's Gecko runtime and already resolves
 * names in the current UI locale - satisfying "an explanation in the UI
 * language" (Common UI > Script/language list) without bundling further
 * reference data.
 *
 * This module intentionally does NOT implement automatic transliteration or
 * translation (out of MVZ1 scope - see README.md feature table, "Autofill").
 * It only parses/validates/formats tags and answers "what scripts/regions
 * are valid/likely for this language" style questions needed by the MVZ
 * pane, the Language field cleaner, and the common Script/Language editor.
 */

/* global Zotero */

if (!Zotero.MVZ) Zotero.MVZ = {};

Zotero.MVZ.BCP47 = (function () {
	'use strict';

	let _data = null; // Lazily loaded reference data (see load()).

	function load() {
		if (_data) return _data;

		function readJSON(relPath) {
			// The chrome content mapping (registered in bootstrap.js) always
			// resolves 'content/' regardless of the package's install location
			// (plain directory during development, or a jar: URI once packaged
			// as a .xpi), so this is more robust than building a URL from
			// rootURI directly.
			const url = 'chrome://mvz/content/lib/data/' + relPath;
			// Primary: Zotero's own synchronous packaged-file reader.
			try {
				if (Zotero.File && typeof Zotero.File.getContentsFromURL === 'function') {
					return JSON.parse(Zotero.File.getContentsFromURL(url));
				}
			} catch (e) {
				Zotero.logError(e);
			}
			// Fallback: a synchronous XHR against the same chrome-registered URL.
			try {
				const xhr = new XMLHttpRequest();
				xhr.open('GET', url, false);
				xhr.send(null);
				if (xhr.responseText) return JSON.parse(xhr.responseText);
			} catch (e) {
				Zotero.logError(e);
			}
			return {};
		}

		_data = {
			language: readJSON('iana-language.json'),
			script: readJSON('iana-script.json'),
			region: readJSON('iana-region.json'),
			variant: readJSON('iana-variant.json'),
			likelySubtags: readJSON('cldr-likelySubtags.json'),
			languageScripts: readJSON('cldr-languageScripts.json')
		};
		return _data;
	}

	function data() {
		if (!_data) {
			throw new Error('Zotero.MVZ.BCP47 used before load(rootURI) was called.');
		}
		return _data;
	}

	// --- Validity checks -------------------------------------------------

	function isValidLanguage(code) {
		return !!code && Object.prototype.hasOwnProperty.call(data().language, String(code).toLowerCase());
	}

	function isValidScript(code) {
		return !!code && Object.prototype.hasOwnProperty.call(data().script, String(code).toLowerCase());
	}

	function isValidRegion(code) {
		return !!code && Object.prototype.hasOwnProperty.call(data().region, String(code).toLowerCase());
	}

	function isValidVariant(code) {
		return !!code && Object.prototype.hasOwnProperty.call(data().variant, String(code).toLowerCase());
	}

	// --- Enumeration (for the Common UI "list of all possible X") --------

	function allLanguages() {
		return Object.keys(data().language);
	}

	function allScripts() {
		return Object.keys(data().script);
	}

	function allRegions() {
		return Object.keys(data().region);
	}

	// --- Casing conventions (Appendix 3, "The suffix") --------------------
	// language: lower case; REGION: upper case; Script: title case; others: lower case.

	function formatLanguage(code) {
		return String(code).toLowerCase();
	}

	function formatRegion(code) {
		return String(code).toUpperCase();
	}

	function formatScript(code) {
		const s = String(code).toLowerCase();
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	function formatOther(code) {
		return String(code).toLowerCase();
	}

	// --- Default / likely script resolution -------------------------------
	// "the script is automatically completed to the default for the
	// language: en-Latn, fr-Latn, de-Latn, el-Grek, ru-Cyrl, etc."

	function defaultScriptForLanguage(language) {
		if (!language) return null;
		const likely = data().likelySubtags;
		const key = String(language).toLowerCase();
		const likelyTag = likely[key];
		if (!likelyTag) return null;
		const parts = likelyTag.split('-');
		// likely tag shapes: "lang-Script-REGION" or "lang-Script" or "lang-REGION".
		for (let i = 1; i < parts.length; i++) {
			if (parts[i].length === 4) return formatScript(parts[i]);
		}
		return null;
	}

	// "Script is optional and only needed if the language permits more than
	// one [...]  In all other cases the script is automatically completed..."

	function scriptsForLanguage(language) {
		if (!language) return [];
		const key = String(language).toLowerCase();
		const known = data().languageScripts[key];
		if (known && known.length) return known.map(formatScript);
		const def = defaultScriptForLanguage(language);
		return def ? [def] : [];
	}

	function languageHasMultipleScripts(language) {
		return scriptsForLanguage(language).length > 1;
	}

	// --- Parsing ------------------------------------------------------------
	// Parses the "main" (pre -t-) part of a tag into language/script/region/
	// variants, and keeps any -t- / -m0- (etc.) extension verbatim (per
	// Appendix 3: "t0- and m0- extensions are optional [...] preserved, but
	// not acted upon").

	function parseTag(tag) {
		const result = {
			language: null,
			script: null,
			region: null,
			variants: [],
			extensions: [], // [{ singleton: 't', subtags: ['ru', 'Cyrl'] }, ...]
			valid: false,
			errors: []
		};

		if (!tag || typeof tag !== 'string') {
			result.errors.push('Empty or non-string tag.');
			return result;
		}

		const codes = tag.trim().split('-').filter(Boolean);
		if (!codes.length) {
			result.errors.push('Empty tag.');
			return result;
		}

		let i = 0;

		// Language (mandatory, must be first).
		if (isValidLanguage(codes[0])) {
			result.language = codes[0].toLowerCase();
			i = 1;
		} else {
			result.errors.push('Missing or invalid language subtag in \'' + tag + '\'.');
			return result;
		}

		// Script (optional, 4 letters).
		if (codes[i] && codes[i].length === 4 && isValidScript(codes[i])) {
			result.script = codes[i].toLowerCase();
			i++;
		}

		// Region (optional, 2 letters or 3 digits).
		if (codes[i] && (codes[i].length === 2 || codes[i].length === 3) && isValidRegion(codes[i])) {
			result.region = codes[i].toUpperCase();
			i++;
		}

		// Variants (zero or more, before any singleton/extension).
		while (codes[i] && codes[i].length !== 1 && isValidVariant(codes[i])) {
			result.variants.push(codes[i].toLowerCase());
			i++;
		}

		// Extensions / private use, starting with a singleton (e.g. "t", "m0" is
		// actually "m0" is not a singleton - "m0" is a -t- extension *keyword*,
		// not itself a singleton; the singleton here is the preceding "t").
		while (codes[i]) {
			if (codes[i].length === 1) {
				const singleton = codes[i].toLowerCase();
				const subtags = [];
				i++;
				while (codes[i] && codes[i].length !== 1) {
					subtags.push(codes[i]);
					i++;
				}
				result.extensions.push({ singleton: singleton, subtags: subtags });
			} else {
				// Unrecognised trailing material; keep it verbatim as a loose extension
				// rather than failing the whole tag (defensive - see AGENT_RULES "try/catch").
				result.extensions.push({ singleton: null, subtags: [codes[i]] });
				i++;
			}
		}

		result.valid = true;
		return result;
	}

	// --- Formatting -----------------------------------------------------
	// Rebuilds a canonical tag string from parsed parts, applying the
	// Appendix 3 casing convention to the *primary* subtags. Extension
	// subtags (-t-, -m0- etc.) are preserved exactly as supplied (lower
	// case, matching the majority of the specification's own examples) -
	// they carry no semantic meaning in MVZ1 and are never matched against.

	function formatTag(parsed) {
		if (!parsed || !parsed.language) return '';
		const parts = [formatLanguage(parsed.language)];
		if (parsed.script) parts.push(formatScript(parsed.script));
		if (parsed.region) parts.push(formatRegion(parsed.region));
		(parsed.variants || []).forEach(function (v) { parts.push(formatOther(v)); });
		(parsed.extensions || []).forEach(function (ext) {
			if (ext.singleton) parts.push(formatOther(ext.singleton));
			ext.subtags.forEach(function (s) { parts.push(formatOther(s)); });
		});
		return parts.join('-');
	}

	function normalize(tag) {
		return formatTag(parseTag(tag));
	}

	return {
		load: load,
		isValidLanguage: isValidLanguage,
		isValidScript: isValidScript,
		isValidRegion: isValidRegion,
		isValidVariant: isValidVariant,
		allLanguages: allLanguages,
		allScripts: allScripts,
		allRegions: allRegions,
		formatLanguage: formatLanguage,
		formatScript: formatScript,
		formatRegion: formatRegion,
		formatOther: formatOther,
		defaultScriptForLanguage: defaultScriptForLanguage,
		scriptsForLanguage: scriptsForLanguage,
		languageHasMultipleScripts: languageHasMultipleScripts,
		parseTag: parseTag,
		formatTag: formatTag,
		normalize: normalize
	};
})();

/*
 * MVZ Plugin - default preferences
 *
 * Loaded by bootstrap.js via a small sandboxed `pref()` function (see
 * installDefaultPrefs() in bootstrap.js). Values here are the *factory
 * defaults*; once a user changes a setting in the MVZ Settings pane the
 * user-set value is stored on the normal (non-default) branch by Zotero's
 * preference bindings and these defaults are only used as the fallback.
 *
 * SPECIFICATION_MVZ1_PLUGIN.md references:
 * - "Target document language" defaults to the Zotero UI language (resolved
 *   at runtime in mvz-core.js, NOT hard-coded here - an empty string means
 *   "follow the Zotero UI locale").
 * - "Transliteration and translation style settings": default radio is APA
 *   (marked "(0)" - the first, pre-selected option in the style table).
 * - "Field inclusion matrix": default tick pattern from the table in the
 *   specification. Encoded as JSON: { "<matrixRowKey>": { "original": bool,
 *   "transliteration": bool, "translation": bool } }.
 */

// Target document characteristics.
pref("extensions.mvz.targetDocument.language", "");
pref("extensions.mvz.targetDocument.style", "apa");
pref("extensions.mvz.targetDocument.includeOriginal", true);
pref("extensions.mvz.targetDocument.customTemplateStandalone", "");
pref("extensions.mvz.targetDocument.customTemplateContained", "");

// Field inclusion matrix (default ticks, matching the specification table).
pref("extensions.mvz.fieldInclusion", "{\"creator\":{\"original\":false,\"transliteration\":true,\"translation\":false},\"album\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"archive\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"archiveLocation\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"authority\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"blogTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"bookTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"caseName\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"caseType\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"code\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"committee\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"company\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"conferenceName\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"court\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"distributor\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"dictionaryTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"documentName\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"edition\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"encyclopediaTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"format\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"forumTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"genre\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"institution\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"jurisdiction\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"label\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"legislativeBody\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"medium\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"nameOfAct\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"network\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"place\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"postType\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"proceedingsTitle\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"programTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"publisher\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"release\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"reportType\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"repository\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"resolutionLabel\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"series\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"seriesText\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"seriesTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"sessionType\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"shortTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"studio\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"supplementName\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"title\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"type\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"university\":{\"original\":true,\"transliteration\":false,\"translation\":false},\"websiteTitle\":{\"original\":true,\"transliteration\":true,\"translation\":true},\"websiteType\":{\"original\":true,\"transliteration\":false,\"translation\":false}}");

// Script/Language dropdown shortlists (user-curated common lists; empty by default).
pref("extensions.mvz.scriptShortlist", "[]");
pref("extensions.mvz.languageShortlist", "[]");

// UI state.
pref("extensions.mvz.settings.activeTab", "targetDocument");

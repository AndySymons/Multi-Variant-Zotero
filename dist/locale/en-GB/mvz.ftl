# MVZ Plugin - en-GB reference locale
#
# This is the MVZ reference locale (SPECIFICATION_MVZ1_PLUGIN.md > "Supported
# languages": "en-GB is the original reference language from which all
# others are translations."). All other MVZ locale files are machine
# translations of this file.
#
# Placeholder syntax: Fluent variables ( { $name } ). The parameter *type*
# (literal / index / item / field / creator) for each variable is declared
# in content/mvz-i18n.js (PARAM_TYPES) - see that file's header comment for
# why the specification's documentation convention "{{type-name}}" is not
# used verbatim here. Per "Locale file precedence", this file never
# duplicates Zotero's own item type / item field / creator type names:
# those always arrive here pre-resolved to a localized string by
# mvz-i18n.js before Fluent substitutes them into the message.
#
# Custom token formation: MVZ_<hierarchical_underscored_identifier>.

## MVZ Pane (Appendix 1 examples, verbatim)

MVZ_DUPLICATE_VARIANT = Error: Field "{ $field_name }" already has a variant for "{ $language_tag }"
MVZ_BASE_FIELD = { $base_field_name }
MVZ_VARIANT = { $language_tag }

## MVZ Pane - general

MVZ_PANE_TITLE = MVZ Variants
MVZ_PANE_SECTION_TOOLTIP = Multi-Variant Zotero
MVZ_CREATOR_FIELD_LABEL = Creator[{ $this_creator_index }]
MVZ_TYPE_INDICATOR_L = L
MVZ_TYPE_INDICATOR_S = S
MVZ_ADD_LANGUAGE_VARIANT_TOOLTIP = Add translation (language) variant
MVZ_ADD_SCRIPT_VARIANT_TOOLTIP = Add transliteration (script) variant
MVZ_DELETE_VARIANT_TOOLTIP = Delete variant
MVZ_DELETE_VARIANT_CONFIRM_TITLE = Delete variant?
MVZ_DELETE_VARIANT_CONFIRM_BODY = Are you sure you want to delete this variant?
MVZ_FIELD_BLANK_TOOLTIP = Enter a value in { $field_name } above before adding a variant

## Language field popup / cleaner

MVZ_LANGUAGE_NOT_CLEAN_TITLE = Language field needs cleaning
MVZ_LANGUAGE_NOT_CLEAN_BODY = The item's Language field must be a clean, comma-separated list of BCP-47 language tags before variants can be added. Click to open the Language field editor.
MVZ_LANGUAGE_FIELD_EDITOR_TITLE = Language
MVZ_LANGUAGE_FIELD_ADD_BUTTON = +
MVZ_LANGUAGE_FIELD_REMOVE_BUTTON = -
MVZ_LANGUAGE_UNRECOGNIZED_ANOMALY = Unrecognised language: "{ $token }"
MVZ_LANGUAGE_NORMALIZED_ANOMALY = Normalised "{ $token }" to a BCP-47 language tag

## Extra field popup

MVZ_EXTRA_WARNING = Warning: edits to MVZ tags will be ignored
MVZ_EXTRA_WARNING_BUTTON = Understood

## Creator listener (invisible unless there is an error)

MVZ_CREATOR_SYNC_ERROR_TITLE = MVZ creator variant error
MVZ_CREATOR_SYNC_ERROR_BODY = MVZ could not keep creator variants in step with the database (the Extra field may be corrupted). Details: { $error_message }

## Save / database errors

MVZ_SAVE_ERROR_TITLE = MVZ could not save
MVZ_SAVE_ERROR_BODY = An error occurred while saving MVZ variants: { $error_message }

## Common UI - Script/Language tag editor

MVZ_PICK_SCRIPT_TITLE = Select a script
MVZ_PICK_LANGUAGE_TITLE = Select a language
MVZ_PICK_REGION_TITLE = Select a region (optional)
MVZ_PICK_ADD_LANGUAGE = Add a language
MVZ_PICK_ADD_REGION = Add a region
MVZ_PICK_ADD_SCRIPT = Add / override a script
MVZ_SEARCH_PLACEHOLDER = Type to search…
MVZ_LIST_ADD_BUTTON = +
MVZ_LIST_REMOVE_BUTTON = -
MVZ_LANGUAGE_ALREADY_IN_ITEM = "{ $language_tag }" is already in this item's Language field; a translation variant is unnecessary.
MVZ_SCRIPT_ALREADY_IN_ITEM = "{ $script_tag }" matches this item's script; a transliteration variant is unnecessary.
MVZ_OK_BUTTON = OK
MVZ_CANCEL_BUTTON = Cancel

## Settings pane

MVZ_SETTINGS_PANE_TITLE = MVZ Plugin
MVZ_TAB_TARGET_DOCUMENT = Target document characteristics
MVZ_TAB_FIELD_INCLUSION = Field inclusion matrix
MVZ_TAB_SCRIPT_LANGUAGE_LISTS = Script and language drop downs
MVZ_TARGET_LANGUAGE_LABEL = Target document language
MVZ_STYLE_SECTION_LABEL = Transliteration and translation style
MVZ_STYLE_OPTION_APA = APA / Chicago
MVZ_STYLE_OPTION_MLA = MLA
MVZ_STYLE_OPTION_MHRA = MHRA
MVZ_STYLE_OPTION_CUSTOM = Custom
MVZ_STYLE_CUSTOM_STANDALONE_LABEL = Custom template (standalone items)
MVZ_STYLE_CUSTOM_CONTAINED_LABEL = Custom template (contained items)
MVZ_FIELD_MATRIX_COL_FIELD = Fields
MVZ_FIELD_MATRIX_COL_ORIGINAL = Original
MVZ_FIELD_MATRIX_COL_TRANSLITERATION = Transliteration
MVZ_FIELD_MATRIX_COL_TRANSLATION = Translation
MVZ_FIELD_MATRIX_ALL_CREATORS = * All creator types (choose 1)
MVZ_SCRIPT_SHORTLIST_LABEL = Script dropdown shortlist
MVZ_LANGUAGE_SHORTLIST_LABEL = Language dropdown shortlist
MVZ_SHORTLIST_ADD = +
MVZ_SHORTLIST_REMOVE = -

## Start-up / citation back end

MVZ_CITEPROC_HOOK_UNAVAILABLE_TITLE = MVZ citation feature disabled
MVZ_CITEPROC_HOOK_UNAVAILABLE_BODY = MVZ could not find the expected Zotero citation data function, so transliterations and translations will not be added to citations. The MVZ pane will continue to work normally.

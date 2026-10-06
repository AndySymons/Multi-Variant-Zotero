# SPECIFICATION – MVZ PLUGIN

Draft 17 

Andrew Symons 

04-Oct-2026 



#### Document revision record

[toc]



----



# Functional overview

**Multi-Variant Zotero (MVZ)**  is a Zotero 10 plugin designed to mimic the behaviour of the (sadly now defunct) Jurism 6 with respect to its language features; that is to say, it enables the user to add several  ‘variants’ to practically any natural language text field (full list in appendix 1) in order to specify transliterations or translations of the base field. The user can add as many variants as they wish. 

The MVZ policy is that no prior assumption is made about the ultimate target document  into which citations will be inserted. The decisions whether to include transliterations and translations in citations, and which of many variants to choose, are not taken until the citation is generated, and are based on the current MVZ target document preferences. 

This plugin therefore gives the user complete freedom to write in any languages, using any scripts, based on a single library.  

### A note on Jurism’s ‘Set Language’ feature

The Jurism facility to enter a ‘’set language” for a field that can be different from the item language is deliberately NOT provided in the MVZ Plugin, because: 

1. It is semantically ambiguous to a human and therefore hard to describe to a citation program - especially if the set language matches neither the item language nor the current document language!   
2. It is functionally redundant: if the user’s intent is (for example) to put a transliteration into the ‘main’ subfield of the citation rather than the original script, then the MVZ plugin provides that in a more elegant, flexible, and robust way using the target document preferences. 

### A note on explicit variant types L-S 

In Jurism, all variants were entered in the same way and it was inferred at citation time which variants were translations and which were transliterations. That was based partly on a limited use of BCP-47. With the full BCP-47 options supported by MVZ plugin, it could be ambiguous whether a variant is a translation or a transliteration. 

In MVZ, this is made completely unambiguous to user and program by adding a characteristic to the variant that specifies which type it is: 

-  Variant type “L” = *translation*, i.e. a conversion of language (L = Language). 
-  Variant type “S” = *transliteration*, i.e. a conversion of script (S = Script).

## MVZ library management best practices 

The following reflects the recommended way of working with Zotero and MVZ, for the best results with the least effort:  

1. Provide each item with a Language field that is BCP-47 compliant 
   - Zotero does not enforce this, but MVZ does. 
   - If the original item is in more than one language, then the language field should contain a comma separated list of BCP-47-compliant language tags. 

2. Enter the base values of all the fields in the language(s) specified in the item Language field, using the (explicit or inferred) script for that language. If the item is multi-lingual, use the values the original item uses, e.g. titles in more than one language.      
3. Use fields called “Original xxx” only to refer to an original *publication* of the same item in the same language; not to mean the original *language*. 
4. If you want to refer to something as the translation of an original:
   - Create the original as a separate item
   - Add a note to the current item “translation of … ”
   - Add a “related” link between the two items
   - When citing, explicitly include both: for example “<citation 1> (a translation of <citation 2>)”. 
5. Add as many variants as you might possibly use to any natural language field;
   - The decision whether to *use* them in citations or not is made separately in the MVZ preferences. For a citation in a given target document, just one transliteration and one translation will be selected from those made available, depending to the target document preferences, so there is no danger of ‘variant overload’.
6. Use the MVZ preferences (not the library item) to define 
   - For which fields transliterations or translations are included at all 
   - Whether a transliteration should replace the original in a citation, and whether the original is wanted as well 
   - The sequence of original, transliteration, and translation (where applicable), and the styles of bracketing, quotes, and italicisation to use.  

 

# Delivery / installation 

## Delivery package

The plugin is to be delivered as a standard  `.xpi` package compatible with installation using the native Zotero pluging installer. 

It is intended for Zotero 10, minimum.   

The .`xpi `is just a renamed `.zip `of all the required files and directories.   

This package includes:

```
multi-variant-zotero.xpi				<--- before packaging: mvz1_package 
├── manifest.json
├── bootstrap.js
├── prefs.js
├── icon.png										<--- main icon 48x48
|
├── content/
│   ├── lib/										<--- json BCP-47, CLDR, and IANA lookup files 
│   ├── icon16.png							<--- reduced size icon 16x16
│   ├── icon32.png							<--- reduced size icon 32x32
│   ├── mvz-citeproc.js
│   ├── mvz-common-ui.js
│   ├── mvz-core.js
│   ├── mvz-i18n.js
│   ├── mvz-itempane.js
│   ├── mvz-itempane.css
│   ├── mvz-prefs.js
│   ├── mvz-preferences.css
│   └── preferences.xhtml
|
└── locale/
    ├── en-GB/									<--- MVZ reference language 
    |   └── mvz.ftl
    └── pt-PT/									<--- example alternate locale for testing 
        └── mvz.ftl
```

## The manifest

`manifest.json` contains as a minimum 

```
{
  "manifest_version": 2,
  "id": "multi-variant-zotero@andysymons.github.io",
  "name": "Multi-Variant Zotero",
  "version": "1.0.0-alpha.1",
  "description": "Multi-variant language and script support for bibliographic metadata.",
  "homepage_url": "https://github.com/AndySymons/Multi-Variant-Zotero",
  "icons": {
    "48": "icon.png"
  },
  "applications": {
    "zotero": {
      "strict_min_version": "10.0",
      "strict_max_version": "10.0.*",
      "update_url": "https://github.com/AndySymons/Multi-Variant-Zotero/releases/latest/download/update.json"
    }
  },
  "author": "Andy Symons"
}
```

2. The version of the icon with the required 48x48 pixel count, selected and re-named to be compatible with the manifest. 
3. The locale files: two to start with but all when going into production
4. Whatever Javascript code segments are required to meet these specifications 

## Version update propagations 

Whenever writing new versions of code for the MVZ, the new version string in the `.xpi` package MUST be synchronised in a manner that is visible to the installer and the Zotero plugin list. 



# Technical architecture

```
USER
|
|     +---------------+           ++====================++
|     |               |<----------|| ZOTERO base fields |├---------+
├<--->| MVZ item pane |           ++=========+==========++         |
|     |               |                      |                     |
|     +---.---+-------+                      V                     |
|         .   |                    +-------------------+           |
|         .   |                    | Creator listener  |           |
|         .   |                    +---------+---------+           |
|         .   |                              |                     |
|         .   +---------------+              V                     |
|         .                   |        ++===========++             |
|       +----------------+    +------->|| Extra     ||             |
├<----->| Extra listener |<------------|| mvz lines |├---------+   |
|       +-.--------------+             ++===========++         |   | 
|         .                                                    |   |
|         .                                                    |   |
|       +-.-------------+              ++==========++          |   |
├<----->| Lang. popup   |<------------>|| Language |├------+   |   |
|       +-.-------------+              ++==========++      |   |   |
|         .                                                |   |   |
|         .                                                |   |   |
|     +---.----------+      ++===================++        |   |   |
└<--->| MVZ Settings |<---->|| MVZ Preferences   |├----+   |   |   | 
      +---.----------+      ++===================++    |   |   |   |
          .                                            |   |   |   | 
          .                                            V   V   V   V 
          .                                         +--+---+---+---+--+             
    ++====.=====++                                  | Citation gen.   |
    || Locales  ||                                  +--------+--------+     
    ++==========++                                           |
                                                             V
                                                      +------+------+             
                                                      | Citeproc.   |
                                                      +-------------+     
```

N.B. Extra and Language are, physically, Zotero base fields, but are shown separately her because they have a particular significance for MVZ.  

1. **MVZ Item Pane** (a.k.a. the front end): The main interface with MVZ. Enables the user to view and edit Zotero base fields as well as add variants.
2. **Creator listener**: triggered if the user deletes a *Creator*.
3. **Extra listener**: triggered if the user selects or leaves the *Extra* field.
4. **Language popup**:  triggered if the user selects the item *Language* field. 
5. **MVZ preferences**: the MVZ pane within the Zotero preferences, in which the target document citation preferences and the language/script shortlists are defined. 
6. **Citation generation** (a.k.a. the back end): for a cited item – collects the base field, a translation (L-variant, if applicable), and a transliteration  (S-variant, if applicable) ; arranges then into one field, according to the MVZ style preferences; passes the assembled field onto `Citeproc`, which formats it according to the Zotero style selection.  
7. All UI is **internationalised** to the user’s locale, using MVZ custom and Zotero locale files, to work seamlessly with Zotero. 



# UI plugin registration 

Register a custom 'MVZ' Item Pane section using Zotero's native Item Pane Section API. Zotero automatically injects the section icon into the Item Pane's right-hand Side Navigation Bar to allow instant scrolling to the MVZ pane.

Register the custom MVZ preferences after the standard Zotero preferences and other plugins. 

  

# MVZ pane layout and interaction 

## Initial layout mimics Zotero  

The MVZ pane without variants looks exactly like the Zotero ‘Info’ pane *except* that the *Extra* field is not included. It uses the same font and background colours as Zotero. (This means that the user can collapse the Zotero Info pane and just use the MVZ plugin pane). 

The following is therefore simply a description of how the Zotero UI main pane works…  

### Left column

The left column contains the **field names**, in UI locale; dark grey on light grey

- For creators, it is the creator type, which opens as a drop-down if left-clicked 
- For regular fields, it is the name of the field, no response to left click 

### Middle column 

The middle column is for **values**: 

#### Regular field values 

- Box fills the rest of the pane 
- Grey background if not selected; plain white background if selected for editing (no prompt)
- Black font for the value (contrast to grey labels). 

####  Creator field values

1. If single name switch on: 
   - single box, like that for regular fields but narrower to leave space for the buttons described next. 
   - The box has a “(full name)” prompt displayed in pale grey font
   - User types the actual name over it, which appears in black font. 
2. If single name switch off: 
   - two boxes separated by a comma: 
   - Prompts “(last name)” and “(first name)” displayed in pale grey font inside
   - User types the actual names over them, which appears in black font. 

### Right column 

- Only used for creator fields; for regular fields the value box extends to the right of the pane. 
- Only appears when the mouse hovers over it – the following is therefore only ever displayed on one line:

#### Single name toggle switch

- Two-box icon indicates name currently set to one field:  
   - Hovering over it displays “Switch to two fields”. 
   - Clicking it … 
      - Changes the name value display layout to two fields as described above
      - Splits the text from the single field by putting the last word in the “last name” field and all remaining words in the “first name” field. 
      - Leading and trailing spaces are trimmed.  
      - Changes the switch icon to the one-box version. 
- One-box icon indicates name currently set to two fields: 
   - Hovering over it displays “Switch to single field”. 
   - Clicking it 
      - Changes the name value display to one field as described above
      - Concatenates into that field: 
         - the value of the first name field
         - a space
         - the value of the last name field (all words) 
      - Changes the switch icon to the two-box version. 

#### Delete button

- Button with “-” in a circle. 
   - Greyed out if there is no creator (no name yet completed); otherwise…  
   - Hovering over it displays “Delete’‘. 
   - Clicking it deletes the creator on that line
      - … and the whole line unless it it the last creator, in which case it is just left blank 

#### Create button

- Button with “+” in a circle. 
   - Greyed out if there is no creator (no name yet completed); otherwise…  
   - Hovering over it displays “Create’‘. 
   - Clicking it adds a new creator, displayed on a new line inserted after the current line. 

#### Context menu

- Three dots icon. 
   - Hovering over it displays “Open context menu”. 
   - Clicking it pops up a menu depending on the state of the single name switch:  
      - *If the single name switch is set to single name*
         - The only option is “Fix case”
         - Fix case is greyed out and inactive if the names are already capitalised. 
         - If either name is not capitalised, it is black and active. 
            - Clicking it then capitalises all the names; and it goes grey (capitalisation is not reversible).  
      - *If the single name switch is set to two names* 
         - Under ‘Fix Case’ an additional option “Swap names” is added to the menu. 
         - Clicking it swaps over the first and last names.  
         - The menu option remains, so this is reversible 

##  Adding variants

The key difference with the Zotero pane is that the MVZ pane can add variants. 

A variant to a field is added by right-clicking the field name in the left hand column. 

- If the user clicks on a the name of a base field that cannot have variants, then a message is displayed “Variants cannot be added to { $field_name }”.   

- If the user clicks on a the name of a base field that can have variants, a ‘’shortlist’ menu pops up, which has two columns of language and script tags that are defined in the preferences. 
   - This is described in **Shortlist Dropdown Preferences** 
- Clicking on any option immediately opens a variant on the next line if this is the first, or after any existing variants otherwise. 
   - The variant value box (middle column) is is in the same style as the corresponding base field styles described above 
      - For regular fields: 
         - one wide box 
      - For creator fields: 
         - One or two boxes according to the setting of the single name switch 
            - N.B. creator variants do NOT have the right-column buttons shown next to the base field. 
            - The single name switch next to the base field operates on the base field *and all variants*.   
   - To the left of the value box(es) the variant is labelled, under the base field name, and in a smaller font, with: 
      - The language tag selected from the shortlist, right justified
      - The type letter `L` or `S`
- To cancel adding a variant, simply click anywhere outside the popup.  

#### Example (rough sketch) 

|      |                |                               |                 |
| ---- | -------------: | ----------------------------- | --------------: |
|      |      Item Type | **Book**                      |                 |
|      |          Title | **Война и миръ**              |                 |
|      | `und-Latn` `S` | **Voyna i mir**               |                 |
|      |    `en-GB` `L` | **War and Peace**             |                 |
|      |     Author `▼` | **Толстой, Лев Николаевич**   | &#9645; ⊕ ⊖ `…` |
|      | `und-Latn` `S` | **Tolstoy, Lev Nikolayevich** |                 |

- Left column 

   - Major labels: “Item Type”, “Title”, and “Author”: larger font, grey 
   - “Author `▼`” if clicked shows a drop-down ”Editor”, “Contributor”, etc.) 

   - Minor labels: language tags and S/L: smaller font, same grey

- Middle column:
   - Values: black but not bold 

All on a grey background except when a value is selected for editing; then that one is on a white background.  

The buttons on the right of a creator only show when the mouse hovers anywhere over that time. 



## Staying in step with the MVZ *Extra* field tags

Changes to variants in the MVZ pane should be instantly reflected in the Extra field MVZ tags.  

1. As soon as a variant is created in the main pane, a tag key is created, even though the value is empty 
2. As soon as a variant value is added in the main pane, it is added to the MVZ tag 
3. If a variant key is changed in the main pane, the MVZ tag key is updated accordingly 
4. If a variant value is edited in the main pane, the MVZ tag value is updated accordingly 
5. If a variant is deleted
   1. The line on the MVZ item pane is deleted 
   2. Subsequent variants on the main pane (those with higher `v-index` numbers) are renumbered by subtracting one from the `v-index`, so that the `v-index`es remain contiguous 
   3. The corresponding MVZ tag is deleted 
   4. Other MVZ tags for the same base field or creator that have higher `v-index` numbers are also renumbered by subtracting one, so they still correspond to the `v-index` numbersin the MVZ item pane. 

Manual editing in the Extra field is prevented (see **Extra field popup**), but if an item is imported with MVZ tags (from JMZ migration) then the MVZ tag values are reflected in the MVZ item pane. 



## Keeping MVZ in step with the database (and vice versa)

While the user might choose to collapse the native Zotero pane, it is not inactive. In the event that the user uses the Zotero pane to edit base field data, those changes must be immediately reflected in the MVZ Pane. 

Conversely, changes the user makes to base fields in the MVZ Pane must be reflected in the database and the Zotero pane. 

Steps are taken to ensure that no action in either of these panes can disrupt MVZ. 

1. If the user edits the language field in either pane, a popup acts as a guide so that the resulting field is always MVZ compliant. See **Language Popup**. 
2. If the user deletes a creator in either pane a listener ensures that the related variants are brought into line. See **Creator Listener **.    
3. The Extra field is not accessible though the MVZ pane, but if the user edits it directly from the Zotero pane, a listener ensuite that the MVZ tags are preserved. See **Extra Field Listener**.

​    

#  Creator listener 

Appears when the user *deletes* a creator in the Zotero database. 

The popup keeps the MVZ creator tag index numbers linked to the database creator index numbers. 

If a creator $n$ is deleted, the database reduces the index number of all creators with higher number than $n$ by 1, in order to maintain contiguity of indexing. 

The MVZ plugin must listen for this and: 
- delete all the variants of creator[$n$] 
- reduce the index number of all creators with higher numbers than $n$ by 1, in order to maintain the link with the same base creators: creator[$n$+1] –>  creator[$n$], creator[$n$+2] –> creator[$n$+1], etc. 

The listener is invisible to the user unless there is an error (e.g. if the Extra field is corrupted).  

#  Extra field popup

Ensures that the user cannot corrupt MVZ tags by editing them, by hand. 

#### When the user enters the *Extra* field:

1. a popup message appears over the box “Warning: edits to MVZ tags will be ignored”. 
2. The window is locked open, blocking any further action anywhere in the MVZ pane, until the user clicks “Understood”; then
3. The plugin caches all the `mvz/` lines from the Extra field in memory. 
4. The cursor is left in the Extra field where the user put it/   
5. The popup is closed.  

#### When the user leaves the *Extra* field:

1. The plugin reads the raw text currently in the *Extra* field.
2. It strips out any lines beginning with `mvz/`.   
3. It appends the cached `mvz/` tags back onto the end of the remaining raw text.   
4. It saves the combined result to *Extra*. 

#  Language field popup

If the user clicks on or selects the Language field in the Zotero main pane, the MVZ plugin pops up a panel with a common list of languages, which can be edited described below (**Common UI**). 

 

# Preferences

The plugin registers a single root Preference Pane in the Zotero Settings sidebar entitled "MVZ Plugin".

To avoid excessive vertical scrolling, the pane is subdivided internally using a **Tabbed Sub-pane Architecture** (Horizontal Navigation Tabs). 

### Navigation Structure

- **Container Type:** Internal HTML/XHTML view with horizontal tab navigation.
- **Settings Tabs (Sub-panes):**
   1. `[ Target document characteristics ]` 
      - Target document language 
      - Transliteration and translation style preferences 
   2. `[ Field inclusion matrix ]` 
   3. `[ Script and Language drop downs ]` 

#### Implementation Rules 

- **No Native Multi-Pane APIs:** Do NOT attempt to register multiple root sidebar items via `manifest.json`.
- **Dynamic View Switching:** Implement tabs inside the single setting XHTML file (`preferences.xhtml`) using standard CSS/JS event handlers (e.g., hidden/visible `div` sections controlled by a tab-bar menu).
- **Persistence:** The active tab state should default to the `[ Target document ]` tab upon opening preferences.



## Target document characteristics 

### Target document language 

The target language is selected in a single “Target document language” field as described in the section **Common UI** below

By default, it is set to the same value as the Zotero UI language setting. 

If set to something different, it means that the target document will be in a different language to the one driving the UI (for both Zotero and the plugin). 

For technical reasons the MVZ cannot read the document language set in the Word / LibreOffice Zotero extension, because it is not available through Zotero's official API. 

The *Zotero* setting sets the language used for labels within citations, like ‘ed. and ’vol’.   



## Transliteration and translation style preferences 

To keep the architecture simple, MVZ does not use special style sheets. 

Instead, MVZ provides the user with packaged options on how to order, quote, italicise and bracket the combinations of original, transliteration and translation, based on the most commonly used styles.  



The setting pane has a sets of radio buttons. Ordering, Italicisation and Punctuation are selected by example: 

>|      | Radio button (select one) | Option Name | Container item                              | Contained item                             |
>| ---- | ------------------------- | ----------- | ------------------------------------------- | ------------------------------------------ |
>| A    | (●)                       | APA         | *Transliteration* [Translation]             | Transliteration [Translation]              |
>| B    | (  )                      | CMOS        | *Transliteration* Original [Translation]    | "Transliteration" Original [Translation]   |
>| C    | (  )                      | MLA         | Original; *Transliteration* [*Translation*] | Original “Transliteration” [“Translation”] |
>| D    | (  )                      | MHRA        | *Transliteration* Original [Translation]    | 'Transliteration' Original ['Translation'] |
>| E    | (  )                      | Custom      | `<user_template_1>`                         | `<user_template_2>`                        |



A separate setting allows the original to be included or not: 

|      | Radio button (select one) | Option                         |
| ---- | ------------------------- | ------------------------------ |
|      | (●)                       | Include original (base value)  |
|      | (  )                      | Exclude original (base value). |

Note 1: “Include original” does not override a template that has no position for it 

Note 2: If the original is substituted for the Transliteration (because there is no Transliteration) then it will not appear as original as well, regardless of this setting. 

 

### “Container” and “contained” items

- Items are **Contained**: `bookSection`, `journalArticle`, `newspaperArticle`, `magazineArticle`, `encyclopediaArticle`, `dictionaryEntry`, `conferencePaper`, `webPage`, `blogPost`, `forumPost`.
- Items that are **Standalone: `bookTitle`, `publicationTitle`, `encyclopediaTitle`, `dictionaryTitle`, `proceedingsTitle`, `websiteTitle`, `blogTitle`, `forumTitle`.
- The same pattern applies to all fields
- **Creators**: have only one value – the transliterated name if available the original 



### Template syntax

Internally, these are stored as HTML templates, two for each option; one for standalone items and one for contained items. 

The custom option allows the user to enter their own templates.

- `[ ... ]` indicates an optional parameters (omitted entirely if the parameter value is blank). Square brackets inside the option are taken literally. 
- `{ ... }` is one of the parameters `{original}`, `{transliteration}`, `{translation}`
- `<i> ... </i>` indicates italics 
- `<b> ... </b>` indicates bold 
- No other HTML markups are allowed

An optional bracketed group `[...]` evaluates to an empty string if the parameter enclosed within it  `{...}` evaluates to blank. 

Only `<i>...</i>` and `<b>...</b>` HTML tags are permitted in custom templates. All other HTML tags must be stripped or escaped during parsing.

`citeproc.js` handles standard `<i>` and `<b>` tags natively inside standard bibliographic fields, so no special `<span>` mapping is required for basic italics or bold text.



### The templates in full with citation examples

#### American Psychological Association (APA)

##### Container  template

```
<i>{Transliteration}</i>[ [{Translation}]]
```

Note: `{Original}` placement is precluded for APA. 

###### Examples as rendered: 

>1. *Umibe no Kafuka* [Kafka on the Shore]
>2. *Presteplyeniye i Nakazaniye* [Crime and Punishment]
>3. *Alf Laylah wa-Laylah* [One Thousand and One Nights]

##### Contained  template

```
{Transliteration}[ [{Translation}]]
```

###### Examples as rendered: 

>1. “Gendai bungaku no tenkai” [Developments in Contemporary Literature]
>2. “Struktura khudozhestvennogo teksta” [The Structure of the Artistic Text]
>3. “Al-Muqaddimah fi 'ilm al-ijtimā” [Introduction to Sociology]



#### The Chicago Manual of Style (CMOS)

##### Container template

```
<i>{Transliteration}</i>[ {Original}][ [Translation]]
```

###### Examples as rendered with original: 

>1. *Umibe no Kafuka* 海辺のカフカ [Kafka on the Shore]
>2. *Presteplyeniye i Nakazaniye* Преступление и наказание [Crime and Punishment]
>3. *Alf Laylah wa-Laylah* ألف ليلة وليلة [One Thousand and One Nights]

###### Examples as rendered without original: 

>1. *Umibe no Kafuka* [Kafka on the Shore]
>2. *Presteplyeniye i Nakazaniye* [Crime and Punishment]
>3. *Alf Laylah wa-Laylah* [One Thousand and One Nights]

##### Contained (template 2)

```
"Transliteration"[ Original][ [Translation]]
```

###### Examples as rendered with original: 

>1. “Gendai bungaku no tenkai“ 現代文学の展開 [Developments in Contemporary Literature]
>2. “Struktura khudozhestvennogo teksta” Структура художественного текста [The Structure of the Artistic Text]
>3. “Al-Muqaddimah fi 'ilm al-ijtimā'' المقدمة في علم الاجتماع [Introduction to Sociology]

###### Examples as rendered without original: 

>1. “Gendai bungaku no tenkai” [Developments in Contemporary Literature]
>2. 'Struktura khudozhestvennogo teksta' [The Structure of the Artistic Text]
>3. 'Al-Muqaddimah fi 'ilm al-ijtimā'' [Introduction to Sociology]



#### Modern Language Association (MLA)

##### Container (template 1)

```
[Original;][ <i>Transliteration</i>][ [<i>Translation</i>]
```

###### Examples as rendered with original: 

>1. 海辺のカフカ; *Umibe no Kafuka* [*Kafka on the Shore*]
>2. Преступление и наказание; *Presteplyeniye i Nakazaniye* [*Crime and Punishment*]
>3. ألف ليلة وليلة; *Alf Laylah wa-Laylah* [*One Thousand and One Nights*]

###### Examples as rendered with no original: 

>1. *Umibe no Kafuka* [*Kafka on the Shore*]
>2. *Presteplyeniye i Nakazaniye* [*Crime and Punishment*]
>3. *Alf Laylah wa-Laylah* [*One Thousand and One Nights*]

##### Contained (template 2)

```
Original “Transliteration” [“Translation”]
```

###### Examples as rendered with original: 

>1. 海辺のカフカ; “Umibe no Kafuka” [“Kafka on the Shore”]
>2. Преступление и наказание; “Presteplyeniye i Nakazaniye” [“Crime and Punishment”]
>3. ألف ليلة وليلة; “Alf Laylah wa-Laylah” [“One Thousand and One Nights”]

###### Examples as rendered: 

>1. “Umibe no Kafuka” [“Kafka on the Shore”]
>2. “Presteplyeniye i Nakazaniye” [“Crime and Punishment”]
>3. “Alf Laylah wa-Laylah” [“One Thousand and One Nights”]



#### Modern Humanities Research Association (MHRA)

##### Container (template 1)

```
<i>Transliteration</i>[ Original][ [Translation]]
```

###### Examples as rendered with original: 

>1. *Umibe no Kafuka* 海辺のカフカ [Kafka on the Shore]
>2. *Presteplyeniye i Nakazaniye* Преступление и наказание [Crime and Punishment]
>3. *Alf Laylah wa-Laylah* ألف ليلة وليلة [One Thousand and One Nights]

###### Examples as rendered with no original: 

>1. *Umibe no Kafuka* [Kafka on the Shore]
>2. *Presteplyeniye i Nakazaniye* [Crime and Punishment]
>3. *Alf Laylah wa-Laylah* [One Thousand and One Nights]

##### Contained (template 2)

```
'Transliteration'[ Original][ ['Translation']
```

###### Examples as rendered: 

>1. 'Gendai bungaku no tenkai' 現代文学の展開 [Developments in Contemporary Literature]
>2. 'Struktura khudozhestvennogo teksta' Структура художественного текста [The Structure of the Artistic Text]
>3. 'Al-Muqaddimah fi 'ilm al-ijtimā'' [المقدمة في علم الاجتماع] 'Introduction to Sociology’



#### Custom - random example

*Not a real style, just an illustration of further possibilities*!

##### Container template:

`[<b>Transliteration</b>][ (Original)][ [<i>Translation</i>]]`

###### Examples as rendered: 

>1. **Umibe no Kafuka** (海辺のカフカ) [*Kafka on the Shore*]
>2. **Presteplyeniye i Nakazaniye** (Преступление и наказание) [*Crime and Punishment*]
>3. **Alf Laylah wa-Laylah** (ألف ليلة وليلة) [*One Thousand and One Nights*]

##### Contained  template:

` [ 'Transliteration'][ (Original)][ [Translation]]`

###### Examples as rendered: 

>1. 'Gendai bungaku no tenkai' ([現代文学の展開] [Developments in Contemporary Literature]
>2. 'Struktura khudozhestvennogo teksta' (Структура художественного текста) [The Structure of the Artistic Text]
>3. 'Al-Muqaddimah fi 'ilm al-ijtimā' (المقدمة في علم الاجتماع) [Introduction to Sociology]



### Technical Implementation rule for programmer

- The backend engine MUST inject CSL rich-text tags ( `<i>` and `</i>` or  `<b>` and `</b>`) into the intercepted item string before passing it to `citeproc.js`.   
- These are accepted natively; no `<span>` and `</span>` enclosure is required
- No other HTML/XML tags are allowed
- Do NOT generate or register custom `.csl` style files. 



## Field inclusion matrix  

While MVZ Plugin allows variants (translations and transformations) for practically all free text fields, not all institutions or publishers want to see them in citations. For example, many find it unnecessary to translate the name of a publisher, while most will want item title and container title translated. Some want to see the original script field after the transliterated field, some do not.  These citation inclusion preferences allows these choices to be made without having to edit any variants. 

This sub-pane is a table like this. It lists all fields that can have variants (see appendix 1) 

The field names are the UI locale and sorted alphabetically according to the conventions of that language. 

Tick at least one in each row. 

For creators, only one can be ticked.  

| Fields                         | Original  | Transliteration | Translation |
| ------------------------------ | :-------: | :-------------: | :---------: |
| * All creator types (choose 1) |  [    ]   |    [&#9989;]    |   [    ]    |
| Album                          | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Archive                        | [&#9989;] |     [    ]      |   [    ]    |
| Authority                      | [&#9989;] |     [    ]      |   [    ]    |
| Blog Title                     | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Book Title                     | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Case Name                      | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Case Type                      | [&#9989;] |     [    ]      |   [    ]    |
| Code                           | [&#9989;] |     [    ]      |   [    ]    |
| Committee                      | [&#9989;] |     [    ]      |   [    ]    |
| Company                        | [&#9989;] |     [    ]      |   [    ]    |
| Conference  Name               | [&#9989;] |     [    ]      |   [    ]    |
| Court                          | [&#9989;] |     [    ]      |   [    ]    |
| Distributor                    | [&#9989;] |     [    ]      |   [    ]    |
| Dictionary Title               | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Document Name                  | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Edition                        | [&#9989;] |     [    ]      |   [    ]    |
| Encyclopedia Title             | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Format                         | [&#9989;] |     [    ]      |   [    ]    |
| Forum/Listserv Title           | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Genre                          | [&#9989;] |     [    ]      |   [    ]    |
| Institution                    | [&#9989;] |     [    ]      |   [    ]    |
| Jurisdiction                   | [&#9989;] |     [    ]      |   [    ]    |
| Label                          | [&#9989;] |     [    ]      |   [    ]    |
| Loc. in Archive                | [&#9989;] |     [    ]      |   [    ]    |
| Legislative Body               | [&#9989;] |     [    ]      |   [    ]    |
| Medium                         | [&#9989;] |     [    ]      |   [    ]    |
| Name of Act                    | [&#9989;] |     [    ]      |   [    ]    |
| Network                        | [&#9989;] |     [    ]      |   [    ]    |
| Place                          | [&#9989;] |     [    ]      |   [    ]    |
| Post Type                      | [&#9989;] |     [    ]      |   [    ]    |
| Proceedings Title              | [&#9989;] |     [    ]      |   [    ]    |
| Program Title                  | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Publisher                      | [&#9989;] |     [    ]      |   [    ]    |
| Release                        | [&#9989;] |     [    ]      |   [    ]    |
| Report  Type                   | [&#9989;] |     [    ]      |   [    ]    |
| Repository                     | [&#9989;] |     [    ]      |   [    ]    |
| Resol.  Label                  | [&#9989;] |     [    ]      |   [    ]    |
| Series                         | [&#9989;] |     [    ]      |   [    ]    |
| Series Text                    | [&#9989;] |     [    ]      |   [    ]    |
| Series Title                   | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Session Type                   | [&#9989;] |     [    ]      |   [    ]    |
| Short Title                    | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Studio                         | [&#9989;] |     [    ]      |   [    ]    |
| Supp. Name                     | [&#9989;] |     [    ]      |   [    ]    |
| Title                          | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Type                           | [&#9989;] |     [    ]      |   [    ]    |
| University                     | [&#9989;] |     [    ]      |   [    ]    |
| Website Title                  | [&#9989;] |    [&#9989;]    |  [&#9989;]  |
| Website Type                   | [&#9989;] |     [    ]      |   [    ]    |

#### Multiple fields –> one translation

Where a UI name such as (the locale equivalent of) “Title”, “Type” or “Medium” applies to several underlying database fields… 

E.g. 

- `title`, `publicationTitle`
- `itemType`, `letterType`, `manuscriptType`, `mapType`, `presentationType`, `regulationType`, `sessionType``
- ``artworkMedium`, `interviewMedium`, `medium`

… THEN

1. It may only be shown once in this table (no apparent duplicates).
2. the same setting applies all the underlying fields.

This may vary per locale, so must be generated dynamically to provide a user display in alphabetical order with no duplicates that allocates the user preferences to all relevant fields. 

Similar but distinct translations are NOT grouped; so for example

- “Blog  Title”, “Book Title”, “Dictionary Title”, “Encyclopedia Title”, “Forum/Listserv Title”, “Proceedings Title”, “Program Title”, “Series Title”, “Short Title”, “Website Title” are NOT bunded with “Title”
- “Case Type”, “Session Type”, and “Website Type” are NOT bundled with “Type”. 

These examples are based on English, and may vary in other locales, so the list MUST be programmatically generated to 

1. Display an alphabetically ordered list according to the conventions of the locale language
2. Suppress duplicates in the display, but retain the mapping of the UI setting to all related database fields.   

#### Combinations of Original and Transformation 

Some publishers prefer only the transliteration and do not require the original script at all. In that case, tick Transf. but not Orig. However, if the appropriate transliteration variant is not present, the fallback is to the original anyway. 

If Orig. and Trans. are both ticked then the citation engine will attempt to include them both, in the order specified in the style preference sub-pane. 

If Orig. is ticked but Trans. Is not, then the Original will appear as the main part, with no transliteration. 

## Script and language dropdown shortlists 

The preference pane defines the shortlists that are popped up when the user adds or edits a variant. 

The edit pane is similar the shortlist popup itself: 

- Two columns, the left one headed “L-Type”, the right one headed “S-Type”
- Under these headings the list of options added so far, each a BCP-47 code 
   - The column should be wide enough to accommodate a full BCP-47 code with `t-` and `m0-` extensions
- Under that one of the texts: 
   - If no  
   - If there are none yet defined, a text is displayed “to define variant types go to preferences” 
   - If there is one of more in either column, a text is displayed “to edit variant types go to preferences” 

xxx



Unlike Jurism, MVZ uses separate lists, applied to S- or L- type variants. 

They both have the same format and used the Common script/language list described below. 









# Common UI elements

## Script/language list

These are used for: 

- The item language field editor, for each language selected
- The script and language dropdown shortlists, for each row  
- The transliteration model preferences, for each model (grouped by script-script pair) 

In all cases a row in the list comprises a BCP-47 tag and an explanation in the UI language.  

A BCP-47 tag in its complete form comprises:

```
<language>-<script>-<region>-<t>-<Language>-<script>-<region>-<method type>-<method>
```

Which part is mandatory, optional, automatic, or not used at all - depending on which list it is. 

1. The language field editor shows a list of languages in which the source item is written. There will typically be one only row, but multilingual sources are catered for. 
   - Language is mandatory. 
   -   `<script>` is optional and only needed if 
      - The language permits more than one e.g. Chinese can be traditional or simplified (`zh-Hans`, `zh-Hant`); Serbian can be Cyrillic or Latin (`sr-Cyrl`, `sr-Latn`)
      - The item is very unusual in being written in a script not morally used for the language, e.g. a Russian item  entirely transliterated into a latin script would have a `ru-Latn` tag. 
      - In all other cases the script is automatically completed to the default for the language: `en-Latn`, `fr-Latn`, `de-Latn`, `el-Grek`, `ru-Cyrl`, etc.  
   - `<Region>` can be added for documentary purposes or if relevant to translations
   -  The whole `-t-` extension is optional, if relevant at all; it would indicate that the entire item is a transliteration or translation from another item; e.g. an English translation of War and Peace could have a tag `en-Latn-US-t-re-Cyrl-RU`, meaning that it is a US English,  latin script translation of a Russian original (as used in Russia) written in Cyrillic script. 
2. For the script variant dropdown shortlist: 
   - Script is mandatory 
   - Language is only added if 
      - a) there are variations on the script that are language-dependent 
      - b) there might well be different variants in the same script for the same item
   - Region is only added in the unlikely circumstances that scrips and language are still not sufficient (no example comes to mind!)
   - The `-t-` extension is NOT used in this case 
3.   For the language variant dropdown shortlist: 
   -   `<script>` is optional and only needed if 
      - The language permits more than one e.g. Chinese can be traditional or simplified (`zh-Hans`, `zh-Hant`); Serbian can be Cyrillic or Latin (`sr-Cyrl`, `sr-Latn`)
      - The item is very unusual in being written in a script not morally used for the language, e.g. a Russian item  entirely transliterated into a latin script would have a `ru-Latn` tag. 
      - In all other cases the script is automatically completed to the default for the language: `en-Latn`, `fr-Latn`, `de-Latn`, `el-Grek`, `ru-Cyrl`, etc.  
   - `<Region>` can be added for documentary purposes or if relevant to translations
   - The `-t-` extension is NOT used in this case 



In all cases the UI interaction is 

- Displays a list of what is currently selected (if any) 
- “+” button at the bottom to add to the list 
- Drag rows to re-order the list
-  “-” button on each row to delete that row 
- Clicking in the row enables it to be edited

Editing is with the common script/language editor… 



## Script/language tag editor

This common UI spec is used where there is a requirement to edit a single script/language field:    

- The selection of a script for an S- variant 
- The selection of a language for an L-variant 
- The item Language field editor, for each language in the list
- The script dropdown shortlist, for each row   
- The language dropdown shortlist, for each row   

The principle is to always use context-sensitive dropdown lists; i.e. lists that are tailored to items that are allowed AND not already selected in the same list. 

The context lists are generated from a local copy of CLDR/IANA data. 

The tag is built according to BCP-47. 



The dialogue starts with the mandatory items 

1.  In a selection of a script for an S-variant, or editing an item in the script dropdown shortlist 
   - First: **the list of all possible scripts**; select by scrolling or typing  
   - If the user wants to add a language, the list of languages in that script is shown 
   - If the user wants to add a region, the list of regions in the selected script and language is shown 
2. In a selection of a language for an L-variant, or editing an item in the language dropdown shortlist 
   - First: **the list of all possible languages;** select by scrolling or typing 
   - If the user wants to add a region, the list of regions in the selected script and language is shown 
   - If a script is needed (because there is no single default): the list of available scripts for the language
   - If the user wants to add/override a script: the list of all scripts
3. In the selection of a method preference for transliteration 
   - First: for the ‘to’ script:  **the list of all possible scripts**; select by scrolling or typing 
   - Then: for the ‘from’ script:  **the list of all possible scripts** except the ‘to’ script; select by scrolling or typing 
   - Then:  the list of all transliteration methods for the from-script to to-script pair. 
   - If the user wants to add a to/from language: the list of languages for the corresponding to/from script  
   - If the user wants to add a to/from region, the list of regions for the corresponding to/from language 

The UI must prevent adding an L-type (translation) variant for any language tag already listed in the item's `Language` field, or an S-type (transliteration) variant for any script tag matching the explicit or implied script of those item languages. 

### The item Language field cleaner

Zotero allows the Language Field to take any value; it can include more than one language and any kind of description. It is however important for MVZ, that there be just one language, and that it be in BCP 47 format `<language>-{Script}-{REGION}` codes.  - e.g. `es`, `pt-BR`, `en`, `en-US`, `sr-Latn-SR`  

This language code is  essential as a reference for the processing of Jurism variants, so the Language Field must be clean before any variants can be added for the item. 

The Language field should be ‘clean’ if it was created by MVZ or JZM, but might not be the case if the user has just installed the MVZ plugin onto an existing library, or has just imported items from elsewhere. 

Blank counts as ‘clean’, but MVZ will prompt the user to specify a language before a variant is added.   

#### Language field extraction algorithm

##### 1. Normalise punctuation

- Treat commas (`,`), semicolons (`;`), slashes (`/`), and vertical bars (`|`) as explicit hard boundary delimiters. Split the raw string by these delimiters first into primary segments.
- Do **NOT** split on hyphens (`-`), underscores (`_`), or parentheses (`(...)`). These must remain intact within their surrounding words.

###### 2. Split word boundaries  

- Within each primary segment, split whitespace into a sequential list of clean word tokens.

##### 3. Greedy right-to-left windowed matching protocol

Because multi-word language descriptions (like `"Brazilian Portuguese"`) contain spaces, evaluate token sequences using a Greedy Longest-Match First (N-gram Window) algorithm over the sequence of tokens: 

1. Window Sizing: Start with a window size $W = \min(\text{remaining tokens}, 4)$.
2. Match Evaluation:
   - Take the first $W$ adjacent tokens and join them with spaces (e.g., `"Brazilian Portuguese"`).
   - Pass this combined candidate phrase to `langcodes.find()`.
3. If a single token with the hyphen separators (looks like a BCP-47 code) fails, then the Language tag validation reduction algorithm above is applied.  
4. Branching Logic:
   - If `langcodes` succeeds and returns a valid BCP-47 tag:
      - Record the normalized BCP-47 tag (e.g., `pt-BR` or `tr-CY`).
      - Advance the processing position forward by $W$ tokens.
      - Reset $W$ back to the maximum window size (4).
   - If `langcodes` fails:
      - Decrement the window size $W = W - 1$.
      - Repeat step 2 with the smaller candidate phrase (e.g., trying `"Brazilian"` alone).
5. Unrecognised token catchall:
   - If the window size drops to $W = 1$ and `langcodes.find()` still fails (e.g., for `"gobbledegook"` or `"dinglish"`):
      - Log the single token as an Unrecognized Language anomaly  
      - Advance the processing position forward by 1 token.
      - Reset $W$ back to maximum.

#### Worked example 1

Suppose the input is: 

```
gobbledegook fr-FR German dinglish Türkçe (Kıbrıs) it Brazilian Portuguese
```

1. Window 4:` `"`gobbledegook fr-FR German dinglish`" $\rightarrow$Fail
   - Window 3: "`gobbledegook fr-FR German`" $\rightarrow$ Fail
   - Window 2: "`gobbledegook fr-FR`" $\rightarrow$  Fail
   - Window 1: “`gobbledegook`"  $\rightarrow$  Fail
      -  $\rightarrow$ Log anomaly: unrecognised language:  `gobbledegook`. 
      -  Move forward 1 token. 
2. Window 4: "`fr-FR German dinglish Türkçe`" $\rightarrow$ Fail
   - Window 3: "`fr-FR German dinglish`" $\rightarrow$ Fail
   - Window 2: "`fr-FR German`"  $\rightarrow$ Fail
   - Window 1: “`fr-FR`" $\rightarrow$ Success
      -  $\rightarrow$ Output: `fr-FR`. 
      -  No anomaly
      -  Move forward 1 token.
3. Window 4: "`German dinglish Türkçe (Kıbrıs)`" $\rightarrow$ Fail
   - Window 3: "`German dinglish Türkçe`" $\rightarrow$ Fail
   - Window 2: "`German dinglish`" $\rightarrow$ Fail
   - Window 1: "`German`" $\rightarrow$ Success 
      - $\rightarrow$ Output: `de`
      - Log anomaly normalised language 
      - Move forward 1 token.
4. Window 4: “`dinglish Türkçe (Kıbrıs) it` “  $\rightarrow$ Fail
   - Window 3: “`dinglish Türkçe (Kıbrıs)` “  $\rightarrow$ Fail
   - Window 2: “`dinglish Türkçe` “  $\rightarrow$ Fail
   - Window 1: “`dinglish` “  $\rightarrow$ Fail
      - Log anomaly: unrecognised language: `dinglish`. 
      - Move forward 1 token.
5. Window 4: "`Türkçe (Kıbrıs) it Brazilian`” $\rightarrow$ Fail
   - Window 3: "`Türkçe (Kıbrıs) it`” $\rightarrow$ Fail
   - Window 2: "`Türkçe (Kıbrıs)`” $\rightarrow$ Success
      -  $\rightarrow$ Output: `tr-CY`. 
      -  Move forward 2 tokens.
6. Window 3 (only three left): ”`it Brazilian Portuguese` “  $\rightarrow$ Fail
   - Window 2: “`it Brazilian` “  $\rightarrow$ Fail
   - Window 1: “`it` “  $\rightarrow$ Success
      -  $\rightarrow$ Output: `it`.
      -  No anomaly
      -  Move forward 1 token.
7. Window 2 (only two left): "`Brazilian Portuguese`"  $\rightarrow$ Success 
   -  $\rightarrow$ Output: `pt-BR`
   -  Log anomaly normalised language 

#### Final result

Normalised BCP-47 comma-separated list written to the target:`fr-FR, de, tr-CY, it, pt-BR`

This is a long example to illustrate the process; most items will only have one language; some items genuinely have multiple languages but rarely more than three. 




# Backend - the Citation engine

## `citeproc-js` Runtime Interception

* **Hook Location:** Register a middleware hook or wrapper around Zotero’s internal citation data pipeline (`Zotero.Cite.getItemData` / `citeproc.js` data provider).
* **Execution Timing:** Intercept item metadata *after* Zotero fetches the raw item from SQLite, but *before* `citeproc.js` evaluates the CSL style layout.
* **Robustness:** Zotero has no official API for this; the plugin wraps an internal function. At start-up the plugin MUST check that the function exists with the expected form. If not, the citation feature is disabled with a visible warning; the MVZ pane continues to work.

## Citation resolution 

When called by `Zotero.Cite.getItemData` the backend has to return a CSL-JSON structure with an entry for every creator and regular field in the item. 

#### Regular field format example

```
{
  "id": "http://zotero.org/users/123/items/ABC12345",
  "type": "book",
  "title": "Le Petit Prince",
  "publisher": "Gallimard",
  "publisher-place": "Paris",
  "language": "fr"
}
```

#### Creator format if single name switch is off

`lastName` –> “family”; `firstName` –> “given”

```
"author": [
  {
    "family": "Tolstoy",
    "given": "Leo"
  },
  {
    "family": "Dostoevsky",
    "given": "Fyodor"
  }
]
```

#### Creator format if single name switch is on

```
"author": [
  {
    "literal": "Ministry of Foreign Affairs"
  }
]
```



To assemble the CSL-JSON structure, the MVZ backend *potentially* gathers for every Zotero base field 

- an original value 
- a transliteration 
- a translation  

These three values (where applicable) are packed into one CSL-JSON value, in the right order and with punctuation according to the template selected in the MVZ style preferences.  

E.g.   `"title": "<i>Le Petit Prince</i> [The Little Prince]",`

Presumably quotes in the original field or MVZ tag values have to be escaped in the JSON file in the usual way. 

### 1. Preliminary item-level checks 

The first step is to work out whether any transliterations or translations are required at all: 

1. Does the item have a valid *Language* field - i.e. at least one language in BCP-47 format?  
   - If not, then there can be no identifiable transliteration or translation
2.  Does the item *Language* list include the target document language (ignoring regions)? 
   - If so, then no translation is required - the document is already in the target language 
3. Does the item language list include the target document script
   - If so, then no transliteration is required - the document is already in the target script 

N.B. The plugin does not perform field-level language or script detection. Language and script matching for citation inclusion is evaluated strictly at the item level using the item's *Language* field. If any language code in a multi-language item (e.g., `en, ru`) matches the target document language, translation is suppressed for the entire item; if any (explicit or inferred) script code in a multi-language item (e.g., `en-Latn, ru-Cyrl`) matches the target document language, transliteration is suppressed for the entire item.  

#### Examples: 

1. Target document: `el-Grek`, Item language `el` (default `Grek`) 
   - No translation or transliteration required; source and target are both in Greek. 
2. Target document: `de-Latn-DE`, Item language `sh-Hint` 
   - Translation required (from Chinese to German) 
   - Transliteration required (from simplified Chinese to Latin)   
3. Target document: `pt-BR`, Item language `pl-PL` 
   - Translation required (Polish to Portuguese).
   - No transliteration required - they both use Latin script.  

### 2. Finding the variants - regular fields

The next step takes place for every regular field. 

#### 2.1. Transliteration (script variant) for regular fields

1. Is transliteration required, according to the preliminary check? 
   - If not, transliteration component is blank
2. Does the field inclusion matrix require a transliteration for this field? 
   - If not, transliteration component is blank 
3. Otherwise, find the script variant that has the required transliteration  
   - Prioritise a transliteration specifically for the language and target script 
   - Otherwise find a transliteration to `und` (any language) and target script 
   - If more than one variant matches, take the first encountered  
   - If no variant matches, make the transliteration component blank 

#### 2.2. Translation (language variant) for regular fields  

1. Is translation required, according to the preliminary check? 
   - If not, translation component is blank 
2. Does the field inclusion matrix require a translation for this field? 
   - If not, translation component is blank 
3. Otherwise, find the language variant that has the required translation 
   - If the target document preference specifies both language and region: 
      - Prioritise a language and region match first;
      - If none is found, accept a language-only tag for the same language 
      - Otherwise, accept a translation for the same language but a different region 
   - If the target document preference specifies language only: 
      - Prioritise a language-only tag for the same language 
      - Otherwise, accept a translation for the same language and any region  
   - If more than one variant matches, take the first encountered  
   - If no variant matches, make the translation component blank 

#### 2.3. Assembly 

Now there three parts to be assembled into one CSL-JSON field. 

Take the style selection as an HTML template. 

Insert the parameters as described in the preferences section. 

Save the assembled result as the value in the CSL-JSON field.  

Move on to the next item field. 

### 3. Finding the variants - creators

This step takes place for every creator. 

The CSL-JSON structure takes each part of the name separately, so it is not possible to concatenate transliterations and translations. Only one variant can be selected. 

Which variant is required is specified in the field inclusion matrix. 

#### 3.1. Original value for creators 

If the field inclusion matrix specifies that the original value is required

1. The base values are simply copied into the JSON structure. 

#### 3.2. Transliteration for creators 

If the field inclusion matrix specifies that a transliteration is required, find the S-type variant that has the required transliteration:   

1. Prioritise a transliteration specifically for the language and target script 
2. Otherwise find a transliteration to `und` (any language) and target script 
3. If more than one variant matches, take the first encountered 
4. If no S-type variant matches, fall back to a *translation* (L-type) instead, as below 
5. If no variant matches, fall back to the original value  

#### 3.3. Translation for creators

If the field inclusion matrix specifies that a translation is required, find the L-type variant that has the required translation:  

1. If the target document language specified both language and region: 
   - Prioritise a language and region match first;
   - If none is found, accept a language-only tag for the same language 
   - Otherwise, accept a translation for the same language but a different region 
2. If the target document specified only a language: 
   - Prioritise a language-only tag for the same language
   - Otherwise, accept a translation for the same language and any region  
3. If more than one variant matches, take the first encountered
4. If no L-type variant matches, fall back to a *transliteration* (S-type) instead, as above 
5. If still no variant matches, fall back to the original value

### Worked example - selecting transliteration and translation 

#### Example 1 - a Russian book, English citation

##### Inputs

- **Item Type:** `book`
- **Language:** `ru-Cyrl`
- **Title:** Мастер и Маргарита
- **Creators:**
   - [0] Author: `Булгаков || Михаил`
   - [1] Editor: `Булгакова || Елена`

- **Extra**:  

```
mvz/S/title/ru-Latn-alaloc: Master i Margarita
mvz/S/title/ru-Latn-iso9: Master i Margarita
mvz/L/title/en-US: The Master and Margarita
mvz/L/title/de-DE: Der Meister und Margarita
mvz/L/title/it: Il Maestro e Margherita
mvz/L/title/pt: O Mestre e Margarida
mvz/S/creator[0]/Latn-alaloc: Bulgakov || Mikhail
mvz/S/creator[0]/Latn-iso9: Bulgakov || Mihail
mvz/L/creator[0]/en: Bulgakov || Mikhail
mvz/L/creator[0]/de: Bulgakow || Michail
mvz/L/creator[0]/it: Bulgakov || Michail
mvz/L/creator[0]/pt: Bulgákov || Mikhail
mvz/S/creator[1]/Latn-alaloc: Bulgakova || Elena
mvz/S/creator[1]/Latn-iso9: Bulgakova || Elena
mvz/L/creator[1]/en: Bulgakova || Elena
mvz/L/creator[1]/de: Bulgakowa || Jelena
mvz/L/creator[1]/it: Bulgakova || Elena
mvz/L/creator[1]/pt: Bulgakova || Elena
```

##### Scenario 1: Target document en-US 

###### Target Document Prefs:

-  Target Language/Script = `en-Latn-US`
-  Inclusion matrix for creators specifies: `transliteration` 

###### Preliminary checks:

- Target language `en` differs from source item language `ru`, so translations are required where available 
- Target script  `Latn` differs from source item script `Cyrl`, so transliterations are required where available 

###### Citation title:

- Transliteration: 
   - The first encountered transliteration tag is  `mvz/S/title/ru-Latn-alaloc: `
   - The correct title transliteration for `en-US` is: **Master i Margarita**
- Translation: 
   - Searching the variant tags for translation matches we find: `mvz/L/title/en-US` 
   - The Title translation for `en-US` is **The Master and Margarita**.   

###### Author (Creator 0):  

- The preferences require Transliteration: 
   - The first encountered transliteration for creator [0] is `mvz/S/creator[0]/Latn-alaloc:`  
   - The transliterated name is: **Bulgakov || Mikhail**

###### Editor (Creator 1):

- The preferences require Transliteration:
   - The first encountered transliteration for creator [1] `mvz/S/creator[1]/Latn-alaloc:` 
   - The transliterated author is: **Bulgakova || Elena**



#### Example 2: Citing the same item in a German Document

##### Target Document Prefs: 

- Target language: = `de-DE`
- Target script inferred: `Latn`
- Inclusion field preference for creators: `translation` 

##### Title :

- Transliteration: 
   - Matches tag `mvz/S/title/Latn-iso9:`
   - The transliterated title is **Master i Margarita**
- Translation): 
   - Matches `mvz/L/title/de-DE` 
   - The translated title is: **Der Meister und Margarita**   

##### Author (Creator 0):

- The preferences require translation:  
   - Matches `mvz/L/creator[0]/de` 
   - Translated name: **Bulgakow || Michail** 

##### Editor (Creator 1):

- The preferences require translation:  
   - Matches `mvz/L/creator[1]/de` 
   - Translated name: **Bulgakowa || Jelena**



# Internationalisation (I18n)

These rules apply to the MVZ plugin whenever rendering anything visible to the user. 

The MVZ UI language (though described here in English) shall be in the same locale as Zotero. 

Further locales will be obtained by machine translation of the `en-GB` reference locale. 

- The Zotero locale setting shall determine the locale for all MVZ UI text 
- Zotero locale text will be used as far as possible, especially for database field names, so that they exactly; match the names in the Zotero main pane 
- MVZ locale text will be supplied as part of the `.xpi` package, see above. 

## Locale file precedence

MVZ custom text is retrieved from the appropriate `mvz.ftl` file. 

Duplication of database item types, field names, or creator types is prohibited in `mvz.ftl`.

Translation is these elements is strictly only using Zotero's native API 

- e.g. `Zotero.ItemFields.getDisplayName()`). 

### Custom token formation

The AI code generation agents shall infer the required texts, and their parameters where applicable, from this specification and construct the necessary `en-GB` locale. 

Custom tokens are UPPER CASE, formed from a prefix `MVZ_` followed by an hierarchical, underscore-separated, abbreviated identifier reflecting the English text.

## Locale file format and location

Files are structured and located as locale/{locale}/mvz.ftl` in compliance with Zotero’s API for plugins (see **packaging**, above. 

- e.g. `locale/en-GB/mvz.ftl`, `locale/pt-PT/mvz.ftl` 

## Supported languages 

- The MVZ plugin shall ultimately support all the languages that Zotero supports. 
- For alpha-testing, a second language `pt-PT` shall be included, in order to test switching locales.   
- `en-GB` is the original reference language from which all others are translations.  

## Parameter format

Custom messages containing parameters use named positional placeholders according to permitted Fluent syntax e.g., 

> `Field { $field_value } is invalid for { $field_name }`  . 

Hardcoded string concatenation in code is strictly prohibited.  

The direct use of database terms for item types, fields, and creator types is not allowed in MVZ locales, because an MVZ locale translation might not match the translation used in the database locale. These items MUST  themselves be provided as parameters. 

Message template parameters are therefore classified by type. 

The names and types of parameters are defined for the  message token by use of a JSON block inside the `mvx-i18n.js` module; e.g.

```
{
    MVZ_DUPLICATE_VARIANT: { field_name: 'field', language_tag: 'literal' },
		MVZ_BASE_FIELD: { base_field_name: 'field' },
		MVZ_CREATOR_FIELD_LABEL: { this_creator_index: 'index' },
}
```

The key before the colon is the parameter name – an arbitrary name to match the location of the parameter in the template message string, distinguish this parameter from others of the same type, and remind human readers what it is for. Underscore-separate words. 

The quoted value after the colon is the parameter type:  

- Item type in the Zotero database: `'item'`
- Field name in the Zotero database: `'field'`
- Creator type in the Zotero database: `'creator'`
- Literal values `'literal'`  



## Nested token resolution

Used in all cases

1. Message tokens `MVZ_` are keys both 
   - the MVZ locale file `locale/<languiage-key>/mvz,ftl`
   - the parameter type table inside `mvx-i18n.js` . 
2. The value retrieved from the custom MVZ locale is a *message template* – the text in the selected language with placeholder for parameters, as described above. 
3. Parameter translation: 
   - If the parameter is of type `'literal'`  or `'index'` 
      - The parameter value is inserted directly into the message at the { $param_name } placeholder. 
   - For database elements (all the others) 
      - Form a prefix as follows, based on the parameter type above, *with exact capitalisation, pluralisation, and a dot*, as written, to make the database locale key 
         - `'item'` -–>  `itemTypes.`
         - `'field'` --> `itemFields.`
         - `'creator'` –> `creatorTypes.`
      - This is then concatenated with the parameter *value* to make the locale key. 
         - Example: parameter `{ $this_field }` has type ‘field’. 
            1. With parameter `websiteTitle` it would form the Zotero locale key `itemFields.websiteTitle`, 
            2. The Zotero local file resolves that key to “Website Title”
            3. That text is inserted into the message string in place of `{ $this_field }` 



-----

   

# Appendix 1 - MVZ i18n message tokens

Parameters, if applicable, are shown in single curly brackets `{…}`. 

The parameter names, prefixed with “$”, mark the insertion points in the message templates retrieved from the MVZ locale file.

**Parameter naming rule:** in compliance with the suite internationalisation requirements – see **Nested token resolution**. 

Note that quotation marks in message templates are to be rendered directly into the message as written; they have no syntactical meaning.   



*<u>Note</u>*: the following consists only of illustrative examples. 

The AI Agent will infer all required messages and their parameters from this specification and complete the `.json` locale file and the message type lookup table.   



| Token                   | Message template `en-GB`                                     | Notes                                                        |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `MVZ_DUPLICATE_VARIANT` | Error: Field “{ $field_name }” already has a variant for “{ $language_tag }” | Example of a pop-up error message with quotes                |
| `MVZ_BASE_FIELD`        | { $base_name }                                               | Example of an MVZ placeholder that actually has no custom text at all; it indicates that this message is just a database element name; that is all that is needed to label a base field. |
| `MVZ_VARIANT`           | { $language_tag }                                            | Example of an MVZ placeholder that actually has no custom text at all; this message is just a fixed value (a language code), which is all that is needed to identify a base field variant. |



# Appendix 2 - the database fields that can have variants in MVZ

“Can have variants?”: 

- “Yes” = Appear in the Zotero pane (base value), AND in the MVZ Pane (tag value).  
- “No” = Appear in the Zotero pane (base value), but not in the MVZ Pane (value is not translatable text). 
- “N/a” = Do not appear in either the Zotero pane or the MVZ Pane.  

The list below accounts for all the ‘Item fields’ mentioned in the Jurism en.GB  locale file. Those marked ‘N/a’ are not real item fields at all; they do not show up in the UI as fields, so also have no variants.  

If in doubt about a field, ask the developer test on a live Jurism database for a definite answer. 



| itemField            | UI name en-GB        | Can have variants? | Notes                                                        |
| -------------------- | -------------------- | :----------------: | ------------------------------------------------------------ |
| –                    | * All creator types  |        Yes         |                                                              |
| abstractNote         | Abstract             |         No         |                                                              |
| accessDate           | Accessed             |         No         |                                                              |
| adminFlag            | Admin Flag           |         No         |                                                              |
| adoptionDate         | Date Adopted         |         No         |                                                              |
| album                | Album                |        Yes         |                                                              |
| applicationNumber    | Application Number   |         No         |                                                              |
| archive              | Archive              |        Yes         |                                                              |
| archiveCollection    | Archive Coll.        |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| archiveID            | Archive  ID          |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| archiveLocation      | Loc. in Archive      |        Yes         |                                                              |
| artworkMedium        | Medium               |        Yes         |                                                              |
| artworkSize          | Artwork Size         |         No         |                                                              |
| assemblyNumber       | Assy.  No.           |         No         |                                                              |
| assignee             | Assignee             |         No         |                                                              |
| attachmentPDF        | PDF  Attachment      |         No         | System field                                                 |
| attachments          | Attachments          |         No         | System field                                                 |
| audioFileType        | File Type            |         No         |                                                              |
| audioRecordingFormat | Format               |        Yes         |                                                              |
| billNumber           | Bill Number          |         No         |                                                              |
| billOrDocumentNumber | Bill/Doc. No.        |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| blogTitle            | Blog  Title          |        Yes         |                                                              |
| bookAbbreviation     | Book Abbr.           |         No         |                                                              |
| bookTitle            | Book Title           |        Yes         |                                                              |
| callNumber           | Call Number          |         No         |                                                              |
| caseName             | Case Name            |        Yes         |                                                              |
| citationKey          | Citation Key         |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| code                 | Code                 |        Yes         |                                                              |
| codeNumber           | Code Number          |         No         |                                                              |
| codePages            | Code  Pages          |         No         |                                                              |
| codeVolume           | Code Volume          |         No         |                                                              |
| committee            | Committee            |        Yes         |                                                              |
| committeeFullname    | Committee            |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| company              | Company              |        Yes         |                                                              |
| conferenceDate       | Conf. Date           |         No         |                                                              |
| conferenceName       | Conference  Name     |        Yes         |                                                              |
| country              | Country              |         No         |                                                              |
| court                | Court                |        Yes         |                                                              |
| date                 | Date                 |         No         |                                                              |
| dateAdded            | Date Added           |         No         |                                                              |
| dateAmended          | Date Amended         |         No         |                                                              |
| dateDecided          | Date Decided         |         No         |                                                              |
| dateEnacted          | Date Enacted         |         No         |                                                              |
| dateModified         | Modified             |         No         |                                                              |
| distributor          | Distributor          |        Yes         |                                                              |
| dictionaryTitle      | Dictionary Title     |        Yes         |                                                              |
| division             | Division             |         No         |                                                              |
| docketNumber         | Docket Number        |         No         |                                                              |
| documentName         | Document Name        |        Yes         |                                                              |
| documentNumber       | Document Number      |         No         |                                                              |
| DOI                  | DOI                  |         No         |                                                              |
| edition              | Edition              |        Yes         |                                                              |
| effectiveDate        | Date In Force        |         No         |                                                              |
| encyclopediaTitle    | Encyclopedia Title   |        Yes         |                                                              |
| episodeNumber        | Episode Number       |         No         |                                                              |
| extra                | Extra                |         No         |                                                              |
| filingDate           | Filing Date          |         No         |                                                              |
| firstPage            | First Page           |         No         |                                                              |
| forumTitle           | Forum/Listserv Title |        Yes         |                                                              |
| gazetteFlag          | Gazette Ref          |         No         |                                                              |
| genre                | Genre                |        Yes         |                                                              |
| history              | History              |         No         |                                                              |
| institution          | Institution          |        Yes         |                                                              |
| interviewMedium      | Medium               |        Yes         |                                                              |
| ISBN                 | ISBN                 |         No         |                                                              |
| ISSN                 | ISSN                 |         No         |                                                              |
| issue                | Issue                |         No         |                                                              |
| issueDate            | Issue  Date          |         No         |                                                              |
| issuingAuthority     | Issuing Authority    |         No         |                                                              |
| itemType             | Type                 |         No         |                                                              |
| journalAbbreviation  | Journal Abbr.        |         No         |                                                              |
| jurisdiction         | Jurisdiction         |        Yes         |                                                              |
| label                | Label                |        Yes         |                                                              |
| language             | Language             |         No         |                                                              |
| legalStatus          | Legal Status         |         No         |                                                              |
| legislativeBody      | Legislative Body     |        Yes         |                                                              |
| letterType           | Type                 |        Yes         |                                                              |
| libraryCatalog       | Library Catalogue    |         No         |                                                              |
| manuscriptType       | Type                 |        Yes         |                                                              |
| mapType              | Type                 |        Yes         |                                                              |
| medium               | Medium               |        Yes         |                                                              |
| meetingName          | Meeting  Name        |         No         |                                                              |
| meetingNumber        | Meeting No.          |         No         |                                                              |
| nameOfAct            | Name of Act          |        Yes         |                                                              |
| network              | Network              |        Yes         |                                                              |
| newsCaseDate         | Case Date            |         No         |                                                              |
| notes                | Notes                |        N/a         | Just a tab header                                            |
| number               | Number               |         No         |                                                              |
| numberOfVolumes      | # of Volumes         |         No         |                                                              |
| numPages             | #  of Pages          |         No         |                                                              |
| openingDate          | Date Opened          |         No         |                                                              |
| opus                 | Opus No.             |         No         |                                                              |
| originalDate         | Orig. Date           |         No         |                                                              |
| pages                | Pages                |         No         |                                                              |
| parentTreaty         | Parent Treaty        |         No         |                                                              |
| patentNumber         | Patent Number        |         No         |                                                              |
| place                | Place                |        Yes         |                                                              |
| postType             | Post Type            |        Yes         |                                                              |
| presentationType     | Type                 |        Yes         |                                                              |
| priorityDate         | Priority Date        |         No         |                                                              |
| priorityNumbers      | Priority Numbers     |         No         |                                                              |
| proceedingsTitle     | Proceedings  Title   |        Yes         |                                                              |
| programmingLanguage  | Prog. Language       |         No         |                                                              |
| programTitle         | Program Title        |        Yes         |                                                              |
| publicationDate      | Date Published       |         No         |                                                              |
| publicationNumber    | Publication  No.     |         No         |                                                              |
| publicationTitle     | Title                |        Yes         |                                                              |
| publicLawNumber      | Public Law Number    |         No         |                                                              |
| publisher            | Publisher            |        Yes         |                                                              |
| references           | References           |         No         |                                                              |
| regnalYear           | Regnal Year          |         No         |                                                              |
| regulationType       | Type                 |         No         |                                                              |
| regulatoryBody       | Authority            |        Yes         |                                                              |
| reign                | Case Type            |        Yes         |                                                              |
| related              | Related              |        N/a         | Just a tab header                                            |
| release              | Release              |        Yes         |                                                              |
| reporter             | Reporter             |         No         |                                                              |
| reporterVolume       | Reporter Volume      |         No         |                                                              |
| reportNumber         | Report Number        |         No         |                                                              |
| reportType           | Report  Type         |        Yes         |                                                              |
| repository           | Repository           |        Yes         |                                                              |
| resolutionLabel      | Resol.  Label        |        Yes         |                                                              |
| rights               | Rights               |         No         |                                                              |
| runningTime          | Running Time         |         No         |                                                              |
| scale                | Scale                |         No         |                                                              |
| section              | Section              |         No         |                                                              |
| series               | Series               |        Yes         |                                                              |
| seriesNumber         | Series  Number       |         No         |                                                              |
| seriesText           | Series Text          |        Yes         |                                                              |
| seriesTitle          | Series Title         |        Yes         |                                                              |
| session              | Session              |         No         |                                                              |
| sessionType          | Session  Type        |        Yes         |                                                              |
| shortTitle           | Short Title          |        Yes         |                                                              |
| signingDate          | Date Signed          |         No         |                                                              |
| source               | Source               |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| status               | Status               |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| studio               | Studio               |        Yes         |                                                              |
| subject              | Subject              |        N/a         | Does not exit in UI, only Extra. <br />Extra can have variants |
| supplementName       | Supp. Name           |        Yes         |                                                              |
| system               | System               |         No         |                                                              |
| tags                 | Tags                 |        N/a         | Internal system field                                        |
| thesisType           | Type                 |        Yes         |                                                              |
| title                | Title                |        Yes         |                                                              |
| treatyNumber         | Treaty Number        |         No         |                                                              |
| university           | University           |        Yes         |                                                              |
| url                  | URL                  |         No         |                                                              |
| version              | Version              |        N/a         | Internal system field                                        |
| versionNumber        | Version              |         No         |                                                              |
| videoRecordingFormat | Format               |        Yes         |                                                              |
| volume               | Volume               |         No         |                                                              |
| volumeTitle          | Volume Title         |         No         | Surprisingly                                                 |
| websiteTitle         | Website Title        |        Yes         |                                                              |
| websiteType          | Website Type         |        Yes         |                                                              |
| yearAsVolume         | Year As Vol.         |         No         |                                                              |



# Appendix 3 - MVZ Tags

MVZ tags are used to store, in the *Extra* field, the values of the variants entered via the MVZ pane. 

## The Extra field

The ‘Extra’ field is a general purpose field provided by Zotero for data that does not have a location the database. It is typically used by and for third-party extensions and plugins like *Better BibTeX*. 

One line represents one tag.  

Native Zotero and CSL tags use the <key>: <value> format. 

Zotero's citation engine and internal parsers look for such structural line formats. Anything that doesn't fit a recognised pattern is treated as unparsed text. 

MVZ tags also use this format, but the `mvz/` prefix ensures that they will be unknown to, and therefore ignored by Zotero. 

### Maximum size

The Zotero **Extra** field does not have a explicit character limit. 

Internally, Zotero stores regular item metadata fields—including `extra`—as text inside SQLite (`itemDataValues` table). SQLite text fields can theoretically hold up to 1 GB of data. 

It is therefore not necessary to check tag length before writing; but 9as always) any database exception that arises when writing this (or any) field should be flagged as an error in a popup window.    

### Preservation Rule

If the Extra field contains text from other programs (meaning any line NOT starting `mvz/`), that must be preserved exactly as written. 

The MVZ plugin shall append the `mvz/` tags after the existing content. It shall ensure the existing string ends with exactly one trailing newline (`\n`) before appending generated tags. Do not create or leave blank lines (consecutive newlines). 

The MVZ plugin may edit or delete its own tags (`mvz/…`) but may not edit or delete any others. 

The user may edit the Extra field, but changes to the mvz tags will be ignored (see **Extra field popup**, above) 

## MVZ tag syntax 

1. Each tag is a Key-Value pair occupying one line in the *Extra* field
   - every tag ends strictly with \n (newline). 
2. Key-Value Separator: 
   - Formatted strictly as `<key>: <value>` (colon followed by a single space). 
3. Keys are case-sensitive. 
4. No escaping in the `<value>`: 
   - Use literal text with all spaces and special characters preserved until the end of the line, with no 'escaping' or substitutions e.g. `Title: Interest % rates & House Prices in sector #6: Part 1 - updated`  
   - Values containing internal line breaks (such as raw text notes) must have internal newlines replaced with spaces or plain-text placeholders prior to tag creation, ensuring every tag strictly occupies exactly one line. 

MVZ tag keys are constructed in five parts, separated by slashes (/): 

1. The prefix `mvz/`
2. The variant base (camelCase)
3. The variant index (a number)
4. The variant type `L/` or `S/` (upper case)
5. The variant suffix (BPC-47 case)

### The variant base

Each MVZ tag represents one variant associated with a regular field or a creator in the database, called the base. The base part of the tag specifies the specific database item of which this tag is a variant.  

- For regular field variants, the base is the `camelCase` name of the field in the database, e.g. `originalTitle` 

- For creator variants, the body is the word “creator” and the creator database index number, enclosed square brackets, e.g. `creator[0]`. 

### The variant index

The variants for a particular base are numbered consecutively, starting from 0, so that an unambiguous match can be made between the variant in the MVZ pane and the corresponding MVZ tag. 

The variant index (also called `v-index`, to distinguish it from a creator index or `c-index`) it contiguous, so if a variant is deleted the numbering of variant with higher index number is adjusted.  

### The variant type

The MVZ tag type is one of 

- `L/`: **L-type** (Language): represents a semantic translation of the item into the specified language.
- `S/`: **S-type** (Script): represents a script conversion into the specified script without changing the underlying semantics

### The variant suffix

The suffix is any valid BCP 47 code (selected from the drop-down shortlist defined in the MVZ Plugin preferences): 

- language: lower case
- REGION: upper case
- Script: title case 
- Others: lower case 

The minimum for an L-type variant is the language; the minimum for an S-type variant is the script; either may optionally have other fields: e.g. to specify a particular (non-default) script for a language, a specific language variation of a script, or a specific region.   

`t0-` and `m0-` extensions are also optional. They might have documentary value for the user, but have no semantic meaning in the current release of MVZ. MVZ preserves these extensions, but does not act upon them. They might be used in future releases, e.g. to differentiate between transliteration methods.  

### MVZ tag examples

N.B. these example are purely to illustrate the tags; they do not necessarily represent any real item or user intentions!  

#### Example 1 - Russian Journal article 

**Item Type:** `journalArticle`

**Title:** `Количественные методы исследований в общественных науках`

**Publication (Journal):** `Международный журнал социологических исследований`

**Publisher:** `Издательство Наука`

**Place:** `Москва`

**Language:** `ru` 

**Variants:** 

```
mvz/title/0/L/el: Ποσοτικές μέθοδοι έρευνας στις κοινωνικές επιστήμες
mvz/title/1/L/sr-Latn: Kvantitativne metode istraživanja u društvenim naukama
mvz/title/2/L/hi-Deva: सामाजिक विज्ञान में मात्रात्मक अनुसंधान विधियां
mvz/title/3/S/ru-Latn-t-ru-Cyrl: Kvantitativnye metody issledovanii v obshchestvennykh naukakh
mvz/title/4/S/zh-Latn-t-zh-Hant-m0-pinyin: Guoji Shehuixue Yanjiu Qikan
mvz/publicationTitle/0/L/fr-FR: Revue Internationale de Recherches Sociologiques
mvz/publicationTitle/1/S/zh-Hant-TW: 國際社會學研究期刊
mvz/publicationTitle/2/S/ru-Cyrl: Международный журнал социологических исследований
mvz/publicationTitle/3/L/zh-Hant: 國際社會學研究雜誌
mvz/publicationTitle/4/S/hi-Latn-t-hi-deva: Antarrashtriya Samajshastra Anusandhan Patrika
mvz/publisher/0/L/zh-Hans: 科学出版社
mvz/place/0/L/pt-BR: Moscou
```

#### Example 2 - A Chinese book

It is unlikely that a user will want this many options – but it illustrates the way the tags work if any does! 

- **Item Type:** `book`
- **Title:** `红楼梦` (*Dream of the Red Chamber*)
- **Publisher:** `人民文学出版社` (*People's Literature Publishing House*)
- **Place:** `北京` (*Beijing*)
- **Language:** `zh-Hans`

```
mvz/title/0/S/zh-Latn-t-zh-Hans-m0-bgn: Honglou Meng
mvz/title/1/S/zh-Latn-t-zh-Hans-m0-pinyin: Hónglóu Mèng
mvz/title/2/S/zh-Latn-t-zh-Hans-m0-iso: Khunloumėn
mvz/title/3/S/zh-Latn-t-zh-Hans-m0-wadegile: Hung Lou Mêng
mvz/title/4/L/en: Dream of the Red Chamber
mvz/title/5/L/fr: Le Rêve dans le pavillon rouge
mvz/title/6/L/de: Der Traum der Roten Kammer
mvz/title/7/L/pt: Sonho da Câmera Vermelha
mvz/title/8/L/pt-BR: O Sonho da Câmara Vermelha
mvz/title/9/S/zh-Cyrl-t-zh-Hans: Хунлоумэн
mvz/title/10/S/zh-Cyrl-t-zh-Hans-m0-palladius: Хунлоумэн
mvz/title/11/L/ru: Сон в красном тереме
mvz/title/12/S/zh-Grek-t-zh-Hans-m0-iso: Χουνγκ-λόου-μενγκ
mvz/title/13/S/zh-Grek-t-zh-Hans-m0-pinyin: Χονγκ-λού-μενγκ
mvz/title/14/L/el: Το Όνειρο της Κόκκινης Cάμαρας
mvz/title/15/S/zh-Hans: 红楼梦
mvz/title/16/S/zh-Hant-t-zh-Hans: 紅樓夢
mvz/title/17/S/zh-Hant-HK-t-zh-Hans: 紅樓夢
mvz/title/18/S/zh-Hant-t-zh-Hans-m0-unihan: 紅樓夢
mvz/title/19/S/zh-Deva-t-zh-Hans: होंगलौ मेंग
mvz/title/20/S/zh-Deva-t-zh-Hans-m0-pinyin: होंगलौ मेंग
mvz/title/21/L/hi: ड्रीम ऑफ द रेड चैंबर
mvz/title/22/S/zh-Hans-t-zh-Hant-m0-unihan: 红楼梦
mvz/title/23/S/zh-Hans-t-zh-Hant-m0-gb2312: 红楼梦
mvz/title/24/S/zh-Hans-t-zh-Hant-m0-tongyong: 红楼梦
mvz/publicationTitle/0/L/en: Dream of the Red Chamber
mvz/publisher/0/S/zh-Hans-t-zh-Hant-m0-unihan: 人民文学出版社
mvz/publisher/1/S/zh-Hans-t-zh-Hant-m0-gb2312: 人民文学出版社
mvz/publisher/2/S/zh-Hans-t-zh-Hant-m0-tongyong: 人民文学出版社
mvz/publisher/3/S/zh-Deva-t-zh-Hans-m0-pinyin: रेनमिन वेनक्स्यू चुबांशे
mvz/publisher/4/L/en: People's Literature Publishing House
mvz/publisher/5/L/ru: Издательство Народная Literatura
mvz/publisher/6/L/el: Εκδόσεις Λαϊκής Λογοτεχνίας
mvz/publisher/7/L/hi: पीपुल्स लिटरेचर पब्लिशिंग हाउस
mvz/publisher/8/S/zh-Latn-t-zh-Hans-m0-pinyin: Rénmín Wénxué Chūbǎnshè
mvz/publisher/9/S/zh-Latn-t-zh-Hans-m0-wadegile: Jen Min Wên Hsüeh Ch'u Pan Shê
mvz/publisher/10/S/zh-Latn-t-zh-Hans-m0-bgn: Renmin Wenxue Chubanshe
mvz/publisher/11/S/zh-Hans: 人民文学出版社
mvz/publisher/12/S/zh-Cyrl-t-zh-Hans: Жэньминь вэньсюэ чубаньшэ
mvz/publisher/13/S/zh-Cyrl-t-zh-Hans-m0-palladius: Жэньминь Вэньсюэ Чубаньшэ
mvz/publisher/14/S/zh-Latn-t-zh-Hans-m0-bgn: Renmin Wenxue Chubanshe
mvz/publisher/15/S/zh-Grek-t-zh-Hans: Ρεν-μίν Ουέν-σιουέ Τσου-μπαν-σέ
mvz/publisher/16/S/zh-Hant-t-zh-Hans: 人民文學出版社
mvz/publisher/17/S/zh-Hant-HK-t-zh-Hans: 人民文學出版社
mvz/publisher/18/S/zh-Deva-t-zh-Hans: रेनमिन वेनक्स्यू चुबांशे
mvz/publisher/19/S/zh-Latn-t-zh-Hans-m0-pinyin: Rénmín Wénxué Chūbǎnshè
mvz/publisher/20/S/zh-Latn-t-zh-Hans-m0-wadegile: Jen Min Wên Hsüeh Ch'u Pan Shê
mvz/publisher/21/S/zh-Cyrl-t-zh-Hans-m0-palladius: Жэньминь Вэньсюэ Чубаньшэ
mvz/publisher/22/S/zh-Cyrl-t-zh-Hans-m0-iso: Zhėnʹminʹ Vėnʹsiuė Chubanʹshė
mvz/publisher/23/S/zh-Grek-t-zh-Hans-m0-pinyin: Ρεν-μίν Ουέν-σιουέ Τσου-μπαν-σέ
mvz/publisher/24/S/zh-Grek-t-zh-Hans-m0-iso: Τζεν-μιν Ουέν-σιουέ Τσου-παν-σε
mvz/publisher/25/S/zh-Hant-t-zh-Hans-m0-unihan: 人民文學出版社
mvz/publisher/26/L/fr: Éditions de la Littérature du Peuple
mvz/publisher/27/L/de: Verlag für Volksliteratur
mvz/publisher/28/L/pt: Editora de Literatura do Povo
mvz/publisher/29/L/pt-BR: Editora de Literatura do Povo
mvz/place/0/S/zh-Hans-t-zh-Hant-m0-gb2312: 北京
mvz/place/1/S/zh-Deva-t-zh-Hans-m0-pinyin: बीजिंग
mvz/place/2/L/fr: Pékin
mvz/place/3/L/en: Beijing
mvz/place/4/L/de: Peking
mvz/place/5/L/pt: Pequim
mvz/place/6/L/pt-BR: Pequim
mvz/place/7/L/ru: Пекин
mvz/place/8/S/zh-Hans-t-zh-Hant-m0-unihan: 北京
mvz/place/9/S/zh-Hans-t-zh-Hant-m0-tongyong: 北京
mvz/place/10/L/el: Πεκίνο
mvz/place/11/S/zh-Hans: 北京
mvz/place/12/L/hi: बीजिंग
mvz/place/13/S/zh-Latn-t-zh-Hans-m0-pinyin: Běijīng
mvz/place/14/S/zh-Latn-t-zh-Hans-m0-wadegile: Pei Ching
mvz/place/15/S/zh-Latn-t-zh-Hans-m0-bgn: Beijing
mvz/place/16/S/zh-Cyrl-t-zh-Hans: Бейцзин
mvz/place/17/S/zh-Cyrl-t-zh-Hans-m0-palladius: Пекин
mvz/place/18/S/zh-Grek-t-zh-Hans: Πεκίνο
mvz/place/19/S/zh-Hant-t-zh-Hans: 北京
mvz/place/20/S/zh-Hant-HK-t-zh-Hans: 北京
mvz/place/21/S/zh-Deva-t-zh-Hans: बीजिंग
mvz/place/22/S/zh-Latn-t-zh-Hans-m0-pinyin: Běijīng
mvz/place/23/S/zh-Latn-t-zh-Hans-m0-wadegile: Pei Ching
mvz/place/24/S/zh-Latn-t-zh-Hans-m0-bgn: Beijing
mvz/place/25/S/zh-Cyrl-t-zh-Hans-m0-palladius: Пекин
mvz/place/26/S/zh-Cyrl-t-zh-Hans-m0-iso: Beĭtszin
mvz/place/27/S/zh-Grek-t-zh-Hans-m0-pinyin: Πεκίνο
mvz/place/28/S/zh-Grek-t-zh-Hans-m0-iso: Πέι-τσιγνγκ
mvz/place/29/S/zh-Hant-t-zh-Hans-m0-unihan: 北京
```




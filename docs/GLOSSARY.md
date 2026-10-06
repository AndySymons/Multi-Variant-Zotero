# MVZ Suite Glossary

Draft 9

Andrew Symons 

04-Oct-26



[toc]



-----

# Introduction 

This document defines the rules for the use of written (human) language in all the documents in the MVZ suite.

It explains the use of abbreviations and mnemonics, and meanings to certain words that are to be understood in a way more specific than in general English use.  



# British English language rules

The language following rules apply to all documents in this suite (workspace), the error log, and the CLI.   

The principal language is British English (en-GB). 

There is no difference in meaning from other regional variations such as US English (en-US), only in spelling: e.g. ‘Specialised’ means exactly the same as ’Specialized’.  

When documents for other programs written in American English (en-US) are cited, the original language is used: no translation en-US to en-GB is required!

Database Field names and identifiers, and variables used in programs are of course quoted exactly as they are used in the software.

# Notation

- UPPER CASE words separated by underscores: 
   - *tokens* (locale tokens).
- Lower case words separated by underscores: 
   - physical file names
- Lower case words separated by hyphens: 
   - *Extra* tag keys
- `{{name}}`: a parameter insertion point in a message template.

# Abbreviations and mnemonics

For the avoidance of ambiguity, here follows the exact meaning of the abbreviations and mnemonics used in this document. 

| Abbreviation | Stands for …                         | Explanation                                                  |
| ------------ | ------------------------------------ | ------------------------------------------------------------ |
| BCP 47       | Best Current Practice 47             | The IETF standard that defines the format for identifying human languages and locales using IETF Language Tags. |
| CLI          | Command Line Interface               | The appearance of the extractor in the Terminal app.         |
| CNE          | Cite-Non-English                     | A Zotero plug-in to support alternative Languages and Scripts in Zotero |
| CSL          | Citation Style Language              | System of tags used to drive citations in Zotero             |
| IETF         | Internet Engineering Task Force      | A body that creates standards for the internet such as BCP 47. |
| ISO          | International Standards Organisation | A body that creates general standards such as ISO 639 - a Standardised nomenclature used to classify human languages, which is incorporated into BCP 47. |
| HTML         | Hypertext Markup Language            | The standard markup language for documents designed to be displayed in a web browser. Used by Jurism/Zotero to display note attachments, and in the anomalies management Dashboard to define the dashboard layout. |
| JS           | JavaScript                           | An interpreted programming language mostly used as the scripting language for web pages. |
| JSON         | JavaScript Object Notation           | A text-based format used to describe structured data. Used here particularly for encoding schemas maps, and lookup tables. |
| Juris-M      | –                                    | The original name of Jurism, changed to ‘Jurism’ at release 5. |
| Jurism       | –                                    | A fork of (program based on) Zotero, adding multilingual and judicial features. |
| JZM          | Jurism to Zotero Migration           | The name for the overall Jurism-to-Zotero Migration project: the GitHub site and the full set of programming components and documentation, of which the JZM Extractor is a major part. |
| MVZ          | Multi-Variant Zotero                 | a Zotero plugin produced as part of this suite of programs   |
| RDF          | Resource Description Framework       | In this case, the specific version required by Zotero for import. |
| UI           | User Interface                       | Description of a program as the user sees it.                |
| Zotero       | –                                    | A program for storing details of objects such as books, journal articles, films etc. (assisted by browser extensions), and automatically generating citations in WORD or LibreOffice documents. |



# Terminology specific to this suite 

The following terms have specific meanings within the MVZ suite that are narrower and more specific than their general IT or everyday English usage. 

In case of ambiguity, use of a term is to be clarified with the document author before proceeding.   

| Term                     | Meaning in this suite of documents                           |
| ------------------------ | ------------------------------------------------------------ |
| Anomaly                  | A situation in which a Jurism object does not have a direct equivalent in Zotero; the value is transformed and/or stored somewhere else and the details reported to the User. |
| Anomaly number           | A short, unique identifier `Annnn` for each anomaly token, used to group anomalies of the same type in the dashboard. See `CONTRACT_ANOMALIES.md`. |
| Base Field               | A field on which one or more variants may exist              |
| c-index                  | Creator index. The index number (starting at 0) that links creator variants to the specific creator in the database (for the current item). |
| Catch                    | A defensive coding technique paired with a ‘try’ that captures details of the error rather than allowing the program to crash. |
| Citation                 | The detailed reference to a source (Item) that is generated in a document by Jurism or Zotero (the main objective of these programs). |
| Citation Style           | A digital representation of the rules for making a citation, used by the citation modules of Jurism and Zotero. |
| Collection               | A user-defined selection of Items in a Jurism or Zotero Library. |
| Container / Contained    | CSL concept. A *contained* item (e.g. book chapter, journal article) is part of a *container* (book, journal). Container titles are typically italicised; contained titles are typically quoted. |
| Creator                  | Person associated with an Item – author, producer, editor, translator etc. |
| Creator Type             | The specific type of a Creator – author, producer, editor, translator etc. |
| Developer                | The (human) person or persons creating and maintaining the MVZ suite. The AI Agent acts as programmer and takes its instructions from the developer. |
| Embedded notes           | A facility in Jurism 6 (based on Zotero 6) to include “Notes” inside a child item.  This is deprecated in Zotero 10, so embedded notes are migrated to new ordinary notes “Note” - a separate child item that is Related to the child it came from. |
| Extra                    | A specific field in the Jurism and Zotero databases into which custom tags can be written. |
| Extra tag                | A key-value pair written into the Zotero *Extra* field in text form separated by a colon and a space. |
| Extractor                | The JZM extractor program.                                   |
| Field                    | A Jurism or Zotero field in the database, or as presented on the screen. |
| GitHub                   | A cloud-based web platform for software code sharing and collaborative development. |
| Home Directory           | The computer directory in which the manifest is located, and relative to which the manifest defines the location of all *runtime* input and output files. Specification documents and test programs are kept outside of this directory (see “workspace”). |
| Item                     | An object in a Jurism or Zotero library, indicated by an item type - book, journal article, film etc. |
| Item reference           | A plain-text identification of an item for the user, similar to a simple citation: up to two authors, the title and the year, e.g. `Smith, M.; Jones, R., Treatise on Comedy, 2025`. Defined in `CONTRACT_ANOMALIES.md`. |
| Item tag                 | The kind of ‘tag’ (label) that a user can add to an Item: a keyword attached to an item and listed in the Jurism/Zotero *Tags* pane (not an Extra tag or a language tag). May be *manual* or *automatic*, and may have a colour. |
| L-type                   | Language type (variant): a variant designation indicating that the tag value is a translation (see also S-type) |
| Language                 | 1. The name of an item field that specifies one or more language{-region} sub-strings  that characterise the item. <br />2. In a BCP-47 language tag: the 2/3-letter base language subtag (e.g. `pt`, `en`). |
| Language tag             | Jurism term for the whole string that encompasses language, region, script and transliteration method. Individually, these are called subtags. |
| Library                  | The total collection of all items the user has in Jurism or Zotero. |
| Linked Attachment        | A specific Jurism/Zotero facility to capture a link to an Attachment that is stored outside of  Jurism/Zotero, usually in a directory defined by the preference Linked Attachment base Directory. |
| Locale                   | The human language and region used in *user-facing outputs*: the migration notes and anomalies management dashboard. <br />The term ‘locale’ is used to avoid confusion with other uses of the term ‘language’. |
| Map                      | A data structure that describes how to move elements from a source data set into a target data set by converting their values and/or changing their locations. |
| Mapping                  | The movement of an element from a source data set into a target data set by conversion of its value and/or a change of its location. |
| Message                  | A piece of text rendered for the user rendered in his/her chosen language (locale), after any parameters have been resolved. |
| Message template         | A message in a chosen language (locale) in which unresolved parameters are marked by placeholders {{…}}. A message template with no parameters *is* the message. |
| Migration                | The movement of data from Jurism 6 to Zotero 10.             |
| Migration Note           | A note added to an Item by JZM to permanently record the transformations that took place to this Item during migration. |
| Note                     | A specific Jurism/Zotero facility to capture a piece of formatted text as an attachment to an item. |
| Orphan                   | A child item whose recorded parent is missing from the source database (a data fault). Cf. Standalone. Migrated as a standalone item, with an anomaly. |
| Preference               | A value set by the user in a program (Jurism or Zotero), known in the program UI as preference or setting (or the local language equivalent), depending on the program, version and selected locale. |
| Region                   | The region modifier (substring) for a human language coded according to BCP 47, e.g. `GB` for Great Britain (or United Kingdom) in `en-GB` |
| Regular Fields           | Used to differentiate fields that are not creators from those that are. |
| Related to               | A facility in Jurism and Zotero to make a link from any Parent or Child Item to any other Parent or Child item. |
| Romanization             | CNE term for any transliteration method that converts to Latin script.  <br />(deliberately spelled with a ‘z’ to match the practice in CNE) |
| S-type                   | Script type (variant): a variant designation indicating that the tag value is a transliteration (see also L-type). |
| Saved Search             | A folder in Jurism or Zotero that looks similar to a collection, but whose contents are created dynamically by defined search criteria.  (Like a ‘smart folder’ in other apps). |
| Setting                  | A synonym for preference.                                    |
| Script                   | The type of script used to write a human language, as defined in BCP 47, e.g. `Latn` for the Latin script used in western Europe, the Americas etc. , `Cyrl` for Cyrillic as used in Russia, etc. <br />‘Script’ can also mean an interpreted programming language but should then be part of a compound name such as JavaScript or Python Script.  If there is any ambiguity between the two uses, clarify with the author before proceeding. For scripts in the sense of executable programs, the term ‘program’ is preferred. |
| Snapshot                 | A specific Jurism/Zotero facility to capture the image of a web page by recording the HTML file and any related CSS files. |
| Source                   | The Jurism 6 database and its fields from which data is migrated. |
| Standalone               | Zotero term for a note or attachment deliberately placed at the top level of the library, with no parent. Cf. orphan. |
| Stored File              | A specific Jurism/Zotero facility to store an ‘attached’ file ‘inside’ Jurism/Zotero. Kept physically in the `/storage` subfolder. |
| Subtag                   | Jurism term for each individual part of a language tag:  language, region, script and transliteration method. Does not apply to extra tags. |
| Tag                      | 1. Language tag<br />2. Extra tag<br />3. Item tag.<br />The word ‘tag’ should only be used alone when the context makes clear which is meant. |
| Target                   | The Zotero 10 database and its fields to which data is migrated. |
| Tester                   | Person conducting tests on a program in the suite.  Assumed to act as a user rather than as a technical expert. |
| $t$-extension            | The BCP 47 `-t-` subtag used for ‘transformed’ (i.e. transcribed, transliterated, translated) content. |
| Token                    | A fixed string local to the program, that is used to index external titles (usually JSON). |
| Terminal                 | The environment that runs the command-line interpreter. It is the _Terminal_ app in MacOS, _Windows Terminal_ in Windows, and one of several options in Linux such as GNOME Terminal, XFCE Terminal, KDE Plasma Konsole, LXTerminal, MATE Terminal or Kitty. |
| Transcription            | The act or process of putting speech into a written form.    |
| Transformation           | 1. Item, Creator or Field transformation: A mapping that is anything other than a 1:1 copy - i.e. a change in value and/or a move to a different location<br />2. Language or script transformation: a structural adaptation of text according to the BCP-47 standard |
| Transformation mechanism | BCP term for the method or ‘model’ by which a transformation is carried out. |
| Translation              | Conversion of text between different Languages.              |
| Transliteration          | The process of converting text from one writing system or alphabet into another while preserving the original pronunciation. |
| Try                      | A defensive coding technique that presents a crash in case of an error, instead directing to a ‘catch’. |
| User                     | The user of the Jurism and Zotero libraries, and the MVZ programs. Assumed to be knowledgeable about the contract of the Library, but not a technical expert. |
| v-index                  | Variant index. The index number (starting at 0) that links the MVZ tag to the MVZ main pane. |
| Variant                  | A specific Jurism facility (not available in Zotero) that comprises a different version of various text Fields with its own Language Tag. Used to store translations and transliterations of the host Field. |
| Workspace                | The collection of all files that are visible to the AI Agent. The workspace should be complete, consistent, and self-contained. Nothing outside the Workspace is visible to the AI Agent. It is ‘stateless’, so contains no older versions of documents, files or code. Temporary drafts and archives are stored elsewhere. The Workspace includes a test copy of the runtime environment (Home directory) within it. |
| Workspace root           | The directory with respect to which specification documents, the test environment, and the test runtime environment are defined. |






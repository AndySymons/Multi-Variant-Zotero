<p align="right">
      <img width="128" height="128" align="right" alt="MVZ Icon 128x128" src="https://github.com/user-attachments/assets/ad6237c5-7a9d-405c-bdfb-7c884678648d" /> 
</p>
<br clear="right" />

<div align="center">

# Multi-Variant Zotero

</div>

A Zotero plugin that facilitates multiple language and script variants for any natural language field

-----

#   - WORK IN PROGRESS -

# Introduction 

**Multi-Variant Zotero** release 1 (MVZ1) is a Zotero plugin that makes Zotero behave in a similar way to the now sadly defunct Jurism, with respect to the language features. 

It does *not* add any special judicial item types.   

# Why develop a new Plugin?

Some language features are available using the **Cite-Non-English** (CNE) plugin to Zotero. CNE is compatible with Zotero 10 and maintained up to date. However, after extended deliberation I decided not to use CNE because it is rather limited compared with Jurism. 

- It only allows one translation language (English) 
- It only allows one transliteration script (Latn or ‘Romanized’)
- It allows these only on a limited number of fields  

# Functions

The MVZ1 plugin 

- Allows you to provide as many translations or transliterations as you like for most Zotero text fields (as many as Jurism supported).  
- The characteristics of the target document are set in the MVZ plugin preferences. A citation will include a transliteration and/or translation of a field into the target document
   - For fields you choose (having a variant does not mean it has to be used)  
   - When applicable (item script/language is different form the target)
   - Formatted as you choose for your target citation style 

You thus have the support to write articles, papers, theses etc. in more than one language based on the same Zotero database with no prior assumptions about what the target document script, language, citation style and conventions are going to be.    

# Successor to _Jurism_

Multi-Variant Zotero (MVZ1) is designed to be a successor to _Jurism_ 

- _Jurism_ is a Zotero fork that is no longer supported. It has not been upgraded since Zotero 6 and is not stable with some modern environments such as Apple Silicon.
   - **MVZ** is a plugin made to current official Zotero standards, so should be easier to maintain. 

# Alternative to the _Cite Non-English_ (CNE) plugin 

MVZ is an alternative to CNE with several advantages: 

| CNE                                                     | MVZ                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| translations for Title and Container Title only         | translation of most text fields, as did Jurism               |
| translation into one language only (English)            | translations into as many languages as you like              |
| transliteration for a limited number of fields          | transliteration of most text fields, as did Jurism           |
| transliteration into one script only (Latin)            | transliterations into any scripts, as many as you like       |
| requires special CNE style templates                    | Works with any standard CSL style                            |
| Assumes target document characteristics know in advance | Defines target document characteristics in the preferences; easy to change for a new document. |

# Internationalised

MVZ has full support for all UI languages and regions supported in Jurism and Zotero.

The suite also includes the necessary tools in case a collaborator wants to add a further language/region (locale). 

# Installation and Use

*Provisional.* *Full details will be provided when the first Beta release is ready.* 

The MVZ plugin will be available in the usual way as a `.xpi` file that Zotero can install as a plugin. 

It will eventually be bundled with locale files for all languages supported by Zotero, but during testing only two will be used: `en-GB` and `pt-PT`  

# Future features (maybe)

I have a lot of ideas for additional features (!) but to facilitate quick initial code generation and testing, advanced features will not be implemented in the first release. 

Broadly, the first release is intended to provide everything that Jurism did with respect to languages (not judicial data), and be sufficient to receive a migration from the JZM Migrator. 

The second and subsequent releases will implement user change requests and my more advanced feature ideas, priority t.b.d. 

MVZ Release 1 = Version 1.0. scope is as follows: 

| Feature                                                      | Version 1.0 | Version 2.0 or later |
| ------------------------------------------------------------ | :---------: | :------------------: |
| Main MVZ pane (for editing variants)                         |      ⚫      |          ⚫           |
| Language field editor popup                                  |      ⚫      |          ⚫           |
| Extra field warning popup                                    |      ⚫      |          —           |
| Extra field editor                                           |      —      |          ⚫           |
| Target doc language, style, and inclusions prefs             |      ⚫      |          ⚫           |
| Target doc preferred transcription models                    |      —      |          ⚫           |
| Variants audit                                               |      —      |          ⚫           |
| Variants sufficiency check                                   |      —      |          ⚫           |
| Autofill (automatic transliteration and translation) for variants |      —      |          ⚫           |






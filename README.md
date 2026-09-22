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

**Multi-Variant Zotero (MVZ)** is a suite of programs and files that together make Zotero behave in a similar way to the now sadly defunct Jurism.

This document serves as an introduction both for human readers on GitHub and AI generation agents (such as Devin). 

In MVZ a ‘variant’ is, as in Jurism, an alternative version of a field with a specific language and script. This enables citations to be made that can include the original language, a transliteration, and a translation for applicable fields.  

By allowing multiple variants, MVZ makes no assumptions in the database about the ultimate target language, script or preferred transliteration method. The target document can nominate these and MVZ selects the applicable variants only when the citation is generated.  

The key components of the suite are:  

- **Multi-Variant Zotero (MVZ) plugin** 
   - a Zotero plugin to add the multi-variant features for the same fields as Jurism   
- **Jurism to Zotero Migration (JZM)** program.  
   - extracts data from your old Jurism database and makes an RDF file for import to a new Zotero database. Any variants present in the Jurism source are translated to tags in the target that can be directly used by **MVZ**. 

Other components comprise tools to prepare reference files and test the Migrator program. 

MVZ does not include the special Judicial types added in Jurism, but JZM does map them to standard Zotero types, and write additional tags in such a way that no data is lost.  



# Why migration is needed

This project grew from a personal need to move my 11,000 item library in Jurism 6 away from Jurism. 


## Why leave Jurism? 

I have used **Zotero** since 2014, when I was writing my Masters dissertation. I moved to **Jurism** in 2020 because I needed the multilingual features, which Zotero did not have. It worked very well for my PhD thesis, which had a lot of German and other foreign language references that I need in both the original languages and English. 

I now have around 11,000 items in the database, 4,000 linked attachments and 1,000 stored attachments, snapshots etc.  

Sadly **Jurism** has not been maintained since 2021, and ... 

- Jurism is *not stable on Apple Silicon*. It keeps crashing for no apparent reason. I recently upgraded to a Mac Mini M4 because Microsoft 365 stopped supporting older operating systems such as Catalina and Big Sur (Mac OS 10 and 11), so it is now a challenge to run both on the same computer!
- Zotero upgraded its authentication procedure for better security, and Jurism did not catch up, so Jurism has not been able to synchronise using the Zotero cloud for some time now. 
- There is no future plan to support or upgrade Jurism.

## Why go to Zotero?

I liked Zotero in the past, and I liked Jurism, which was based on Zotero, while it lasted. 

I have no need to go anywhere else, but in case you do, the Zotero RDF files written by the extractor can probably be imported into other systems.  

## Why develop a new Plugin?

Many of the language features that I need are available using the **Cite-Non-English** (CNE) plugin to Zotero. CNE is compatible with Zotero 10 and maintained up to date. However, after extended deliberation I decided not to use CNE because it is rather limited compared with Jurism. 

- It only allows one translation language (English) 
- It only allows one transliteration script (Latn or ‘Romanized’)
- It allows these only on a limited number of fields  

I therefore decided to develop at the same time a **Multi-Variant Zotero** (MVZ) plugin of my own, which allows any number of translations and scripts on practically any text filed, as Jurism did.  

### Judicial features 

Many of the Judicial features have been encompassed in the **Citation Phoenix** plugin.  I decided not to use Citation Phoenix (at least not yet) as it does not simplify matters for me - it is still necessary to write special tags.

I have no personal need for judicial features, so, selfishly, I do not want to spend a lot of time testing them. I will happily collaborate with anyone else who would like to adapt the code!  

The JZM Migrator maps judicial Item types to standard Zotero types and writes tags for information that does not fit - so nothing is ever lost. 



# Multi-Variant Zotero Plugin (MVZ)

This plugin allows you to provide as many translations or transliterations as you like for most Zotero text fields (as many as Jurism supported).  
A citation will, when applicable, include a transliteration and translation into the target script and language of the document you are making (the target document).  
You thus have the support to write articles, papers, theses etc. in more than one language based on the same Zotero database with no prior assumptions about what the target document script and language are going to be.   

## Successor to _Jurism_

Multi-Variant Zotero (MVZ) is designed to be a successor to _Jurism_ 

- _Jurism_ is a Zotero fork that is no longer supported. It has not been upgraded since Zotero 6 and is not stable with some modern environments such as Apple Silicon.
   - **MVZ** is a plugin made to current official Zotero standards, so should be easier to maintain. 

## Alternative to the _Cite Non-English_ (CNE) plugin 

MVZ is an alternative to CNE with several advantages: 

- _Cite Non-English_ provides translations for Title and Container Title only
   - MVZ provides for translation of most text fields, as did Jurism.
- _Cite Non-English_ provides translation into one language only (English).
   - MVZ provides for translations into several languages. 
- _Cite Non-English_ provides transliteration for a limited number of fields 
   - MVZ provides for transliteration of most text fields, as did Jurism. 
- _Cite Non-English_ provides transliteration into one script only (Latin, called ‘romanized’).
   - MVZ provides for several transliterations into any scripts.  

- _Cite Non-English_ requires special CNE style templates, so will only work with styles for which someone has created a CNE template.
   - MVZ does not require special style templates, so will work with any standard CSL style in Zotero.  

<u>Note</u>: MVZ assumes that if you provide a translation you want to use it. Not all academics and citations styles recommend this for all fields. For example, if the Publisher is 'Springer Verlag' (German), there is probably no need to translate this into English as 'Springer Publishing', or Portuguese as 'Editora Springer'. MVZ **lets** you translate anything, but it is up to you whether you actually do it!   

## Internationalised

MVZ has full support for all UI languages and regions supported in Jurism and Zotero.

The suite also includes the necessary tools in case a collaborator wants to add a further language/region (locale). 



# Jurism to Zotero Migrator (JZM)

**JZM** is a facility to migrate all Items and their Attachments from a ‘source’  **Jurism 6** Library to a ‘target’  **Zotero 10** Library. 

It is designed to work seamlessly with the **Multi-Variant Zotero** (MVZ) plugin. 

## Summary of features

1. **Unlimited input scope** — deals with *all* Jurism judicial extensions, and its language and script variants, as well as the standard Zotero 6 features that were incorporated into Jurism.  The migration includes Collections, Saved Searches, and Parent and Child Items of all types. 
1. **internationalised**: full support for all UI languages and regions supported in Jurism and Zotero.
1. **Platform independent**: Will run on Mac, Windows, or Linux. 
1. **’No loss’ rule**: all Jurism data goes *somewhere*. Anything that is not accommodated in native Zotero 10 is written to CSL or MVZ tags in the *Extra* field.  
1. **’No silent change’ rule**: all mappings to Zotero that are not simple 1:1 copies are called Anomalies and recorded in:    
   - A **Migration Note** attached to each item. 
   - An interactive browsable **Anomalies Management Dashboard**
1. **’No hidden fields’ rule**:  To avoid unforeseen consequences, there are no ‘hidden’ database fields; only fields visible to the user through the Jurism UI are mapped, and they only map to UI-visible fields in Zotero. You still have full control of your Library.
1. **Cleans up language fields**: Item language designations that are recognised but not standard BCP 47 are converted so that they are compliant. E.g. 'Spanish' is changed to 'es'.  Unrecognised designations are logged as anomalies. 
1. **Cleans up linked attachments** that have legacy absolute paths in Jurism. Redefines them as relative to the Linked Attachments Base Directory. Warns of missing files, in the Migration Notes and Anomalies Report.  
1. **Reports on missing files**: If snapshots, stored files, or linked attachments are missing in the Jurism database, anomalies are logged with details to help you find them elsewhere on your disk or in a backup. 
1. **Preserves the original 'Date added' and 'Modified' fields**. On import, Zotero changes these fields to the date and time of the import, so JZM keeps the original Jurism values in *Extra* tags.   
1. **Collection selection option**: you can migrate your whole library or just one Collection at a time.  
1. **Report only option**: the extractor can be run with only the Anomalies Report, in order to get a preview of what is to be expected before committing to the full migration. 



## Why a migration program? 

In short, because the alternatives do not work! 

### Failed: Export import 

If you Google how to migrate from Jurism to Zotero, the first answer is to export your library from Jurism to RDF, then import the RDF to a clean Zotero database. 

In my case however, Jurism gives highly cryptic error messages like 

- _[JavaScript Error: "XML Parsing Error: not well-formed_
- _[JavaScript Error: "Unsupported library type 'undefined' for library undefined" {file: "chrome://zotero/content/xpcom/uri.js" line: 112}]_ 

I have no idea how to fix these! I do not even know whether there is something corrupt in my database or a bug in Jurism. There is no obvious way of finding out. 

I found I could export individual items or small groups of items, but failed to find an algorithm that would export the whole library. 

In any case, this method does not include the multi-language variants that I need.  

### Failed: Copy the whole database 

Google next suggests: copy the `jurism.sqlite` database from ``/Jurism` to `/Zotero`, rename it `zotero.sqlite`, and ask Zotero to read it. That does not work. 
Zotero recognises it as version 6.0.22m4 but thinks it is for a *future* Zotero release, even though that is way in the past!. 

I tried reverting to Zotero 6, but that and later versions did not recognise it either. 

I tried manually editing the version table using DB Browser for SQLite (to the last version 6 build, version 295) but was unable to trick Zotero into recognising it as an old Zotero database that just needed upgrading.

In any case, this method would also not include the multi-language information.

### Rejected: Directly manipulate the Jurism database

It would be theoretically possible to 'clean up' the Jurism database to strip out the additional Jurism features, but ...  given the experience with just changing the version, it would be easy to corrupt the database and render it useless.      

### Rejected: Insert directly into the new Zotero database

This is an approach that is theoretically possible, but would have the same danger of corrupting the database and render it useless, or worse, introduce a subtle corruption that appears good now but creates an unforeseen problem in the future. 

## Why this chosen solution? 

The chosen solution is *non-invasive* and therefore safe. If it messes up, you will not have lost anything. 

- Stage 1 extracts the data from `jurism.sqlite` on a read-only basis 
- Stage 2 imports this data using the built-in Zotero RDF import facility, so the integrity of the Zotero  database is secure.  

A bonus feature of having a custom program is that I could add enhancements beyond what the Jurism export would do (if it worked), such as cleaning up legacy link issues, normalising the language field, copying the variants, and writing Extra tags for the MVZ plugin. 



## JZM Run-time environment

The following diagram shows the normal run-time environment for a user. 

The `/JZM` part is the contents of the installation package.  

The diagram folder and file names are for orientation purposes only; the single source of truth for all path and file names within the JZM Base Directory is the Manifest  `jzm_manifest.json`. 

The location of the Jurism preferences is platform and OS version dependent; a dynamic discovery routine is used to find it. 

`“~/”` refers to the user’s home directory on the host platform. 

All pathing in the Extractor is determined  by the Manifest, which specifies paths **relative to the runtime environment root  `jzm_extractor/`**, where the Manifest is located. 

```
~/Library/Application Support/Jurism/					<--- look here for Jurism preferences (Mac OS variant)
~/Jurism
│   ├── jurism.sqlite													<--- source database 
│   └── /storage															<--- source snapshots and stored files 
│
~/JZM
│   ├── jzm_extractor/               					<--- Runtime BASE DIRECTORY for the extractor
│   │   ├── jzm_extractor.py         					<--- Devin instructed to write the code here
│   │   ├── jzm_manifest.json        					<--- Single source of truth for extractor paths and files
│   │   │ 
│   │   ├── schemas/
│   │   │   ├── schema-jurism_db.json					<--- Official source database schema, read-only  
│   │   │   └── schema-zotero_db.json					<--- Official target database schema, read-only
│   │   │
│   │   ├── maps/
│   │   │   └── map_jurism_to_zotero.json			<--- Master Mapping table source -> target, read-only 
│   │   │
│   │   ├── lookups/ 				 
│   │   │   ├── lookup_courts.json						<--- Convert DB Court code to plain text  
│   │   │   └── lookup_jurisdictions.json			<--- Convert DB Jurisdiction code to plain text
│   │   │
│   │   ├── locales/
│   │   │   ├── locales_jurism/								<--- Official translations according to Jurism  
│   │   │   │   ├── locale_jurism_en-US				<--- e.g. 
│   │   │   │   └── locale_jurism_xx-YY 			<--- etc., for as many locales as are supported
│   │   │   │
│   │   │   ├── locales_zotero/								<--- Official translations according to Zotero, read-only 
│   │   │   │   ├── locale_zotero_en-US.json	<--- e.g.
│   │   │   │   └── locale_zotero_xx-YY.json	<--- etc., for as many locales as are supported
│   │   │   │
│   │   │   └── locales_jzm_custom/						<--- Custom translations for JZM texts  
│   │   │       ├── locale_jzm_custom_en-GB.json <--- UK English always present as reference 
│   │   │   		└── locale_jzm_custom_xx-YY.json <--- etc., for as many locales as are supported 
│   │   │   
│   │   └── outputs/        									<--- written by the extractor, locations in the Manifest 
│   │       ├── jzm_error_report.log					<--- To send to the developer, AI readable UK English  
│   │       ├── jzm_anomalies_report.json			<--- JSON, token encoded; locale independent 
│   │       ├── jzm_anomalies_dashboard.html	<--- Interactive bundle for user to run in a web browser    
│   │       ├── jzm_import.rdf   							<--- The extract; it will appear as "jzm_import" in Zotero
│   │       └── /files				      					<--- hard-links to ~/Jurism/storage for the importer
│   │
│   └── tools/   
│       └── t.b.d. utilities, e.g. to show the file path in Zotero, and check custom locale files  
│
~/Zotero
│   ├── zotero.sqlite		<--- target database 
│   └── /storage				<--- target snapshots and stored files 
│   
```



## Technical Design Principles     

1. **Two-step process**:
   - The  JZM Migrator reads the `jurism.sqlite` database (where your library is held) and outputs to a Zotero RDF file.  
   - You import the RDF into Zotero using the standard Zotero procedure. 
2. **Snapshots and Stored Files**: are faithfully copied into Zotero. 
3. **Linked Attachments**: continue to be accessible by relative addressing in Zotero. 
4. **Non-invasive**:
   - The  JZM Migrator treats the `jurism.sqlite` database as *read-only*. 
   - The import uses a standard Zotero function 
   - Jurism snapshots, stored files, and linked attachments are not changed or moved.  
5. **Table-driven**: the actual Jurism to Zotero mapping is meticulously mapped (every field of every item type) using a JSON input file. Database schemas, RDF generation, and UI language generation are similarly controlled by input JSON files, to facilitate maintenance.    
6. **Defensive programming** prevents crashes through a 'check before use’ rule on all inputs, and Error logging in AI readable form. Error logs can be sent to the developer (me) for fast diagnosis and correction. 

## Testing Method 

The  **JZM Migrator** program is tested largely automatically:

1. A tool *Create Test Database* builds a Test Jurism Source Database, generating a Library with a modest number of dummy Test Items that exhibit all the characteristics needed to test all the features of the Migrator.  
2. The user migrates in the usual way, using the JZM Migrator and Zotero Import, to make a *Test Target Database*. 
3. A tool *Run Test* guides the tester through the necessary steps and establishes test scenario patterns.  
4. A sub-program *Check Results* automatically tests that all criteria for the migration have been met.  



# MVZ Project Workspace

The following diagram shows the project workspace as it is made available to the AI Agent that creates the extractor code and the automatic testing scripts. 

The documents collectively specify the products to be built and how they communicate between themselves and third-party products. For ease of maintenance and preservation of a single source of truth, they are subdivided into Contract specifications  and Product build specifications. Contracts are either summaries of external requirements and best practices, or shared internal specifications (e.g. a file written by one product and read by another). Product build specifications are strictly one per product to avoid any ambiguity. They focus on processing steps.  

All pathing in specification documents and the testing programs is **relative to `MVZ workspace/`**. 

The normal run environment for the Migrator is embedded within the workspace. 

The `jzm_extractor` directory mimics the live runtime environment. This is the *JZM Base Directory* for which the description is given above. 

```
~/.../MVZ workspace 											<--- AI Agent workspace
│   ├── AGENT_RULES.md
│   ├── README.md 
│   ├── docs/ 																
│   │   ├── Contract specifications						<--- shared specifications for data and common rules   
│   │   |   ├── CONTRACT_ANOMALIES_LOG.md
│   │   |   ├── CONTRACT_ERROR_LOGGING.md
│   │   |   ├── CONTRACT_EXTRA_FIELD.md
│   │   |   ├── CONTRACT_JURISM_PREFERENCES.md	
│   │   |   ├── CONTRACT_JZM_MIGRATION_NOTES.md	
│   │   |   ├── CONTRACT_JZM_TAGS.md	
│   │   |   ├── CONTRACT_LANGUAGES_SCRIPTS.md	
│   │   |   ├── CONTRACT_MANIFEST.md	
│   │   |   ├── CONTRACT_MVZ_TAGS.md	
│   │   |   ├── CONTRACT_TEST_REPORT.md	
│   │   |   ├── CONTRACT_ZOTERO_CSL_TAGS.md	
│   │   |   └── CONTRACT_ZOTERO_RDF.md	
│   │   |
│   │   └── Product build specifications			<--- one specification for each product to be built  
│   │       ├── BUILD_CHECK_RESULTS.md	
│   │       ├── BUILD_CREATE_TEST_DATABASE.md
│   │       ├── BUILD_DASHBOARD_TEMPLATE.md
│   │       ├── BUILD_JZM_EXTRACTOR.md
│   │       ├── BUILD_LOCALE_CHECKER.md
│   │       ├── BUILD_MVZ_PLUGIN.md
│   │       └── BUILD_RUN_TEST.md
│   │
│   ├── MVZ plugin   
│   |   └── mvz.xpi														<--- plugin file for Zotero to install
|   |
│   ├── jzm_extractor/               					<--- test Runtime environment as in the diagram above
│   │
│   └── jzm_testing/
│       ├── jzm_test_criteria.json	    			<--- characteristics and expectations  
│       ├── jzm_create_test_db.py							<--- script to create jurism.sqlite 
│       ├── jzm_test_manifest.json	 					<--- written by create database
│       ├── jzm_run_test.py	    							<--- script to run a test scenario
│       ├── jzm_check_results.py 							<--- script to determine the results
│       ├── jzm_test_report.log   						<--- written by check_results
│       └── EXTRACTOR_TEST_FEEDBACK.md 				<--- written by the user/ human tester  
│   
```





# Installation and Use

*Provisional.* *Full details will be provided when the first Beta release is ready.* 

## The MVZ plugin 

- Will be available in the usual way as a `.xpi` file that Zotero can install as a plugin.  

## Jurism to Zotero Migration

- The package will be available as a ZIP file with the complete set of files required (see *Run-time environment*, below). 
- You download it to your disk and expand it in your user home directory in a folder called **``/JZM`** (alongside `~/Jurism` and `~/Zotero `) 
- The Migrator is a **Python3** script that can be run from your Terminal or using a click-and-play option. 
- It finds your `jurism.sqlite` database at the default location or one specified by you.
- It finds your Jurism preferences at the standard location for your host environment. 
- It writes the **Anomalies Management Dashboard**, the **RDF** file and the **`/files`** directory structure (Snapshots and Stored Files), ready for you to import into Zotero. 

## Other elements 

Other elements will be downloadable in the way most suited to the type of code - as individual runnable Python3 programs, .md documents, or as convenient zip packages for 

- The documentation set 
- All tools




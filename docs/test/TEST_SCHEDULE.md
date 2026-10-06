# TEST SCHEDULE 

06-Oct-2026 15:13 

Andrew Symons 

[toc]

# Summary

## Scope / test object 

All functions of the MVZ Plugin version **1.0.0-alpha.x** 

## Test Environment details 

- Mac OS version: **Tahoe 26.6.2 (25G83)**

- Zotero version: **10.0.5**  

## Progressions w.r.t. previous version 



## Regressions w.r.t. previous version 





## Conclusion

Recommendation on readiness for release 1.0.0-Beta.1: **Not ready** 



----



# Detailed Test Results

## 100 Installation

### Plugin correctly installed

| Test number | Procedure                                                    | Expectation                                                  | Result | Observations |
| :---------: | :----------------------------------------------------------- | :----------------------------------------------------------- | :----: | :----------- |
|   **101**   | 1. Remove any previous MVZ plugin version2. Restart Zotero3. Instal the new version of the plugin 4. Restart Zotero | Installs on Zotero 10 test system with no errors             |        |              |
|   **102**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct logo                                        |        |              |
|   **103**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct description                                 |        |              |
|   **104**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct author                                      |        |              |
|   **105**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct version number                              |        |              |
|   **106**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct date                                        |        |              |
|   **107**   | Click on the link to the correct GitHub homepage             | The correct GitHub homepage is opened in the system default browser |        |              |
|   **108**   | Inspect Tools --> Plugins --> MVZ Plugin                     | Plugin still installed                                       |        |              |

----



## 200 Main pane

### Registration and appearance

| Test number | Procedure                                                 | Expectation                                                  | Result | Observations |
| :---------: | :-------------------------------------------------------- | :----------------------------------------------------------- | :----: | :----------- |
|   **201**   | Go to main pane and inspect MVZ logo in the right toolbar | Logo is as image provided                                    |        |              |
|   **202**   | Click MVZ logo in the right toolbar                       | Causes scroll to the MVZ pane                                |        |              |
|   **203**   | Inspect the MVZ pane logo at the top                      | Logo as image provided                                       |        |              |
|   **204**   | Inspect the title at top of the MVZ pane                  | Should be “Multi-Variant Zotero”                             |        |              |
|   **205**   | Click the MVZ pane expand/collapse arrow                  | Expands/collapses the content                                |        |              |
|   **206**   | Select any item in the Library pane; inspect the MVZ pane | Main pane colour matches Zotero - normal all grey background, edit boxes white when selected. |        |              |
|   **207**   | Inspect the MVZ pane with any Item selected               | Main pane fonts match Zotero                                 |        |              |
|   **208**   | Inspect the MVZ pane with any Item selected               | Column alignment matches Zotero; field headings right-justified. |        |              |
|   **209**   | Inspect the MVZ pane with any Item selected               | Value boxes background goes white when selected, like Zotero |        |              |

----



## 300 Preferences

### Registration

| Test number | Procedure                                      | Expectation                                                  | Result | Observations |
| :---------: | :--------------------------------------------- | :----------------------------------------------------------- | :----: | :----------- |
|   **301**   | Go to Zotero --> Preferences; inspect the list | MVZ Plugin preferences line under the Zotero preferences     |        |              |
|   **302**   | Go to Zotero --> Preferences; inspect the list | MVZ preferences with logo                                    |        |              |
|   **303**   | Click the MVZ preferences                      | Displays the three MVZ preference tabs - Target document - Field inclusion- Language/Script drop-down |        |              |

### Target document prefs

| Test number | Procedure | Expectation                                                  | Result | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :----: | :----------- |
|   **311**   |           | Target document characteristics - pane layout and appearance |        |              |
|   **312**   |           | Target document language can be changed                      |        |              |
|   **321**   |           | Target document style preferences                            |        |              |

### Field inclusion matrix

| Test number | Procedure | Expectation            | Result | Observations |
| :---------: | :-------- | :--------------------- | :----: | :----------- |
|   **331**   |           | Field inclusion matrix |        |              |

### Language/script shortlists

| Test number | Procedure | Expectation                                       | Result | Observations |
| :---------: | :-------- | :------------------------------------------------ | :----: | :----------- |
|   **340**   |           | Language/script shortlists - Table layout         |        |              |
|   **341**   |           | Language/script shortlists - can add languages    |        |              |
|   **342**   |           | Language/script shortlists - can add scripts      |        |              |
|   **344**   |           | Language/script shortlists - can delete languages |        |              |
|   **345**   |           | Language/script shortlists - can delete scripts   |        |              |
|   **346**   |           | Language/script shortlists - can edit a language  |        |              |
|   **347**   |           | Language/script shortlists - can edit a script    |        |              |





----

## 400 Main pane

### Regular field functionality

| Test number | Procedure | Expectation                                                | Result | Observations |
| :---------: | :-------- | :--------------------------------------------------------- | :----: | :----------- |
|   **401**   |           | Left column has correct UI locale field labels             |        |              |
|   **402**   |           | All fields listed in Zotero are listed in MVZ except Extra |        |              |
|   **403**   |           | MVZ fields Displayed in the same sequence as Zotero        |        |              |
|   **404**   |           | Regular field values same as in the Zotero pane            |        |              |
|   **404**   |           | Editing regular field value in MVZ mirrored in Zotero      |        |              |
|   **405**   |           | Editing regular field value in Zotero mirrored in MVZ      |        |              |
|   **411**   |           | Date added is not editable                                 |        |              |
|   **412**   |           | Date modified is not editable                              |        |              |

### Creator field functionality

| Test number | Procedure | Expectation                                                  | Result | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :----: | :----------- |
|   **451**   |           | Creator field values same as in the Zotero pane (on loading) |        |              |
|   **452**   |           | Creator field label name                                     |        |              |
|   **453**   |           | Creator field dropdown                                       |        |              |
|   **454**   |           | Creator field type change takes effect                       |        |              |
|   **455**   |           | Creator field type change in MVZ reflected in Zotero         |        |              |
|   **456**   |           | Creator field type change in Zotero reflected in MVZ         |        |              |
|   **457**   |           | Creator values change in MVZ reflected in Zotero             |        |              |
|   **458**   |           | Creator values in Zotero reflected in MVZ                    |        |              |
|   **459**   |           | Creator switch buttons appear when hovering on the line in MVZ |        |              |
|   **460**   |           | Single name switch hover text                                |        |              |
|   **461**   |           | Single name switch change in MVZ reflected in Zotero         |        |              |
|   **470**   |           | Single name switch change Zotero reflected in MVZ            |        |              |
|   **470**   |           | Creator delete button hover text                             |        |              |
|   **471**   |           | Creator delete button deletes creator                        |        |              |
|   **472**   |           | Creator delete in MVZ mirrored in Zotero                     |        |              |
|   **473**   |           | Creator delete in Zotero mirrored in MVZ                     |        |              |
|   **480**   |           | Creator add button hover text                                |        |              |
|   **481**   |           | Creator add button adds a creator, when none present         |        |              |
|   **482**   |           | Creator add button adds an additional creator, when at least one already present |        |              |
|   **483**   |           | Creator add in MVZ mirrored in Zotero                        |        |              |
|   **484**   |           | Creator add in Zotero mirrored in MVZ                        |        |              |
|   **490**   |           | Creator context menu button hover text                       |        |              |
|   **491**   |           | Creator context menu dropdown format                         |        |              |
|   **492**   |           | Creator context menu dropdown names                          |        |              |
|   **493**   |           | Creator context menu ‘Fix case’ greyed out if it does not need fixing |        |              |
|   **494**   |           | Creator context menu ‘Fix case’ active if it needs fixing    |        |              |
|   **495**   |           | Creator context menu ‘Fix case’ works                        |        |              |
|   **496**   |           | Creator context menu ‘swap names’ works                      |        |              |



----

## 500 Variants

### Creator field variants

| Test number | Procedure | Expectation                                                  | Result | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :----: | :----------- |
|   **501**   |           | Left click on a field label (except Creator type) has no effect |        |              |
|   **502**   |           | Right click on a field label enables a variant to be added   |        |              |
|   **551**   |           | Right click on a creator type label enables a variant to be added |        |              |



----

## 600 Popups and listeners

### Language field popup

| Test number | Procedure | Expectation                                                  | Result | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :----: | :----------- |
|   **601**   |           | Language field popup in MVZ pane                             |        |              |
|   **602**   |           | Language field popup in Zotero pane                          |        |              |
|   **603**   |           | Can add a language with the popup                            |        |              |
|   **604**   |           | Can remove a language (or erroneous code) with the popup     |        |              |
|   **608**   |           | Updated list saved to the language field as a comma-separated list |        |              |
|   **609**   |           | Focus removed after closing the popup                        |        |              |

### Extra field popup

| Test number | Procedure | Expectation                                                  | Result | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :----: | :----------- |
|   **611**   |           | Extra field popup (only in Zotero pane)                      |        |              |
|   **612**   |           | Editing anything other than MVZ tags in Extra still works (after acknowledging the warning) |        |              |
|   **613**   |           | Editing MVZ tags in Extra has no effect (reset to previous value) |        |              |

### Creator listener

| Test number | Procedure | Expectation                                         | Result | Observations |
| :---------: | :-------- | :-------------------------------------------------- | :----: | :----------- |
|   **621**   |           | Creator listener in MVZ pane                        |        |              |
|   **622**   |           | Creator listener updates MVZ                        |        |              |
|   **630**   |           | MVZ tags updated corectly after deletion of creator |        |              |



----

## 700 Citations

## General setup 

| Test number | Procedure | Expectation | Result | Observations |
| :---------: | :-------- | :---------- | :----: | :----------- |
|   **700**   | t.b.d.    |             |        |              |

## Citations in same language and script 

| Test number | Procedure | Expectation | Result | Observations |
| :---------: | :-------- | :---------- | :----: | :----------- |
|   **710**   | t.b.d.    |             |        |              |

## Citations in different language, same script 

| Test number | Procedure | Expectation | Result | Observations |
| :---------: | :-------- | :---------- | :----: | :----------- |
|   **720**   | t.b.d.    |             |        |              |

## Citations in different language and script 

| Test number | Procedure | Expectation | Result | Observations |
| :---------: | :-------- | :---------- | :----: | :----------- |
|   **730**   | t.b.d.    |             |        |              |





----

## 800 Internationalisation

### Changing locale selection

| Test number | Procedure | Expectation                                              | Result | Observations |
| :---------: | :-------- | :------------------------------------------------------- | :----: | :----------- |
|   **801**   |           | Switching the Zotero UI locale is recognised by MVZ      |        |              |
|   **802**   |           | MVZ main pane field names are correct Zotero translation |        |              |

### Language popup locale

| Test number | Procedure | Expectation                                      | Result | Observations |
| :---------: | :-------- | :----------------------------------------------- | :----: | :----------- |
|   **811**   |           | Language popup text language changed             |        |              |
|   **812**   |           | Language popup language options language changed |        |              |

### Extra popup locale

| Test number | Procedure | Expectation                       | Result | Observations |
| :---------: | :-------- | :-------------------------------- | :----: | :----------- |
|   **821**   |           | Extra popup text language changed |        |              |

### Preferences locale

| Test number | Procedure | Expectation                  | Result | Observations |
| :---------: | :-------- | :--------------------------- | :----: | :----------- |
|   **851**   |           | Preferences language changed |        |              |

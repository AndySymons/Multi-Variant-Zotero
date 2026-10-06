# TEST REPORT 

# MVZ1 version 1.0.0-alpha.4

05-Oct-2026 13:56 

Andrew Symons 

[toc]

# Summary

## Scope / test object 

All functions of the MVZ Plugin version **1.0.0-alpha.x** 

## Test Environment details 

- Mac OS version: **Tahoe 26.6.2 (25G83)**

- Zotero version: **10.0.5**  

## Progressions w.r.t. previous version 

Progress has been made on the preferences (they are now visible) but there is a problem with table layouts. 

Localisation seems to be working. I tested en-GB and (to a limited extent) pt-PT. 

## Regressions w.r.t. previous version 

Despite my feedback on tests 1-3 since Alpha.3, the Item pane (which was present in Alpha.3) is now missing completely. Most of the tests could therefore not be carried out at all. 

Due to the high incidence of “CANNOT TEST“ in this report, I left the Alpha.3 test results in the workspace because for all I know they are still not fixed? 

## Conclusion

Recommendation on readiness for release 1.0.0-Beta.1: **Not ready** 



----



# Detailed Test Results

## 100 Installation

### Plugin correctly installed

| Test number | Procedure                                                    | Expectation                                                  | Result | Observations |
| :---------: | :----------------------------------------------------------- | :----------------------------------------------------------- | :----: | :----------- |
|   **101**   | 1. Remove any previous MVZ plugin version2. Restart Zotero3. Instal the new version of the plugin 4. Restart Zotero | Installs on Zotero 10 test system with no errors             |  PASS  |              |
|   **102**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct logo                                        |  PASS  |              |
|   **103**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct description                                 |  PASS  |              |
|   **104**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct author                                      |  PASS  |              |
|   **105**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct version number                              |  PASS  |              |
|   **106**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct date                                        |  PASS  |              |
|   **107**   | Click on the link to the correct GitHub homepage             | The correct GitHub homepage is opened in the system default browser |  PASS  |              |
|   **108**   | Inspect Tools --> Plugins --> MVZ Plugin                     | Persistence: plugin still installed                          |  PASS  |              |

----



## 200 Main pane

### Registration and appearance

| Test number | Procedure                                                 | Expectation                                                  |    Result     | Observations                                                 |
| :---------: | :-------------------------------------------------------- | :----------------------------------------------------------- | :-----------: | :----------------------------------------------------------- |
|   **201**   | Go to main pane and inspect MVZ logo in the right toolbar | Logo is as image provided                                    |     FAIL      | Icon has text “Multi-variant Zotero” overlaid.               |
|   **202**   | Click MVZ logo in the right toolbar                       | Causes scroll to the MVZ pane                                |     PASS      |                                                              |
|   **203**   | Inspect the MVZ pane logo at the top                      | Logo as image provided                                       |     FAIL      | No logo at all                                               |
|   **204**   | Inspect the title at top of the MVZ pane                  | Should be “Multi-Variant Zotero”                             | COSMETIC FAIL | Current text “MVZ Variants” <br />—> Please change this to “Multi-Variant Zotero” for consistency. |
|   **205**   | Click the MVZ pane expand/collapse arrow                  | Expands/collapses the content                                |     FAIL      | There is no arrow. The pane is blank.                        |
|   **206**   | Select any item in the Library pane; inspect the MVZ pane | Main pane colour matches Zotero - normal all grey background, edit boxes white when selected. |  CANNOT TEST  |                                                              |
|   **207**   | Inspect the MVZ pane with any Item selected               | Main pane fonts match Zotero                                 |  CANNOT TEST  |                                                              |
|   **208**   | Inspect the MVZ pane with any Item selected               | Column alignment matches Zotero; field headings right-justified. |  CANNOT TEST  |                                                              |
|   **209**   | Inspect the MVZ pane with any Item selected               | Value boxes background goes white when selected, like Zotero |  CANNOT TEST  | Those that are grey do not go white when selected. Others are all white anyway. |

----



## 300 Preferences

### Registration

| Test number | Procedure                                      | Expectation                                                  | Result | Observations |
| :---------: | :--------------------------------------------- | :----------------------------------------------------------- | :----: | :----------- |
|   **301**   | Go to Zotero --> Preferences; inspect the list | MVZ Plugin preferences line under the Zotero preferences     |  PASS  |              |
|   **302**   | Go to Zotero --> Preferences; inspect the list | MVZ preferences with logo                                    |  PASS  |              |
|   **303**   | Click the MVZ preferences                      | Displays the three MVZ preference tabs - Target document - Field inclusion- Language/Script drop-down |  PASS  |              |

### Target document prefs

| Test number | Procedure | Expectation                                                  |    Result     | Observations                                                 |
| :---------: | :-------- | :----------------------------------------------------------- | :-----------: | :----------------------------------------------------------- |
|   **311**   |           | Target document characteristics - pane layout and appearance | COSMETIC FAIL | The two parts are next to each other. The second part “Transliteration and translation style” should be under the first part |
|   **312**   |           | Target document language can be changed                      |     PASS      | Great!                                                       |
|   **321**   |           | Target document style preferences                            |     FAIL      | There is some fixed text, no table layout or radio buttons to make a choice. |

### Field inclusion matrix

| Test number | Procedure                             | Expectation            | Result | Observations                                                 |
| :---------: | :------------------------------------ | :--------------------- | :----: | :----------------------------------------------------------- |
|   **331**   | Select the tab and inspect the layout | Field inclusion matrix |  FAIL  | The headers are there, the first row ‘album’ (should be “Album’?) to the right instead of underneath; then ‘Archive’ to the right; then it overflows the pane. |

### Language/script shortlists

| Test number | Procedure | Expectation                                       | Result | Observations                                                 |
| :---------: | :-------- | :------------------------------------------------ | :----: | :----------------------------------------------------------- |
|   **340**   |           | Language/script shortlists - Table layout         |  FAIL  | The second and additional items are inserted to the right instead of the previous, instead of underneath. |
|   **341**   |           | Language/script shortlists - can add languages    |  PASS  |                                                              |
|   **342**   |           | Language/script shortlists - can add scripts      |  PASS  |                                                              |
|   **344**   |           | Language/script shortlists - can delete languages |  PASS  |                                                              |
|   **345**   |           | Language/script shortlists - can delete scripts   |  PASS  |                                                              |
|   **346**   |           | Language/script shortlists - can edit a language  |  PASS  |                                                              |
|   **347**   |           | Language/script shortlists - can edit a script    |  PASS  |                                                              |





----

## 400 Main pane

### Regular field functionality

| Test number | Procedure | Expectation                                                |   Result    | Observations                   |
| :---------: | :-------- | :--------------------------------------------------------- | :---------: | :----------------------------- |
|   **401**   |           | Left column has correct UI locale field labels             | CANNOT TEST | Because there is no main pane! |
|   **402**   |           | All fields listed in Zotero are listed in MVZ except Extra | CANNOT TEST | Because there is no main pane! |
|   **403**   |           | MVZ fields Displayed in the same sequence as Zotero        | CANNOT TEST | Because there is no main pane! |
|   **404**   |           | Regular field values same as in the Zotero pane            | CANNOT TEST | Because there is no main pane! |
|   **404**   |           | Editing regular field value in MVZ mirrored in Zotero      | CANNOT TEST | Because there is no main pane! |
|   **405**   |           | Editing regular field value in Zotero mirrored in MVZ      | CANNOT TEST | Because there is no main pane! |
|   **411**   |           | Date added is not editable                                 | CANNOT TEST | Because there is no main pane! |
|   **412**   |           | Date modified is not editable                              | CANNOT TEST | Because there is no main pane! |

### Creator field functionality

| Test number | Procedure | Expectation                                                  |   Result    | Observations                   |
| :---------: | :-------- | :----------------------------------------------------------- | :---------: | :----------------------------- |
|   **451**   |           | Creator field values same as in the Zotero pane (on loading) | CANNOT TEST | Because there is no main pane! |
|   **452**   |           | Creator field label name                                     | CANNOT TEST | Because there is no main pane! |
|   **453**   |           | Creator field dropdown                                       | CANNOT TEST | Because there is no main pane! |
|   **454**   |           | Creator field type change takes effect                       | CANNOT TEST | Because there is no main pane! |
|   **455**   |           | Creator field type change in MVZ reflected in Zotero         | CANNOT TEST | Because there is no main pane! |
|   **456**   |           | Creator field type change in Zotero reflected in MVZ         | CANNOT TEST | Because there is no main pane! |
|   **457**   |           | Creator values change in MVZ reflected in Zotero             | CANNOT TEST | Because there is no main pane! |
|   **458**   |           | Creator values in Zotero reflected in MVZ                    | CANNOT TEST | Because there is no main pane! |
|   **459**   |           | Creator switch buttons appear when hovering on the line in MVZ | CANNOT TEST | Because there is no main pane! |
|   **460**   |           | Single name switch hover text                                | CANNOT TEST | Because there is no main pane! |
|   **461**   |           | Single name switch change in MVZ reflected in Zotero         | CANNOT TEST | Because there is no main pane! |
|   **470**   |           | Single name switch change Zotero reflected in MVZ            | CANNOT TEST | Because there is no main pane! |
|   **470**   |           | Creator delete button hover text                             | CANNOT TEST | Because there is no main pane! |
|   **471**   |           | Creator delete button deletes creator                        | CANNOT TEST | Because there is no main pane! |
|   **472**   |           | Creator delete in MVZ mirrored in Zotero                     | CANNOT TEST | Because there is no main pane! |
|   **473**   |           | Creator delete in Zotero mirrored in MVZ                     | CANNOT TEST | Because there is no main pane! |
|   **480**   |           | Creator add button hover text                                | CANNOT TEST | Because there is no main pane! |
|   **481**   |           | Creator add button adds a creator, when none present         | CANNOT TEST | Because there is no main pane! |
|   **482**   |           | Creator add button adds an additional creator, when at least one already present | CANNOT TEST | Because there is no main pane! |
|   **483**   |           | Creator add in MVZ mirrored in Zotero                        | CANNOT TEST | Because there is no main pane! |
|   **484**   |           | Creator add in Zotero mirrored in MVZ                        | CANNOT TEST | Because there is no main pane! |
|   **490**   |           | Creator context menu button hover text                       | CANNOT TEST | Because there is no main pane! |
|   **491**   |           | Creator context menu dropdown format                         | CANNOT TEST | Because there is no main pane! |
|   **492**   |           | Creator context menu dropdown names                          | CANNOT TEST | Because there is no main pane! |
|   **493**   |           | Creator context menu ‘Fix case’ greyed out if it does not need fixing | CANNOT TEST | Because there is no main pane! |
|   **494**   |           | Creator context menu ‘Fix case’ active if it needs fixing    | CANNOT TEST | Because there is no main pane! |
|   **495**   |           | Creator context menu ‘Fix case’ works                        | CANNOT TEST | Because there is no main pane! |
|   **496**   |           | Creator context menu ‘swap names’ works                      |             |                                |



----

## 500 Variants

### Regular field variants 

| Test number | Procedure | Expectation                                                  |   Result    | Observations                   |
| :---------: | :-------- | :----------------------------------------------------------- | :---------: | :----------------------------- |
|   **501**   |           | Left click on a field label (except Creator type) has no effect | CANNOT TEST | Because there is no main pane! |
|   **502**   |           | Right click on a field label enables a variant to be added   | CANNOT TEST | Because there is no main pane! |

### Creator field variants

| Test no | Expectation                                                  | STATUS      | Comments                       |
| ------- | ------------------------------------------------------------ | ----------- | ------------------------------ |
| **551** | Right click on a creator type label enables a variant to be added | CANNOT TEST | Because there is no main pane! |





----

## 600 Popups and listeners

### Language field popup

| Test number | Procedure | Expectation                                                  |   Result    | Observations                   |
| :---------: | :-------- | :----------------------------------------------------------- | :---------: | :----------------------------- |
|   **601**   |           | Language field popup in MVZ pane                             | CANNOT TEST | Because there is no main pane! |
|   **602**   |           | Language field popup in Zotero pane                          |    PASS     |                                |
|   **603**   |           | Can add a language with the popup                            |    PASS     |                                |
|   **604**   |           | Can remove a language (or erroneous code) with the popup     |    PASS     |                                |
|   **608**   |           | Updated list saved to the language field as a comma-separated list |    PASS     |                                |
|   **609**   |           | Focus removed after closing the popup                        |    PASS     |                                |

### Extra field popup

| Test number | Procedure | Expectation                                                  |   Result    | Observations                      |
| :---------: | :-------- | :----------------------------------------------------------- | :---------: | :-------------------------------- |
|   **611**   |           | Extra field popup (only in Zotero pane)                      |    PASS     |                                   |
|   **612**   |           | Editing anything other than MVZ tags in Extra still works (after acknowledging the warning) |    PASS     |                                   |
|   **613**   |           | Editing MVZ tags in Extra has no effect (reset to previous value) | CANNOT TEST | Because I cannot yet add variants |

### Creator listener

| Test number | Procedure | Expectation                                         |   Result    | Observations                   |
| :---------: | :-------- | :-------------------------------------------------- | :---------: | :----------------------------- |
|   **621**   |           | Creator listener in MVZ pane                        | CANNOT TEST | Because there is no main pane! |
|   **622**   |           | Creator listener updates MVZ                        | CANNOT TEST | Because there is no main pane! |
|   **630**   |           | MVZ tags updated corectly after deletion of creator | CANNOT TEST | Because there is no main pane! |



----

## 700 Citations

## General setup 

| Test number | Procedure | Expectation |   Result    | Observations                                                 |
| :---------: | :-------- | :---------- | :---------: | :----------------------------------------------------------- |
|   **700**   | t.b.d.    |             | CANNOT TEST | No testing on citations can start until variants can be added, and the language, style, and inclusion preferences can be set. |

## Citations in same language and script 

| Test number | Procedure | Expectation |   Result    | Observations                                                 |
| :---------: | :-------- | :---------- | :---------: | :----------------------------------------------------------- |
|   **710**   | t.b.d.    |             | CANNOT TEST | No testing on citations can start until variants can be added, and the language, style, and inclusion preferences can be set. |

## Citations in different language, same script 

| Test number | Procedure | Expectation |   Result    | Observations                                                 |
| :---------: | :-------- | :---------- | :---------: | :----------------------------------------------------------- |
|   **720**   | t.b.d.    |             | CANNOT TEST | No testing on citations can start until variants can be added, and the language, style, and inclusion preferences can be set. |

## Citations in different language and script 

| Test number | Procedure | Expectation |   Result    | Observations                                                 |
| :---------: | :-------- | :---------- | :---------: | :----------------------------------------------------------- |
|   **730**   | t.b.d.    |             | CANNOT TEST | No testing on citations can start until variants can be added, and the language, style, and inclusion preferences can be set. |





----

## 800 Internationalisation

### Changing locale selection

| Test number | Procedure | Expectation                                              |   Result    | Observations |
| :---------: | :-------- | :------------------------------------------------------- | :---------: | :----------- |
|   **801**   |           | Switching the Zotero UI locale is recognised by MVZ      |    PASS     |              |
|   **802**   |           | MVZ main pane field names are correct Zotero translation | CANNOT TEST |              |

### Language popup locale

| Test number | Procedure | Expectation                                      | Result | Observations |
| :---------: | :-------- | :----------------------------------------------- | :----: | :----------- |
|   **811**   |           | Language popup text language changed             |  PASS  |              |
|   **812**   |           | Language popup language options language changed |  PASS  |              |

### Extra popup locale

| Test number | Procedure | Expectation                       | Result | Observations |
| :---------: | :-------- | :-------------------------------- | :----: | :----------- |
|   **821**   |           | Extra popup text language changed |  PASS  |              |

### Preferences locale

| Test number | Procedure | Expectation                  | Result | Observations |
| :---------: | :-------- | :--------------------------- | :----: | :----------- |
|   **851**   |           | Preferences language changed |  PASS  |              |

# TEST REPORT 

# MVZ1 version 1.0.0-alpha.3

04-Oct-2026 20:10 

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
|   **101**   | 1. Remove any previous MVZ plugin version2. Restart Zotero3. Instal the new version of the plugin 4. Restart Zotero | Installs on Zotero 10 test system with no errors             |  PASS  |              |
|   **102**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct logo                                        |  PASS  |              |
|   **103**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct description                                 |  PASS  |              |
|   **104**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct author                                      |  PASS  |              |
|   **105**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct version number                              |  PASS  |              |
|   **106**   | Inspect Tools --> Plugins --> MVZ Plugin --> Click           | Displays correct date                                        |  PASS  |              |
|   **107**   | Click on the link to the correct GitHub homepage             | The correct GitHub homepage is opened in the system default browser |  PASS  |              |

----



## 200 Main pane

### Registration and appearance

| Test number | Procedure                                                 | Expectation                                                  | Result | Observations                                                 |
| :---------: | :-------------------------------------------------------- | :----------------------------------------------------------- | :----: | :----------------------------------------------------------- |
|   **201**   | Go to main pane and inspect MVZ logo in the right toolbar | Logo is as image provided                                    |  PASS  |                                                              |
|   **202**   | Click MVZ logo in the right toolbar                       | Causes scroll to the MVZ pane                                |  PASS  |                                                              |
|   **203**   | Inspect the MVZ pane logo at the top                      | Logo as image provided                                       |  FAIL  | Looks like the large icon cropped                            |
|   **204**   | Inspect the title at top of the MVZ pane                  | Should be “Multi-Variant Zotero”                             |  PASS  |                                                              |
|   **205**   | Click the MVZ pane expand/collapse arrow                  | Expands/collapses the content                                |  FAIL  | At the top of the MVZ pane the text “MVZ_ITEM_TYPE_LABEL” appears on the left, followed by the value <br />Under that is the correct label “Item Type” on a separate line. |
|   **206**   | Select any item in the Library pane; inspect the MVZ pane | Main pane colour matches Zotero - normal all grey background, edit boxes white when selected. |  FAIL  | Many fields (e.g. Title to # of Pages) are all white and the label font is black. Other fields (e.g. ISBN to Short title) are all grey and have the correct grey font. Just need right justification. |
|   **207**   | Inspect the MVZ pane with any Item selected               | Main pane fonts match Zotero                                 |  FAIL  | Field label font and colour do not match Zotero throughjpuiy |
|   **208**   | Inspect the MVZ pane with any Item selected               | Column alignment matches Zotero; field headings right-justified. |  FAIL  | Field labels are left justified; should be right justified   |
|   **209**   | Inspect the MVZ pane with any Item selected               | Value boxes background goes white when selected, like Zotero |  FAIL  | Those that are grey do not go white when selected. Others are all white anyway. |

----



## 300 Preferences

### Registration

| Test number | Procedure                                      | Expectation                                                  | Result | Observations                                                 |
| :---------: | :--------------------------------------------- | :----------------------------------------------------------- | :----: | :----------------------------------------------------------- |
|   **301**   | Go to Zotero --> Preferences; inspect the list | MVZ Plugin preferences line under the Zotero preferences     |  PASS  |                                                              |
|   **302**   | Go to Zotero --> Preferences; inspect the list | MVZ preferences with logo                                    |  FAIL  | No logo at all                                               |
|   **303**   | Click the MVZ preferences                      | Displays the three MVZ preference tabs - Target document - Field inclusion- Language/Script drop-down |  FAIL  | Still does not display MVZ preferences at all - stays at whatever the last selection was - same as in Alpha.1 and Alpha.2. |

### Target document prefs

| Test number | Procedure | Expectation                                                  |     Result     | Observations             |
| :---------: | :-------- | :----------------------------------------------------------- | :------------: | :----------------------- |
|   **311**   |           | Target document characteristics - pane layout and appearance | COULD NOT TEST | No preferences available |
|   **312**   |           | Target document language can be changed                      | COULD NOT TEST | No preferences available |
|   **321**   |           | Target document style preferences                            | COULD NOT TEST | No preferences available |

### Field inclusion matrix

| Test number | Procedure | Expectation            |     Result     | Observations             |
| :---------: | :-------- | :--------------------- | :------------: | :----------------------- |
|   **331**   |           | Field inclusion matrix | COULD NOT TEST | No preferences available |

### Language/script shortlists

| Test number | Procedure | Expectation                                       |     Result     | Observations             |
| :---------: | :-------- | :------------------------------------------------ | :------------: | :----------------------- |
|   **340**   |           | Language/script shortlists - Table layout         | COULD NOT TEST | No preferences available |
|   **341**   |           | Language/script shortlists - can add languages    | COULD NOT TEST | No preferences available |
|   **342**   |           | Language/script shortlists - can add scripts      | COULD NOT TEST | No preferences available |
|   **344**   |           | Language/script shortlists - can delete languages | COULD NOT TEST | No preferences available |
|   **345**   |           | Language/script shortlists - can delete scripts   | COULD NOT TEST | No preferences available |
|   **346**   |           | Language/script shortlists - can edit a language  | COULD NOT TEST | No preferences available |
|   **347**   |           | Language/script shortlists - can edit a script    | COULD NOT TEST | No preferences available |





----

## 400 Main pane

### Regular field functionality

| Test number | Procedure | Expectation                                                |     Result     | Observations                                                 |
| :---------: | :-------- | :--------------------------------------------------------- | :------------: | :----------------------------------------------------------- |
|   **401**   |           | Left column has correct UI locale field labels             |      PASS      | Except Item Type, see above                                  |
|   **402**   |           | All fields listed in Zotero are listed in MVZ except Extra | COULD NOT TEST | Several are listed but cannot be checked in detail as they are not properly labelled |
|   **403**   |           | MVZ fields Displayed in the same sequence as Zotero        |      PASS      |                                                              |
|   **404**   |           | Regular field values same as in the Zotero pane            |      PASS      |                                                              |
|   **404**   |           | Editing regular field value in MVZ mirrored in Zotero      |      PASS      |                                                              |
|   **405**   |           | Editing regular field value in Zotero mirrored in MVZ      |      FAIL      | MVZ field value is not updated immediately                   |
|   **411**   |           | Date added is not editable                                 |   NOT TESTED   |                                                              |
|   **412**   |           | Date modified is not editable                              |   NOT TESTED   |                                                              |

### Creator field functionality

| Test number | Procedure | Expectation                                                  |   Result   | Observations                                                 |
| :---------: | :-------- | :----------------------------------------------------------- | :--------: | :----------------------------------------------------------- |
|   **451**   |           | Creator field values same as in the Zotero pane (on loading) |    PASS    |                                                              |
|   **452**   |           | Creator field label name                                     |    FAIL    | The type name is correct, but the small triangle to indicate it is a drop is absent |
|   **453**   |           | Creator field dropdown                                       |    FAIL    | Instead of a dropdown it is a popup window with the title “MVZ_CREATOR_TYPE_MENU” (no title is needed). The selectable values are buttons rather than menu entries. They do have correct UI text. |
|   **454**   |           | Creator field type change takes effect                       |    PASS    | Clicking one of the buttons does change the creator type to the value on the button. |
|   **455**   |           | Creator field type change in MVZ reflected in Zotero         | NOT TESTED |                                                              |
|   **456**   |           | Creator field type change in Zotero reflected in MVZ         | NOT TESTED |                                                              |
|   **457**   |           | Creator values change in MVZ reflected in Zotero             | NOT TESTED |                                                              |
|   **458**   |           | Creator values in Zotero reflected in MVZ                    | NOT TESTED |                                                              |
|   **459**   |           | Creator switch buttons appear when hovering on the line in MVZ | NOT TESTED |                                                              |
|   **460**   |           | Single name switch hover text                                | NOT TESTED |                                                              |
|   **461**   |           | Single name switch change in MVZ reflected in Zotero         | NOT TESTED |                                                              |
|   **470**   |           | Single name switch change Zotero reflected in MVZ            | NOT TESTED |                                                              |
|   **470**   |           | Creator delete button hover text                             | NOT TESTED |                                                              |
|   **471**   |           | Creator delete button deletes creator                        | NOT TESTED |                                                              |
|   **472**   |           | Creator delete in MVZ mirrored in Zotero                     | NOT TESTED |                                                              |
|   **473**   |           | Creator delete in Zotero mirrored in MVZ                     | NOT TESTED |                                                              |
|   **480**   |           | Creator add button hover text                                | NOT TESTED |                                                              |
|   **481**   |           | Creator add button adds a creator, when none present         | NOT TESTED |                                                              |
|   **482**   |           | Creator add button adds an additional creator, when at least one already present | NOT TESTED |                                                              |
|   **483**   |           | Creator add in MVZ mirrored in Zotero                        | NOT TESTED |                                                              |
|   **484**   |           | Creator add in Zotero mirrored in MVZ                        | NOT TESTED |                                                              |
|   **490**   |           | Creator context menu button hover text                       | NOT TESTED |                                                              |
|   **491**   |           | Creator context menu dropdown format                         | NOT TESTED |                                                              |
|   **492**   |           | Creator context menu dropdown names                          | NOT TESTED |                                                              |
|   **493**   |           | Creator context menu ‘Fix case’ greyed out if it does not need fixing | NOT TESTED |                                                              |
|   **494**   |           | Creator context menu ‘Fix case’ active if it needs fixing    | NOT TESTED |                                                              |
|   **495**   |           | Creator context menu ‘Fix case’ works                        | NOT TESTED |                                                              |
|   **496**   |           | Creator context menu ‘swap names’ works                      | NOT TESTED |                                                              |



----

## 500 Variants

### Creator field variants

| Test number | Procedure | Expectation                                                  |     Result     | Observations             |
| :---------: | :-------- | :----------------------------------------------------------- | :------------: | :----------------------- |
|   **501**   |           | Left click on a field label (except Creator type) has no effect | COULD NOT TEST | Variants cannot be added |
|   **502**   |           | Right click on a field label enables a variant to be added   | COULD NOT TEST | Variants cannot be added |
|   **551**   |           | Right click on a creator type label enables a variant to be added | COULD NOT TEST | Variants cannot be added |



----

## 600 Popups and listeners

### Language field popup

| Test number | Procedure | Expectation                                                  |   Result   | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :--------: | :----------- |
|   **601**   |           | Language field popup in MVZ pane                             | NOT TESTED |              |
|   **602**   |           | Language field popup in Zotero pane                          | NOT TESTED |              |
|   **603**   |           | Can add a language with the popup                            | NOT TESTED |              |
|   **604**   |           | Can remove a language (or erroneous code) with the popup     | NOT TESTED |              |
|   **608**   |           | Updated list saved to the language field as a comma-separated list | NOT TESTED |              |
|   **609**   |           | Focus removed after closing the popup                        | NOT TESTED |              |

### Extra field popup

| Test number | Procedure | Expectation                                                  |   Result   | Observations |
| :---------: | :-------- | :----------------------------------------------------------- | :--------: | :----------- |
|   **611**   |           | Extra field popup (only in Zotero pane)                      | NOT TESTED |              |
|   **612**   |           | Editing anything other than MVZ tags in Extra still works (after acknowledging the warning) | NOT TESTED |              |
|   **613**   |           | Editing MVZ tags in Extra has no effect (reset to previous value) | NOT TESTED |              |

### Creator listener

| Test number | Procedure | Expectation                                         |   Result   | Observations |
| :---------: | :-------- | :-------------------------------------------------- | :--------: | :----------- |
|   **621**   |           | Creator listener in MVZ pane                        | NOT TESTED |              |
|   **622**   |           | Creator listener updates MVZ                        | NOT TESTED |              |
|   **630**   |           | MVZ tags updated corectly after deletion of creator | NOT TESTED |              |



----

## 700 Citations

## General setup 

| Test number | Procedure | Expectation |   Result   | Observations |
| :---------: | :-------- | :---------- | :--------: | :----------- |
|   **700**   | t.b.d.    |             | NOT TESTED |              |

## Citations in same language and script 

| Test number | Procedure | Expectation |   Result   | Observations |
| :---------: | :-------- | :---------- | :--------: | :----------- |
|   **710**   | t.b.d.    |             | NOT TESTED |              |

## Citations in different language, same script 

| Test number | Procedure | Expectation |   Result   | Observations |
| :---------: | :-------- | :---------- | :--------: | :----------- |
|   **720**   | t.b.d.    |             | NOT TESTED |              |

## Citations in different language and script 

| Test number | Procedure | Expectation |   Result   | Observations |
| :---------: | :-------- | :---------- | :--------: | :----------- |
|   **730**   | t.b.d.    |             | NOT TESTED |              |





----

## 800 Internationalisation

### Changing locale selection

| Test number | Procedure | Expectation                                              |   Result   | Observations |
| :---------: | :-------- | :------------------------------------------------------- | :--------: | :----------- |
|   **801**   |           | Switching the Zotero UI locale is recognised by MVZ      | NOT TESTED |              |
|   **802**   |           | MVZ main pane field names are correct Zotero translation | NOT TESTED |              |

### Language popup locale

| Test number | Procedure | Expectation                                      |   Result   | Observations |
| :---------: | :-------- | :----------------------------------------------- | :--------: | :----------- |
|   **811**   |           | Language popup text language changed             | NOT TESTED |              |
|   **812**   |           | Language popup language options language changed | NOT TESTED |              |

### Extra popup locale

| Test number | Procedure | Expectation                       |   Result   | Observations |
| :---------: | :-------- | :-------------------------------- | :--------: | :----------- |
|   **821**   |           | Extra popup text language changed | NOT TESTED |              |

### Preferences locale

| Test number | Procedure | Expectation                  |   Result   | Observations |
| :---------: | :-------- | :--------------------------- | :--------: | :----------- |
|   **851**   |           | Preferences language changed | NOT TESTED |              |

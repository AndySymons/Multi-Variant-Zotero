# TEST REPORT 

# MVZ1 version 1.0.0-alpha.2

03-Oct-2026 21:52

Andrew Symons 





# Alpha test results

| Area                 | Expectation                                               | Value / Function                                             | Status         | Comments                                                     |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------ | -------------- | ------------------------------------------------------------ |
| Installation         | Installs on Zotero 10 test system with no errors          | —                                                            | PASS           |                                                              |
| Installation         | Displays correct logo                                     | As 64x64 image provided                                      | PASS           |                                                              |
| Installation         | Displays correct description                              | Multi-variant language and script support for bibliographic metadata. | PASS           |                                                              |
| Installation         | Displays correct author                                   | Andy Symons                                                  | PASS           |                                                              |
| Installation         | Displays correct version number                           | 1.0.0.-alpha.2                                               | PASS           |                                                              |
| Installation         | Displays correct date                                     | 3 October 2026                                               | PASS           |                                                              |
| Installation         | Live link to the correct GitHub homepage                  | https://github.com/AndySymons/Multi-Variant-Zotero           | PASS           |                                                              |
| Right toolbar icon   | MVZ logo in the right toolbar                             | As image provided                                            | PASS           |                                                              |
| Right toolbar icon   | … causes scroll to the MVZ pane                           | Yes                                                          | PASS           |                                                              |
| Main pane            | Logo at the top of the pane                               | As image provided?                                           | SOFT FAIL      | Looks like the large icon cropped; use the small one like in the toolbar |
| Main pane            | Expand/collapse arrow on the right                        | Expands and collapses                                        | PASS           |                                                              |
| Main pane            | Displayed in the same order as Zotero does.               | —                                                            | COULD NOT TEST |                                                              |
| Main pane            | All creators and fields that can have variants are listed | —                                                            | COULD NOT TEST | Several are listed but cannot be checked in detail due to the following errors |
| Main pane            | Variant regular field label                               | Base field locale UI name on a grey background               | FAIL           | They are all called “MVZ_BASE_FIELD”  and have a white background |
| Main pane            | Variant creator field label                               | Creator[i]                                                   | FAIL           | They are all called “MVZ_CREATOR_FIELD_LABEL”                |
| Main pane            | Variant second label                                      | `L`or `S`                                                    | FAIL           | Missing                                                      |
| Main pane            | Variant third label                                       | language tag; f                                              | FAIL           | Missing                                                      |
| Main pane            | Variant value                                             | Blank until the user fills it in                             | FAIL           | Is a copy of the base field value                            |
| On the right         | Add and delete buttons                                    | button: `+L` should create a new L-type variant              | FAIL           | Pressing the button enters the select language popup (placeholders) - OK <br />The buttons are named after the tokens rather than their UI names.  <br />Pressed `MVZ_OK_BUTTON`. Variant `mvz/l/title/zte-Latn` was created in Extra but with no value.  <br />Variant line created on the main pane but entering the value does not put the value in the Extra field tag.  <br />I also tried this on a creator field, ` mvz/l/creator[0]/aio-Mymr:` was created within value. |
| On the right         | Add and delete buttons                                    | buttons:`S` should create a new S-type variant               | FAIL           | Pressing the button enters the select script popup - OK.<br /> The buttons are named after the tokens rather than their UI names. <br /> Pressed  `MVZ_OK_BUTTON`: instead of creating a variant on the main pane it removed the one I already had! <br />Variant `mvz/s/title/Phiv:` was created but with no value. <br />The value of the first L-type variant `mvz/l/title/bip-Latn: `was then filled in! <br />Adding a new L-Type variant removed both existing variants from Extra. |
| On the right         | Add and delete buttons                                    | buttons:  `-`.                                               | FAIL           | Missing                                                      |
| Language field popup |                                                           |                                                              | FAIL           | Nothing happened when I entered the Extra field.             |
| Extra field popup    |                                                           |                                                              | FAIL           | Nothing happened when I entered the Extra field.             |
| Creator listener     |                                                           |                                                              | COULD NOT TEST | ... because I cannot make variants to delete                 |
| Settings             | MVZ Plugin preferences registered                         |                                                              | PASS           |                                                              |
| Settings             | … with logo                                               |                                                              | PASS           |                                                              |
| Settings             | Displays the four MVZ preference tabs                     |                                                              | FAIL           | Does not display MVZ preferences at all - stays at whatever the last selection was - same as in Alpha.1 |

Summary: 

1. Need proper Language and Script options instead of placeholders 
2. Need UI message tokens resolved to UI locale names
3. Need a close look at the specification for the main pane layout 
   1. No copy of the base field required - the first line for a field is for the first variant    
   2. Labels and buttons except the field name apply to all variant lines 
   3. Need to resolve UI locale names 
   4. Need real time interaction with the Extra field. Variant is not complete until it has a value.  




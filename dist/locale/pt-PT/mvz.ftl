# MVZ Plugin - pt-PT locale
#
# Machine translation of the en-GB reference locale (SPECIFICATION_MVZ1_PLUGIN.md
# > "Supported languages"). Included for alpha-testing locale switching only.

## MVZ Pane (Appendix 1 examples)

MVZ_DUPLICATE_VARIANT = Erro: o campo "{ $field_name }" já tem uma variante para "{ $language_tag }"
MVZ_BASE_FIELD = { $base_field_name }
MVZ_VARIANT = { $language_tag }

## MVZ Pane - geral

MVZ_PANE_TITLE = Variantes MVZ
MVZ_PANE_SECTION_TOOLTIP = Multi-Variant Zotero
MVZ_CREATOR_FIELD_LABEL = Autor[{ $this_creator_index }]
MVZ_TYPE_INDICATOR_L = L
MVZ_TYPE_INDICATOR_S = S
MVZ_ADD_LANGUAGE_VARIANT_TOOLTIP = Adicionar variante de tradução (idioma)
MVZ_ADD_SCRIPT_VARIANT_TOOLTIP = Adicionar variante de transliteração (escrita)
MVZ_DELETE_VARIANT_TOOLTIP = Eliminar variante
MVZ_DELETE_VARIANT_CONFIRM_TITLE = Eliminar variante?
MVZ_DELETE_VARIANT_CONFIRM_BODY = Tem a certeza de que deseja eliminar esta variante?
MVZ_FIELD_BLANK_TOOLTIP = Introduza um valor em { $field_name } acima antes de adicionar uma variante

## Janela de idioma / limpeza

MVZ_LANGUAGE_NOT_CLEAN_TITLE = O campo Idioma precisa de ser limpo
MVZ_LANGUAGE_NOT_CLEAN_BODY = O campo Idioma do item tem de ser uma lista limpa, separada por vírgulas, de códigos de idioma BCP-47 antes de poderem ser adicionadas variantes. Clique para abrir o editor do campo Idioma.
MVZ_LANGUAGE_FIELD_EDITOR_TITLE = Idioma
MVZ_LANGUAGE_FIELD_ADD_BUTTON = +
MVZ_LANGUAGE_FIELD_REMOVE_BUTTON = -
MVZ_LANGUAGE_UNRECOGNIZED_ANOMALY = Idioma não reconhecido: "{ $token }"
MVZ_LANGUAGE_NORMALIZED_ANOMALY = "{ $token }" normalizado para um código de idioma BCP-47

## Janela do campo Extra

MVZ_EXTRA_WARNING = Aviso: as edições às etiquetas MVZ serão ignoradas
MVZ_EXTRA_WARNING_BUTTON = Compreendido

## Monitor de autores (invisível exceto em caso de erro)

MVZ_CREATOR_SYNC_ERROR_TITLE = Erro de variante de autor MVZ
MVZ_CREATOR_SYNC_ERROR_BODY = O MVZ não conseguiu manter as variantes de autor sincronizadas com a base de dados (o campo Extra pode estar corrompido). Detalhes: { $error_message }

## Erros de gravação / base de dados

MVZ_SAVE_ERROR_TITLE = O MVZ não conseguiu guardar
MVZ_SAVE_ERROR_BODY = Ocorreu um erro ao guardar as variantes MVZ: { $error_message }

## Interface comum - editor de etiquetas de escrita/idioma

MVZ_PICK_SCRIPT_TITLE = Selecionar uma escrita
MVZ_PICK_LANGUAGE_TITLE = Selecionar um idioma
MVZ_PICK_REGION_TITLE = Selecionar uma região (opcional)
MVZ_PICK_ADD_LANGUAGE = Adicionar um idioma
MVZ_PICK_ADD_REGION = Adicionar uma região
MVZ_PICK_ADD_SCRIPT = Adicionar / substituir uma escrita
MVZ_SEARCH_PLACEHOLDER = Escreva para pesquisar…
MVZ_LIST_ADD_BUTTON = +
MVZ_LIST_REMOVE_BUTTON = -
MVZ_LANGUAGE_ALREADY_IN_ITEM = "{ $language_tag }" já consta do campo Idioma deste item; uma variante de tradução é desnecessária.
MVZ_SCRIPT_ALREADY_IN_ITEM = "{ $script_tag }" corresponde à escrita deste item; uma variante de transliteração é desnecessária.
MVZ_OK_BUTTON = OK
MVZ_CANCEL_BUTTON = Cancelar

## Painel de definições

MVZ_SETTINGS_PANE_TITLE = Plugin MVZ
MVZ_TAB_TARGET_DOCUMENT = Características do documento de destino
MVZ_TAB_FIELD_INCLUSION = Matriz de inclusão de campos
MVZ_TAB_SCRIPT_LANGUAGE_LISTS = Listas de escrita e idioma
MVZ_TARGET_LANGUAGE_LABEL = Idioma do documento de destino
MVZ_STYLE_SECTION_LABEL = Estilo de transliteração e tradução
MVZ_STYLE_OPTION_APA = APA / Chicago
MVZ_STYLE_OPTION_MLA = MLA
MVZ_STYLE_OPTION_MHRA = MHRA
MVZ_STYLE_OPTION_CUSTOM = Personalizado
MVZ_STYLE_CUSTOM_STANDALONE_LABEL = Modelo personalizado (itens autónomos)
MVZ_STYLE_CUSTOM_CONTAINED_LABEL = Modelo personalizado (itens contidos)
MVZ_FIELD_MATRIX_COL_FIELD = Campos
MVZ_FIELD_MATRIX_COL_ORIGINAL = Original
MVZ_FIELD_MATRIX_COL_TRANSLITERATION = Transliteração
MVZ_FIELD_MATRIX_COL_TRANSLATION = Tradução
MVZ_FIELD_MATRIX_ALL_CREATORS = * Todos os tipos de autor (escolha 1)
MVZ_SCRIPT_SHORTLIST_LABEL = Lista rápida de escritas
MVZ_LANGUAGE_SHORTLIST_LABEL = Lista rápida de idiomas
MVZ_SHORTLIST_ADD = +
MVZ_SHORTLIST_REMOVE = -

## Arranque / motor de citações

MVZ_CITEPROC_HOOK_UNAVAILABLE_TITLE = Funcionalidade de citação MVZ desativada
MVZ_CITEPROC_HOOK_UNAVAILABLE_BODY = O MVZ não encontrou a função de dados de citação esperada do Zotero, pelo que as transliterações e traduções não serão adicionadas às citações. O painel MVZ continuará a funcionar normalmente.

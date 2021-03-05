# Using Live Editor with CDN

Client js address: (change version number by yourself)

```
https://cdn.jsdelivr.net/npm/live-editor@0.0.34/client/src/index.js
```

## Code

```html
<script src='https://cdn.jsdelivr.net/npm/live-editor@0.0.35/client/src/index.js' charset="utf-8"></script>

<script>
const {
  EditorUser,
  Editor,
  createEditorPromise,
  assert,
  BlockElement,
  blockUtils,
  containerUtils,
  CommandItemData,
  MenuItem,
  domUtils,
  getEditor,
  AuthMessage,
  OnProgress,
  EditorOptions,
  SelectionDetail,
  EditorDoc,
} = window.LiveEditor;
</script>
```

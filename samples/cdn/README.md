# Using Live Editor with CDN

Client js address: (change version number by yourself)

```
https://cdn.jsdelivr.net/npm/live-editor@0.0.22/client/src/index.js
```

## Code

```js
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
```

### Enable Real-Time Co-Editing in Applications


#### Install

npm:
```bash
npm install live-editor
```

yarn:
```bash
yarn add live-editor
```

#### Start server

```js
const { startServer } = require('live-editor/server');

const options = {
  enableFakeTokenApi: true, // enable fake token api only in test environment
};

startServer(options); // default port: 9000
```

#### Client

```ts
import {
  createEditorPromise,
  AuthMessage,
} from 'live-editor/client';

// Don't change this for demo.
const AppId = '_LC1xOdRp';

// Editor service server address
const WsServerUrl = `ws://localhost:9000`;

// create a random editor user
// user id and display name is needed by editor service
const user = {
  userId: `${new Date().valueOf()}`,
  displayName: 'test user',
};

// editor options
const options = {
  serverUrl: WsServerUrl,
  user,
};

// get a editor service token.
async function fakeGetAccessTokenFromServer(userId: string, docId: string): Promise<string> {
  const res = await fetch(`http://localhost:9000/token/${AppId}/${docId}/${userId}`);
  const ret = await res.json();
  return ret.token;
}

// document id
const docId = 'my-test-doc-id-simple';

(async function loadDocument() {
  // get an editor access token. Web Apps should get this token from your own server
  const token = await fakeGetAccessTokenFromServer(user.userId, docId);

  // editor auth data
  const auth: AuthMessage = {
    appId: AppId,
    userId: user.userId,
    docId,
    token,
    permission: 'w',
  };

  // create editor and load document
  const editor = await createEditorPromise(document.getElementById('editor') as HTMLElement, options, auth);
  console.log(editor);
})();
```

### react demo

[react demo](./samples/react)

### Features

Real-Time co-editing.

#### Text style

* heading
* list (ordered / unordered)
* checkbox
* quoted text
* text color and background color.
* bold, italic, underline, strikethrough.
* any custom style (any css style).

#### Inline objects

* Link
* Latex equations
* Mentions
* Custom inline object
* Comment (Add comment to any text)

#### Blocks

* Image, Video, Audio
* Table
* Webpage (YouTube videos, etc.)
* Flowchart, Sequence Diagram, Class Diagram, etc. (mermaid)
* Diagram (drawio)
* Layout

##### Block state
* locked / unlocked
* marker highlighter

### Editor Features

* support markdown syntax
* support offline mode (editor server is not needed)
* support markdown-only mode (only support markdown features)
* import / export markdown
* export html
* import docx files
/* eslint-disable no-alert */
import {
  createEditorPromise,
  AuthMessage,
  EditorOptions,
} from 'live-editor/client';

function hideElement(id: string) {
  const elem = document.getElementById(id);
  if (!elem) return;
  elem.style.display = 'none';
}

hideElement('header');
hideElement('toolbar');

// Don't change this for demo.
const AppId = '_LC1xOdRp';

// Server address
const WsServerUrl = window.location.protocol !== 'https:'
  ? `ws://${window.location.host}`
  : `wss://${window.location.host}`;

// create a random editor user
// user id and display name is needed by editor service
const user = {
  userId: `${new Date().valueOf()}`,
  displayName: 'test user',
  avatarUrl: 'https://www.live-editor.com/wp-content/new-uploads/a0919cb4-d3c2-4027-b64d-35a4c2dc8e23.png',
};

// editor options
const options: EditorOptions = {
  serverUrl: WsServerUrl,
  titleInEditor: true,
};

async function fakeGetAccessTokenFromServer(userId: string, docId: string): Promise<string> {
  const res = await fetch(`http://${window.location.host}/token/${AppId}/${docId}/${userId}`);
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
    ...user,
    docId,
    token,
    permission: 'w',
  };

  // create editor and load document
  const editor = await createEditorPromise(document.getElementById('editor') as HTMLElement, options, auth);
  console.log(editor);
})();

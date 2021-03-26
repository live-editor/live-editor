/* eslint-disable no-alert */
import {
  createEditor,
  boxUtils,
  BoxData,
  BoxNode,
  BoxTextChild,
  Editor,
  BoxTemplateData,
  BOX_TYPE,
  AuthMessage,
} from 'live-editor/client';

function hideElement(id: string) {
  const elem = document.getElementById(id);
  if (!elem) return;
  elem.style.display = 'none';
}

hideElement('header');
hideElement('toolbar');


// -------------------create a custom date item----------
const DATE_BOX_TYPE = 'date';

interface DateBoxData extends BoxData {
  text: string;
};

function createNode(editor: Editor, data: BoxData): BoxNode {
  //
  const { text } = data as DateBoxData;
  //
  return {
    classes: ['box-mention'],
    children: [{
      type: 'text',
      text,
    } as BoxTextChild],
  };
}

function handleBoxInserted(editor: Editor, data: BoxData): void {
  const dateData = data as DateBoxData;
  console.log('date box inserted:', dateData);
}

function handleBoxClicked(editor: Editor, data: BoxData): void {
  const dateData = data as DateBoxData;
  alert(`date clicked: ${dateData.text}`);
}

async function createBoxData(editor: Editor): Promise<BoxTemplateData | null> {
  return {
    text: new Date().toLocaleDateString(),
  };
}


const dateBox = {
  prefix: 'dd',
  createNode,
  handleBoxInserted,
  handleBoxClicked,
  createBoxData,
};

boxUtils.registerBoxType(DATE_BOX_TYPE as BOX_TYPE, dateBox);

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
const options = {
  serverUrl: WsServerUrl,
  user,
};

async function fakeGetAccessTokenFromServer(userId: string, docId: string): Promise<string> {
  const res = await fetch(`http://${window.location.host}/token/${AppId}/${docId}/${userId}`);
  const ret = await res.json();
  return ret.token;
}

// document id
const docId = 'my-test-doc-id-box-date';

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
  const editor = createEditor(document.getElementById('editor') as HTMLElement, options, auth);
})();

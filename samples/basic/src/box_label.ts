/* eslint-disable no-alert */
import {
  createEditor,
  assert,
  boxUtils,
  BoxData,
  BoxNode,
  BoxTemplateData,
  BoxTextChild,
  Editor,
  AutoSuggestData,
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


// -------------------create a custom label item----------
const LABEL_BOX_TYPE = 'label';

interface LabelBoxData extends BoxData {
  color: string;
};

function createNode(editor: Editor, data: BoxData): BoxNode {
  //
  const { color } = data as LabelBoxData;
  //
  return {
    classes: [`label-${color}`, 'label'],
    children: [{
      type: 'text',
      text: color,
    } as BoxTextChild],
  };
}

function handleBoxInserted(editor: Editor, data: BoxData): void {
  const calendarData = data as LabelBoxData;
  console.log('label box inserted:', calendarData);
}

function handleBoxClicked(editor: Editor, data: BoxData): void {
  const calendarData = data as LabelBoxData;
  alert(`label clicked: ${calendarData.color}`);
}

async function getItems(editor: Editor, keywords: string): Promise<AutoSuggestData[]> {
  console.log(keywords);
  return [{
    iconUrl: '',
    text: 'red',
    id: 'red',
    data: '',
  }, {
    iconUrl: '',
    text: 'green',
    id: 'green',
    data: '',
  }, {
    iconUrl: '',
    text: 'blue',
    id: 'blue',
    data: '',
  }];
}

function createBoxDataFromItem(editor: Editor, item: AutoSuggestData): BoxTemplateData {
  const color = item.id;
  return {
    color,
  };
}

function renderAutoSuggestItem(editor: Editor, suggestData: AutoSuggestData): HTMLElement {
  const div = document.createElement('div');
  div.setAttribute('style', `background-color: ${suggestData.text}; border-radius: 10px; width: 100%; height: 24px`);
  return div;
}

const labelBox = {
  prefix: 'll',
  createNode,
  getItems,
  createBoxDataFromItem,
  handleBoxInserted,
  handleBoxClicked,
  renderAutoSuggestItem,
};

boxUtils.registerBoxType(LABEL_BOX_TYPE as BOX_TYPE, labelBox);

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
const docId = 'my-test-doc-id-box-label';

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
  const editor = createEditor(document.getElementById('editor') as HTMLElement, options, auth);
})();

/* eslint-disable no-alert */
import {
  createEditor,
  assert,
  AutoSuggestData,
  docData2Text,
  AuthMessage,
  AuthPermission,
  EditorOptions,
  Editor,
} from 'live-editor/client';

function hideElement(id: string) {
  const elem = document.getElementById(id);
  if (!elem) return;
  elem.style.display = 'none';
}

hideElement('header');
hideElement('toolbar');

const AppId = '_LC1xOdRp';

// --------------------------- mention data ----------------
const NAMES = [
    'William',
  'James',
  'Harper',
  'Mason',
  'Evelyn',
  'Ella',
  'Jackson',
  'Avery',
];

const ALL_USERS = [{
  iconUrl: 'https://www.live-editor.com/wp-content/new-uploads/2f4c76a6-db63-4de1-a5c0-28cf36384b7e.png',
  text: 'Steve',
  id: 'steve@mycompany.com',
  data: '',
}, {
  iconUrl: 'https://www.live-editor.com/wp-content/new-uploads/fc728217-55e3-4d09-b034-07a9960a6b39.png',
  text: 'zTree',
  id: 'james@mycompany.com',
  data: '',
}];

NAMES.forEach((name) => {
  const user = {
    iconUrl: 'https://www.live-editor.com/wp-content/new-uploads/a0919cb4-d3c2-4027-b64d-35a4c2dc8e23.png',
    text: name,
    id: name,
    data: name,
  };
  ALL_USERS.push(user);
});

async function fakeGetMentionItems(editor: Editor, keywords: string): Promise<AutoSuggestData[]> {
  assert(keywords !== undefined);
  console.log(keywords);
  if (!keywords) {
    return ALL_USERS;
  }
  return ALL_USERS.filter((user) => user.text.toLowerCase().indexOf(keywords.toLowerCase()) !== -1);
}

const urlQuery = new URLSearchParams(window.location.search);

const WsServerUrl = window.location.protocol !== 'https:'
  ? `ws://${window.location.host}`
  : `wss://${window.location.host}`;

const user = {
  avatarUrl: 'https://www.live-editor.com/wp-content/new-uploads/a0919cb4-d3c2-4027-b64d-35a4c2dc8e23.png',
  userId: `${new Date().valueOf()}`,
  displayName: NAMES[new Date().valueOf() % NAMES.length],
};

function replaceUrl(docId: string) {
  const now = window.location.href;
  if (now.endsWith(docId)) return;
  //
  const newUrl = `${window.location.origin}/?id=${docId}`;
  window.history.pushState({}, '', newUrl);
}

function handleSave(editor: Editor, data: any) {
  console.log(JSON.stringify(data, null, 2));
  const text = docData2Text(data);
  console.log('------------------- document text --------------------');
  console.log(text);
  console.log('------------------------------------------------------');
}

function handleLoad(editor: Editor, data: any): void {
  console.log(`${editor.docId()} loaded`);
  assert(data);
  replaceUrl(editor.docId());
}

function handleError(editor: Editor, error: Error): void {
  console.log(`${editor.docId()} error: ${error}`);
  alert(error);
}

async function fakeGetAccessTokenFromServer(userId: string, docId: string, permission: AuthPermission): Promise<string> {
  const res = await fetch(`http://${window.location.host}/token/${AppId}/${docId}/${userId}`);
  const ret = await res.json();
  return ret.token;
}

async function loadDocument(docId: string) {
  const options: EditorOptions = {
    serverUrl: WsServerUrl,
    placeholder: 'Type here...',
    titleInEditor: true,
    callbacks: {
      onSave: handleSave,
      onLoad: handleLoad,
      onError: handleError,
      onGetMentionItems: fakeGetMentionItems,
    },
  };

  const token = await fakeGetAccessTokenFromServer(user.userId, docId, 'w');
  const auth: AuthMessage = {
    appId: AppId,
    ...user,
    permission: 'w',
    docId,
    token,
  };

  createEditor(document.getElementById('editor') as HTMLElement, options, auth);
}

const docId = urlQuery.get('id') || '_ny1Adsk2';
loadDocument(docId);

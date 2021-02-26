/* eslint-disable no-alert */
import {
  Editor,
  createEditor,
  assert,
  AutoSuggestData,
  MentionBoxData,
  blockUtils,
  BlockElement,
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
};

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

const ALL_USERS: AutoSuggestData[] = [];

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

function handleMentionInserted(editor: Editor, boxData: MentionBoxData, block: BlockElement, pos: number) {
  console.log(`mention ${JSON.stringify(boxData)} inserted at ${pos}`);
  const leftText = blockUtils.toText(block, 0, pos);
  const rightText = blockUtils.toText(block, pos + 1, -1);
  alert(`context text:\n\n${leftText}\n\n${rightText}`);
}

function handleMentionClicked(editor: Editor, boxData: MentionBoxData) {
  alert(`you clicked ${boxData.text} (${boxData.mentionId})`);
}

// editor options
const options: EditorOptions = {
  serverUrl: WsServerUrl,
  user,
  callbacks: {
    onGetMentionItems: fakeGetMentionItems,
    onMentionInserted: handleMentionInserted,
    onMentionClicked: handleMentionClicked,
  },
};

async function fakeGetAccessTokenFromServer(userId: string, docId: string): Promise<string> {
  const res = await fetch(`http://${window.location.host}/token/${AppId}/${docId}/${userId}`);
  const ret = await res.json();
  return ret.token;
}

// document id
const docId = 'my-test-doc-id-mention';

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

/* eslint-disable no-alert */
import {
  createEditor,
  assert,
  boxUtils,
  BoxData,
  BoxNode,
  BoxImageChild,
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


// -------------------create a custom calendar item----------
const CALENDAR_IMAGE_URL = 'https://www.live-editor.com/wp-content/new-uploads/cdcb264d-2b3f-493d-829d-c9d202e2b808.jpeg';
const CALENDAR_BOX_TYPE = 'calendar';

interface CalendarBoxData extends BoxData {
  text: string;
};

function createNode(editor: Editor, data: BoxData): BoxNode {
  //
  const { text } = data as CalendarBoxData;
  //
  return {
    classes: ['box-mention'],
    children: [{
      type: 'image',
      src: CALENDAR_IMAGE_URL,
      attributes: {
        class: '.calendar_image',
      },
    } as BoxImageChild, {
      type: 'text',
      text,
    } as BoxTextChild],
  };
}

function handleBoxInserted(editor: Editor, data: BoxData): void {
  const calendarData = data as CalendarBoxData;
  console.log('calendar box inserted:', calendarData);
}

function handleBoxClicked(editor: Editor, data: BoxData): void {
  const calendarData = data as CalendarBoxData;
  alert(`calendar clicked: ${calendarData.text}`);
}

async function getItems(editor: Editor, keywords: string) {
  console.log(keywords);
  return [{
    iconUrl: CALENDAR_IMAGE_URL,
    text: 'Select one event...',
    id: 'selectEvent',
    data: '',
  }, {
    iconUrl: CALENDAR_IMAGE_URL,
    text: 'Create one event...',
    id: 'createEvent',
    data: '',
  }];
}

function handleBoxItemSelected(editor: Editor, item: AutoSuggestData): void {
  //
  const pos = editor.saveSelectionState();
  //
  if (item.id === 'selectEvent') {
    alert('select one event');
    //
  } else if (item.id === 'createEvent') {
    alert('create one event');
    //
  }
  //
  if (!editor.restoreSelectionState(pos)) {
    return;
  }
  //
  editor.insertBox(CALENDAR_BOX_TYPE as BOX_TYPE, null, {
    text: new Date().toLocaleDateString(),
  }, {
    deletePrefix: true,
  });
}

const calendarBox = {
  prefix: '//',
  createNode,
  getItems,
  handleBoxItemSelected,
  handleBoxInserted,
  handleBoxClicked,
};

boxUtils.registerBoxType(CALENDAR_BOX_TYPE as BOX_TYPE, calendarBox);

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
const docId = 'my-test-doc-id-box-calendar';

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

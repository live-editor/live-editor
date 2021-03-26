import {
  createEditorPromise,
  assert,
  Editor,
  AuthMessage,
  EditorDoc,
  genId,
  EditorOptions,
  DocBlock,
  OnlineUser,
} from 'live-editor/client';
import axios from 'axios';
import './styles/editor.css';
import debounce from 'lodash.debounce';
import Clipboard from 'clipboard';

const USER_NAMES = [
  'William',
  'James',
  'Harper',
  'Mason',
  'Evelyn',
  'Ella',
  'Jackson',
];

const userIndex = new Date().valueOf() % USER_NAMES.length;
const userId = `${USER_NAMES[userIndex]}`;
let appId: string | null = null;
let showList = false;

function createdListItem(doc: {title: string; docId: string;}, isActive: boolean = false) {
  const option = document.createElement('li');
  option.classList.add('doc-list-item');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.innerHTML = `<svg t="1612427886871" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10292" width="16" height="16"><path d="M648.533333 802.133333c0-21.333333-17.066667-34.133333-34.133333-34.133333H294.4c-21.333333 0-38.4 17.066667-38.4 34.133333s17.066667 34.133333 34.133333 34.133334h320c21.333333 4.266667 38.4-12.8 38.4-34.133334z m128-157.866666c0-21.333333-17.066667-34.133333-34.133333-34.133334H294.4c-21.333333 0-34.133333 17.066667-34.133333 34.133334s17.066667 34.133333 34.133333 34.133333h448c17.066667 0 34.133333-12.8 34.133333-34.133333z m-192-162.133334c0-21.333333-17.066667-34.133333-34.133333-34.133333h-256c-21.333333 0-34.133333 17.066667-34.133333 34.133333s17.066667 34.133333 34.133333 34.133334h256c17.066667 4.266667 34.133333-12.8 34.133333-34.133334z m238.933334 469.333334H200.533333V72.533333H512v238.933334c0 38.4 34.133333 72.533333 72.533333 72.533333h238.933334v567.466667zM584.533333 110.933333l200.533334 200.533334h-200.533334V110.933333z m290.133334 192L597.333333 21.333333l-12.8-12.8s-4.266667 0-4.266666-4.266666h-4.266667c-8.533333 0-21.333333-4.266667-29.866667-4.266667H200.533333C162.133333 0 128 34.133333 128 72.533333v878.933334c0 38.4 34.133333 72.533333 72.533333 72.533333h622.933334c38.4 0 72.533333-34.133333 72.533333-72.533333v-597.333334c0-21.333333-8.533333-38.4-21.333333-51.2z" fill="" p-id="10293"></path></svg>
  <span>${doc.title}</span>`;
  btn.setAttribute('data-value', doc.docId);
  if (isActive) {
    btn.classList.add('active');
  }
  // btn.setAttribute('data-title', doc.title);
  option.append(btn);
  return option;
}

// eslint-disable-next-line @typescript-eslint/no-shadow
function replaceUrl(docId: string) {
  const urlQuery = new URLSearchParams(window.location.search);
  const oldDocId = urlQuery.get('docId');
  if (oldDocId === docId) {
    return;
  }
  //
  const newUrl = `${window.location.origin}/?docId=${docId}`;
  window.history.pushState({}, '', newUrl);
}


function handleError(err: any) {
  if (err.response && err.response.data && err.response.data.error === 'demo disabled') {
    const elem = document.getElementById('demoStatus');
    if (elem) {
      elem.innerText = 'Demo disabled';
    }
  }
}

async function initApp() {
  const urlQuery = new URLSearchParams(window.location.search);
  const url = '/api/demo/meta';
  const result = await axios(url);
  appId = result.data.appId;
  assert(appId);
  //
  const docId = urlQuery.get('docId');
  if (!docId) {
    showList = true;
  }
}

async function getDocs() {
  assert(appId);
  try {
    const url = `/api/demo/docs`;
    const result = await axios(url);
    const docs = result.data;
    return docs;
  } catch (err) {
    handleError(err);
    throw err;
  }
}

async function getEditorServiceAccessToken(docId: string) {
  try {
    const result = await axios(`/api/demo/token/${docId}/${userId}`);
    const data = result.data;
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
}

async function changeDocTitle(docId: string, title: string) {
  if (!title) {
    return;
  }
  //
  await axios({
    url: `/api/demo/docs/${docId}`,
    method: 'put',
    data: {
      title,
    },
  });
  //
  const list = document.getElementById('doc-list') as HTMLUListElement;
  assert(list);
  const titleDom = list.querySelector('button.active span');
  assert(titleDom);
  titleDom.innerHTML = title;
}

const WsServerUrl = 'wss://api.live-editor.com';

let oldEditor: Editor | undefined;

function addSelfAvatar(user: {
  userId: string,
  avatarUrl: string,
  displayName: string,
}) {
  const container = document.getElementById('selfAvatar');
  assert(container);
  const userDom = document.createElement('div');
  userDom.classList.add('userFace');
  userDom.title = user.displayName;
  if (user.avatarUrl) {
    const faceDom = document.createElement('img');
    faceDom.classList.add('faceImg');
    faceDom.alt = user.displayName;
    faceDom.src = user.avatarUrl;
    userDom.append(faceDom);
  }
  container.innerHTML = '';
  container.appendChild(userDom);
}

function handleRemoteUserChanged(editor: Editor, users: OnlineUser[]) {
  const fragment = document.createDocumentFragment();
  users.forEach((user) => {
    const userDom = document.createElement('div');
    userDom.classList.add('userFace');
    userDom.title = user.displayName;
    if (user.avatarUrl) {
      const faceDom = document.createElement('img');
      faceDom.classList.add('faceImg');
      faceDom.alt = user.displayName;
      faceDom.src = user.avatarUrl;
      userDom.append(faceDom);
    }
    fragment.append(userDom);
  });
  const container = document.getElementById('userContainer');
  assert(container);
  container.innerHTML = '';
  container.append(fragment);
}

async function loadDocument(template?: EditorDoc): Promise<Editor | undefined> {
  const urlQuery = new URLSearchParams(window.location.search);
  const docId = urlQuery.get('docId');
  if (!docId) {
    return undefined;
  }
  //
  if (oldEditor) {
    oldEditor.destroy();
    oldEditor = undefined;
  }
  //

  const avatarUrls = [
    'https://live-editor.com/wp-content/new-uploads/2f4c76a6-db63-4de1-a5c0-28cf36384b7e.png',
    'https://live-editor.com/wp-content/new-uploads/fc728217-55e3-4d09-b034-07a9960a6b39.png',
    'https://live-editor.com/wp-content/new-uploads/a0919cb4-d3c2-4027-b64d-35a4c2dc8e23.png',
    'https://live-editor.com/wp-content/new-uploads/edd02e17-0311-42f2-b6e4-f2182c9af669.png',
    'https://live-editor.com/wp-content/new-uploads/466fd22b-efa2-4aa9-afa2-2e7fd7e877c4.png',
    'https://live-editor.com/wp-content/new-uploads/ba347c05-ec29-4ebf-bca0-d95670c93df0.png',
    'https://live-editor.com/wp-content/new-uploads/200598ee-a746-403f-9908-a91949bc41c2.png',
  ];
  //
  //
  const user = {
    avatarUrl: avatarUrls[(userIndex % avatarUrls.length)],
    userId,
    displayName: userId,
  };
  //
  const token = await getEditorServiceAccessToken(docId);
  assert(appId);
  const auth: AuthMessage = {
    appId,
    ...user,
    permission: 'w',
    docId,
    token,
  };
  //
  //
  const element = document.getElementById('editor');
  assert(element);

  if (!element.classList.contains('active')) {
    element.classList.add('active');
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleTitleChanged = (editor: Editor, docId: string, title: string) => {
    console.log(`title changed to ${title}`);
    changeDocTitle(docId, title);
  };

  const options: EditorOptions = {
    serverUrl: WsServerUrl,
    placeholder: '',
    template,
    templateValues: {},
    titleInEditor: true,
    callbacks: {
      onReauth: getEditorServiceAccessToken,
      onRemoteUserChanged: handleRemoteUserChanged,
      onTitleChanged: debounce(handleTitleChanged, 1000),
    },
  };
  const editor = await createEditorPromise(element, options, auth);
  assert(editor);
  oldEditor = editor;
  //
  const list = document.getElementById('doc-list') as HTMLUListElement;
  assert(list);
  const targetDom = list.querySelector(`[data-value="${docId}"]`);
  if (targetDom?.classList.contains('.active')) {
    list.querySelector('.active')?.classList.remove('active');
    targetDom.classList.add('active');
  }
  //
  addSelfAvatar(user);
  //
  return editor;
}

async function createDocument(data: { title?: string, template?: EditorDoc }) {
  //
  const { title, template } = data;
  console.log(title);
  //
  const result = await axios({
    url: `/api/demo/docs`,
    method: 'post',
    data: {
      title,
    },
  });
  const doc = result.data;

  assert(appId);
  replaceUrl(doc.docId);
  const list = document.getElementById('doc-list') as HTMLUListElement;
  assert(list);
  list.querySelector('.active')?.classList.remove('active');
  const option = createdListItem(doc, true);
  list.append(option);
  option.scrollIntoView(false);

  const editor = await loadDocument(template);
  if (!editor) {
    return;
  }
  editor.focus();

  return doc;
}


const lines = [
  'Enable Real-Time Co-Editing in Applications.',
  'Real-time collaboration editing service with integrated editor component. Support both WYSIWYG editing and Markdown syntax.',
  'Plugin architecture allows you to extend the editor with custom element.',
  '',
  '',
  '',
  '',
];


function getTemplate(): EditorDoc {
  const blocks: DocBlock[] = [];
  lines.forEach((line, index) => {
    const block: DocBlock = {
      text: [{
        insert: line,
      }],
      id: genId(),
      type: 'text',
    };

    if (index === 0) {
      block.heading = 1;
    }
    blocks.push(block);
  });
  //
  return {
    blocks,
    comments: {},
    meta: {},
  };
}

const GUIDE_TEMPLATE = getTemplate();

async function init() {
  await initApp();
  //
  //
  if (showList) {
    const docs = await getDocs();
    const list = document.getElementById('doc-list') as HTMLUListElement;
    assert(list);
    const listContainer = document.getElementById('doc-list-layer');
    assert(listContainer);
    listContainer.style.display = 'flex';

    const fragment = document.createDocumentFragment();
    //
    docs.forEach((doc: any) => {
      const option = createdListItem(doc);
      fragment.append(option);
    });
    list.innerHTML = '';
    list.append(fragment);
    //
    list.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('button');
      if (target && !target.classList.contains('active')) {
        const docId = target.getAttribute('data-value');
        if (docId) {
          assert(appId);
          replaceUrl(docId);
          loadDocument();
        }

        list.querySelector('.active')?.classList.remove('active');

        target.classList.add('active');

        const btnLabel = document.querySelector<HTMLSpanElement>('.shareBtn span');
        assert(btnLabel);
        btnLabel.innerText = 'Share';
      }
    });
    //
    if (docs.length === 0) {
      createDocument({
        title: 'My first live editor document',
        template: GUIDE_TEMPLATE,
      });
    }
  }
  //
  loadDocument();
  //
  document.getElementById('addPage')?.addEventListener('click', async () => {
    createDocument({});
  });

  const clipboard = new Clipboard('.shareBtn', {
    text: () => window.location.href,
  });
  clipboard.on('success', () => {
    const btnLabel = document.querySelector<HTMLSpanElement>('.shareBtn span');
    assert(btnLabel);
    btnLabel.innerText = 'URL copied';
  });
}

init();

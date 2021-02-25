import React, { useEffect } from 'react'
import { LiveEditor, domUtils } from 'live-editor-react'

const appId = '';

function handleUploadResource(file) {
  return domUtils.fileToDataUrl(file);
}

const App = () => {
  const [docId, setDocId] = React.useState('doc1');
  const [docData, setDocData] = React.useState(null);
  const editorRef = React.useRef(null);
  //
  useEffect(() => {
    const initData = localStorage.getItem(docId);
    setDocData(initData ? JSON.parse(initData) : null);
  }, [docId]);

  const options = {
    local: true,
    initLocalData: docData ? docData : undefined,
    titleInEditor: true,
    serverUrl: '',
    user: {
      userId: 'test-user',
      displayName: 'Test User',
    },
    callbacks: {
      onUploadResource: handleUploadResource,
    }
  };

  function handleCreated(editor) {
    editorRef.current = editor;
  }

  function loadDocument(id) {
    if (editorRef.current) {
      const id = editorRef.current.docId();
      const data = editorRef.current.data();
      localStorage.setItem(id, JSON.stringify(data));
    }
    setDocId(id);
    const initData = localStorage.getItem(id);
    setDocData(initData ? JSON.parse(initData) : null);
  }

  return <div>
    <div style={{
      height: 40,
      display: 'flex'
    }}>
      <button onClick={
        () => {
          loadDocument('doc1');
        }
      }>
        load doc1
      </button>
      <button onClick={
        () => {
          loadDocument('doc2');
        }
      }>
        load doc2
      </button>
    </div>
    <LiveEditor
      appId={appId}
      docId={docId}
      options={options}
      permission={'w'}
      accessToken=""
      onCreate={handleCreated}
      containerStyle={{
        border: '1px solid #f0f0f0',
        maxWidth: 800,
        minHeight: 800,
        margin: '40px auto 40px auto'
      }}
    />
  </div>
}

export default App

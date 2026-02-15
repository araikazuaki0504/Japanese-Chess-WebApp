// import React, { useState, useEffect } from 'react'

// function App() {
//   const [message, setMessage] = useState('Loading...')

//   useEffect(() => {
//     fetch('/api/hello')
//       .then(response => response.json())
//       .then(data => setMessage(data.message))
//       .catch(error => setMessage('Error: ' + error.message))
//   }, [])

//   return (
//     <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//       <h1>Japanese Chess WebApp</h1>
//       <p>動作確認ページ</p>
//       <p>Backendからのメッセージ: {message}</p>
//       <button onClick={() => setMessage('ボタンがクリックされました！')}>
//         テストボタン
//       </button>
//     </div>
//   )
// }

// export default App

import ShogiWindow from "./app/ShogiWindow";

function App() {
  return (
    <ShogiWindow />
  );
}

export default App;

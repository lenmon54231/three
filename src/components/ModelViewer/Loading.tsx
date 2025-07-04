import React from 'react';

const spinnerStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  border: '6px solid #fff',
  borderTop: '6px solid #888',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: 24,
};

const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const Loading = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'black',
      color: 'white',
      zIndex: 10,
      flexDirection: 'column',
    }}
  >
    <style>{keyframes}</style>
    <div style={spinnerStyle}></div>
    <div style={{ fontSize: 20, letterSpacing: 2 }}>模型加载中…</div>
  </div>
);

export default Loading;

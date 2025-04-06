import React from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';
import Chatbox from './components/Chatbox';

function App() {
  return (
    <>
      <RouterProvider router={routes} />
      <Chatbox />
    </>
  );
}

export default App;

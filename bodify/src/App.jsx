import React from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';
import { Toaster } from 'react-hot-toast';


function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={routes} />
    </>
  );
}

export default App;

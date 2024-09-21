import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
    <GoogleOAuthProvider clientId="141573299791-t9j6tku5mo7deeusggc3d78urc9gjoid.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
    <GoogleOAuthProvider clientId="856508233551-qsaumu622n1g650ur1mjk1j5uj6bvvvc.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)

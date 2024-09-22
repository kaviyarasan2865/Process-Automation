import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
    <GoogleOAuthProvider clientId="119425907487-1u0vf1hntjt5eh3nk4tkc1kinuv8ac2q.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)

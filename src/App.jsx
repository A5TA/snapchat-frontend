import axios from 'axios'
import React from 'react'
import Routes from './Routes'
import { UserContextProvider } from './UserContext'

const App = () => {
  axios.defaults.baseURL = `${process.env.REACT_APP_BASE_URL}`
  axios.defaults.withCredentials = true
  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
  )
}

export default App
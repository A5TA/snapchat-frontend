import React, { useContext } from 'react'
import RegisterAndLogin from './RegisterAndLogin'
import { UserContext } from './UserContext'
import Chat from './Chat'

const Routes = () => {
    const {username} = useContext(UserContext)

    if (username) {
        return <Chat/>
    }
  return (
    <RegisterAndLogin/>
  )
}

export default Routes
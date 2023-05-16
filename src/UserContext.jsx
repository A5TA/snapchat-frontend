import { createContext, useEffect, useState } from "react"
import axios from "axios"

export const UserContext = createContext({})

export function UserContextProvider({children}) {
    const [name, setName] = useState(null)
    const [username, setUsername] = useState(null)
    const [id, setId] = useState(null)

    useEffect(() => {
        // declare the data fetching function
        const fetchData = async () => {
            const res = await axios.get('/api/v1/auth/profile')
            // console.log(res)
            setId(res.data.user.userId)
            setName(res.data.user.name)
            setUsername(res.data.user.username)
        }
      
        // call the function
        fetchData().catch(console.error)
      }, [])

    return (
        <UserContext.Provider value={{name, setName, username, setUsername, id, setId}}>{children}</UserContext.Provider>
    )
}
import React, { useContext, useEffect, useState, useRef } from 'react'
import {FaSearch } from 'react-icons/fa'
import {RiArrowRightSFill, RiSettings3Fill} from 'react-icons/ri'
import {AiOutlinePicture} from 'react-icons/ai'
import {IoIosArrowBack} from 'react-icons/io'
import {BsTrash3} from 'react-icons/bs'
import Avatar from './Avatar'
import { UserContext } from './UserContext'
import {uniqBy} from 'lodash'
import axios from 'axios'
import Contact from './Contact'
import Camera from './Camera'
import { Buffer } from 'buffer'

const Chat = () => {
    const [ws, setWs] = useState(null) 
    const [onlineUsers, setOnlineUsers] = useState({})
    const [offlineUsers, setOfflineUsers] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState('')
    const [messages, setMessages] = useState([])
    const [query, setQuery] = useState('')
    const [filteredUsers, setFilteredUsers] = useState([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const {username: currentUser, name: currentUserName, id: currentUserId, setId, setUsername, setName} = useContext(UserContext)
    const divUnderMessages = useRef()


    useEffect(() => {
        connectToWs()
    },[selectedUserId])

    const connectToWs = () => {
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}`)
        setWs(ws)
        ws.addEventListener('message', handleMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected trying to reconnect')
                connectToWs()
            }, 1000)    
        })
    }

    //this contacts all online users and gives updates for new or deleted messages
    const handleMessage = (e) => {
        const data = JSON.parse(e.data)
        // console.log(data)
        if('online' in data) {
            showUsers(data.online)
        }    
        if ('text' in data ) {
            if(data.sender === selectedUserId) {
                setMessages(prev => ([...prev, {...data }]))
            }
        }
        if ('removeThisMessage' in data) {
            if(data.sender === selectedUserId) {
                setMessages(prev => prev.filter(message => message._id !== data.removeThisMessage))
            }
        }
    }
    //this is used to showcase all users on the side panel
    const showUsers = (usersArr) => {
        const users = {}
        usersArr.forEach(({userId, name, username}) => {
            if (username !== currentUser) {
                users[userId] = [username, name]
            }
        })
        setOnlineUsers(users)
    }

    const sendMessage = async (e, file = null) => {
        if(e) e.preventDefault()

        try {
            const message = await axios.post('/api/v1/messages', {
                recipient: selectedUserId,
                text: newMessageText,
                file,
            })
            setMessages(prev => ([...prev, {...message.data.message}]))
            ws.send(JSON.stringify({
                type: 'newMessage',
                recipient: selectedUserId,
                text: newMessageText,
                file,
                _id: message.data.message._id,
        }))
        } catch (error) {
            console.log(error)
        }
        setNewMessageText('')
    }

    //delete message
    const deleteMessage = (msg) => {
        console.log('deleted message', msg)
        if(msg) {
            axios.delete('/api/v1/messages/'+msg._id)
                .then(response => {
                    console.log(response)
                    setMessages([...messages].filter(m => m._id !== msg._id))
                    ws.send(JSON.stringify({
                        type: 'delete',
                        recipient: selectedUserId,
                        _id: msg._id
                    }))
                })
                .catch(error => {
                    console.error(error)
                  })
        }
    }




    //This fetches all past messages on a selected user
    useEffect(() => {
        if(selectedUserId) {
          axios.get('/api/v1/messages/'+selectedUserId)
            .then(response => {
              const prevMessages = response.data.messages
              setMessages([ ...prevMessages])
            })
            .catch(error => {
              console.error(error)
            })
        }
      },[selectedUserId])

    
      //fetch the offline users 
    useEffect(() => {
        axios.get('/api/v1/auth/allUsers/')
            .then(response => {
                const offlineUsersArr = response.data
                    .filter(p => p._id !== currentUserId)
                    .filter(p => !Object.keys(onlineUsers).includes(p._id))
                const offlineUsersObj = {}
                offlineUsersArr.forEach(p => {
                    offlineUsersObj[p._id] = p
                })
                setOfflineUsers(offlineUsersObj)
                // console.log({offlineUsersArr, offlineUsersObj})
            })
        
    },[onlineUsers])
    

    const logout = () => {
        axios.post('api/v1/auth/logout/')
            .then(() => {
                setWs(null)
                setId(null)
                setUsername(null)
                setName(null)
            })
            console.log('user logged out')
    }

    const uploadFile = (e) => {
        const fileTypes = ['image/apng', 'image/bmp', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/webp']
        if (fileTypes.includes(e.target.files[0].type)) {
           const reader = new FileReader()
            reader.readAsDataURL(e.target.files[0]) 
            reader.onload = () => {
                sendMessage(null, {data: reader.result, fileName: Date.now()+e.target.files[0].name})
            } 
        } else {
            window.alert('Invalid file type. Please select a valid image file.')
        } 
    }

    //scroll when message is sent
    useEffect(() => {
        const div = divUnderMessages.current
        if (div) {
          div.scrollIntoView({behavior:'smooth', block:'end'})
        }
      }, [messages])


    const handleDownload = (msg) => {
        const byteCharacters = Buffer.from(msg.data, 'base64')
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters[i]
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        document.body.appendChild(a)
        a.style = "display: none"
        a.href = url
        a.download = msg.fileName
        a.click()
        window.URL.revokeObjectURL(url)
      }

    useEffect(() => {
        const getFilteredUsers = () => {
            const filteredUsersArr = []

            for (const key in onlineUsers) {
                const arr = onlineUsers[key];
                
                if (Array.isArray(arr) && arr.length > 0) {
                  const firstItem = arr[0];
                  
                  if (typeof firstItem === 'string' && firstItem.includes(query)) {
                    filteredUsersArr.push({
                      id: key,
                      username: firstItem,
                      name: arr[1],
                      online: true
                    })
                  }
                }
              }

            for (const key in offlineUsers) {
                const user = offlineUsers[key];
                const arr = [user.username, `${user.firstName} ${user.lastName}`];
                const firstItem = arr[0];
                
                if (firstItem.includes(query) && !filteredUsersArr.some((u) => u.id === key)) {
                    filteredUsersArr.push({
                    id: key,
                    username: firstItem,
                    name: arr[1],
                    online: false
                })
                }
            }
            setFilteredUsers(filteredUsersArr)
        }
        getFilteredUsers()
    },[onlineUsers, offlineUsers, query])
    
    const messagesWithoutDupes = uniqBy(messages, '_id')
    return (
    <div className='flex h-screen overflow-hidden'>
        <div className='bg-[#f2f2f2] w-1/5 border-r-2 border-gray-300'>
            <div className='border-b-2 border-gray-300'>
                <div className='flex items-center justify-between px-4 py-2'>
                    <Avatar name={currentUserName} userId={currentUserId} small={false} online={true}/> 

                    <svg width="37" height="36" viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg" ><g clipPath="url(#c9ec3b173cc3487339db83569197c03388d93a27__a)"><path fillRule="evenodd" clipRule="evenodd" d="M30.825 25.55c-1.212.668-2.019.599-2.648 1.004-.533.344-.216 1.08-.606 1.35-.475.329-1.883-.022-3.697.576-1.498.494-2.455 1.918-5.15 1.918-2.701 0-3.631-1.416-5.148-1.918-1.814-.598-3.223-.247-3.698-.575-.386-.267-.073-1.008-.606-1.351-.625-.405-1.435-.332-2.647-1.003-.772-.429-.336-.691-.077-.815 4.396-2.127 5.094-5.411 5.125-5.658.039-.293.081-.529-.247-.826-.313-.29-1.706-1.154-2.092-1.42-.64-.448-.922-.892-.714-1.44.143-.378.498-.521.872-.521.116 0 .236.015.348.038.702.155 1.385.506 1.78.599.053.011.1.019.146.019.208 0 .285-.104.27-.347-.046-.769-.154-2.266-.035-3.663.166-1.922.788-2.88 1.525-3.721.355-.405 2.014-2.161 5.195-2.161 3.188 0 4.844 1.756 5.195 2.16.737.846 1.359 1.8 1.525 3.722.12 1.397.015 2.894-.035 3.663-.016.254.062.347.27.347a.728.728 0 0 0 .147-.02c.393-.096 1.076-.447 1.779-.598a1.77 1.77 0 0 1 .347-.038c.375 0 .73.143.873.52.208.549-.074.997-.714 1.44-.386.27-1.78 1.131-2.092 1.42-.324.302-.282.534-.247.827.03.247.733 3.531 5.125 5.658.267.124.703.386-.07.814Zm1.988-1.065c-.197-.536-.572-.822-1-1.061a4.515 4.515 0 0 0-.216-.116c-.128-.066-.259-.131-.39-.197-1.335-.706-2.374-1.598-3.096-2.655a6.255 6.255 0 0 1-.532-.942c-.062-.178-.058-.278-.016-.367a.626.626 0 0 1 .17-.177c.228-.15.467-.305.625-.41.286-.185.514-.331.657-.432.548-.382.93-.787 1.17-1.242.335-.641.377-1.37.119-2.062-.363-.953-1.262-1.547-2.358-1.547a3.49 3.49 0 0 0-.865.116 19.816 19.816 0 0 0-.062-2.02c-.204-2.384-1.038-3.631-1.91-4.627a7.625 7.625 0 0 0-1.942-1.567c-1.32-.756-2.817-1.138-4.45-1.138-1.629 0-3.122.382-4.446 1.138a7.6 7.6 0 0 0-1.946 1.567c-.872.996-1.705 2.246-1.91 4.628a19.82 19.82 0 0 0-.062 2.018c-.058-.015-.12-.026-.177-.042a3.19 3.19 0 0 0-.687-.073c-1.093 0-1.996.594-2.359 1.547a2.495 2.495 0 0 0 .12 2.062c.24.455.621.86 1.17 1.242.146.1.37.247.656.433.154.1.382.247.602.393a.649.649 0 0 1 .193.193c.046.097.046.197-.02.386a6.136 6.136 0 0 1-.52.923c-.707 1.034-1.718 1.91-3.007 2.609-.684.363-1.394.606-1.695 1.42-.227.618-.077 1.316.498 1.907.19.204.429.382.726.548.702.39 1.304.579 1.775.71.081.023.274.085.36.158.208.182.177.46.458.865.17.25.363.424.525.533.587.405 1.243.428 1.942.455.629.023 1.343.05 2.161.32.34.112.691.328 1.096.58.98.601 2.316 1.423 4.555 1.423 2.238 0 3.585-.826 4.566-1.428.405-.247.752-.463 1.08-.57.815-.271 1.529-.298 2.162-.321.698-.027 1.355-.05 1.941-.456.186-.127.413-.335.599-.652.2-.34.196-.583.386-.745.077-.065.247-.127.335-.154a7.852 7.852 0 0 0 1.799-.718c.316-.174.567-.367.76-.587l.008-.008c.54-.578.675-1.262.452-1.86Z" fill="#B9C0C7"></path></g><defs></defs></svg>
                    
                    <div className='relative inline-block'>
                        <button
                            className='flex items-center text-gray-600 hover:text-red-500'
                            title='Settings'
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <RiSettings3Fill size={25}/>
                        </button>
                        {isDropdownOpen && (
                            <ul className='absolute right-0 z-10 bg-white shadow-md'>
                                <li>
                                    <button
                                    
                                    className='w-full py-2 px-4 text-left hover:bg-gray-200'
                                    >
                                    Settings
                                    </button>
                                </li>
                                <li>
                                    <button
                                    onClick={logout}
                                    className='w-full py-2 px-4 text-left hover:bg-gray-200'
                                    >
                                    Logout
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
                <div className="px-4 py-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaSearch className="text-black" size={14}/>
                        </span>
                        <input type="text" onChange={(e) => setQuery(e.target.value)} className="w-full bg-white border-2 border-gray-300 rounded-full py-2 pl-10 pr-4 placeholder-gray-400 text-gray-700 leading-tight focus:outline-none focus:bg-white" placeholder="Search" />
                    </div>
                </div>
            </div>
            <div className='max-h-[85vh] overflow-y-scroll'>

                {filteredUsers.map(user => (
                    <Contact 
                    key={user.id}
                    id={user.id} 
                    username={user.username}
                    name={user.name}
                    onClick={() => setSelectedUserId(user.id)}
                    isSelected = {user.id === selectedUserId}
                    online={user.online}
                    isSnap={false}
                    />
                    ))}
            </div>
        </div>

        {/* Right side of screen */}
        {selectedUserId ?
        <div className='bg-[#f2f2f2] w-4/5 '>
            <div className='flex items-center'>
                <div className='flex p-3'>
                    <button
                        type="button"
                        className="rounded-full bg-gray-300 p-1"
                        onClick={() => setSelectedUserId(null)}
                    >
                        <IoIosArrowBack className="text-black" size={22} />
                    </button>

                </div>
                {onlineUsers[selectedUserId] ?
                <Avatar name={onlineUsers[selectedUserId][1]} userId={selectedUserId} small={true} online={true} />
                : offlineUsers[selectedUserId] ?
                <Avatar name={`${offlineUsers[selectedUserId].firstName} ${offlineUsers[selectedUserId].lastName}`} userId={selectedUserId} small={true} online={false} />
                : <div>Loading...</div>
                }
                
            </div>


            <div className='overflow-y-scroll border-2 border-gray-300 pt-4 m-2 h-[85%] rounded-lg relative'>
                    {messagesWithoutDupes.map(message => (
                        <div key={message._id} className="mb-2">
                            {message.sender === currentUserId ?  
                                <span className='text-xs text-red-500 font-bold uppercase '>ME</span>
                                : 
                                <span className='text-xs text-cyan-500 font-bold uppercase '>
                                    {onlineUsers[selectedUserId] 
                                        ? onlineUsers[selectedUserId][1] 
                                        : (offlineUsers[selectedUserId] 
                                        ? `${offlineUsers[selectedUserId].firstName} ${offlineUsers[selectedUserId].lastName}`
                                        : 'User Not Found')
                                    }
                                </span>
                            }
                            <div className={`${message.sender === currentUserId ? 'border-l-2 border-red-500' : 'border-l-2 border-cyan-500'} pl-2 flex group`}>
                                {message.text} {message.file && (
                                    <img src={message.file.data} alt={message.file.fileName} className="rounded-lg h-96 max-w-7xl" />
                                )}
                                {message.snap && (
                                    <button onClick={() => handleDownload(message.snap)} className='flex text-center items-center gap-3 p-3 border-2 border-gray-200 rounded-md w-full hover:bg-gray-200'>
                                        {message.sender === currentUserId ? 
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 16 16" fill="red" xmlns="http://www.w3.org/2000/svg"><path d="m13.607 7.474.02.01.018.009c.584.257.605.502.605.511 0 .01-.021.255-.605.512l-.019.008-.018.01-8.77 4.457c-.424.184-.736.253-.938.26a.715.715 0 0 1-.136-.007.64.64 0 0 1 .009-.076c.028-.17.13-.442.371-.814.4-.515.826-1.228 1.156-1.975.33-.746.6-1.606.6-2.375 0-.783-.277-1.643-.611-2.388a10.786 10.786 0 0 0-1.157-1.982c-.245-.366-.346-.634-.374-.799a.588.588 0 0 1-.008-.076.69.69 0 0 1 .15-.009c.203.006.516.073.938.257l8.77 4.467ZM3.712 13.23l.002.002a.01.01 0 0 1-.002-.002Zm.054.062.001.007-.001-.007ZM3.754 2.711l-.002.007c0-.005.001-.007.002-.007Zm-.048.061a.01.01 0 0 1-.002.002l.002-.002Z" stroke="red" strokeWidth="2"></path></svg>
                                                <span className='font-medium'>Delivered</span>
                                            </>
                                        :
                                            <>
                                                <div className="bg-red-500 w-5 h-5 rounded-md"></div>
                                                <span className='font-medium'>Tap to View</span>
                                            </>
                                        }
                                        

                                    </button>
                                )}
                                {message.sender === currentUserId && (
                                    <button onClick={() => deleteMessage(message)} className='ml-auto opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                                        <BsTrash3 />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={divUnderMessages}></div>
            </div>

            <div className="relative pb-4 pl-4 pr-16">
                <form className="relative" onSubmit={sendMessage}>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-gray-300 rounded-full py-2 pl-5 pr-12 placeholder-gray-400 text-gray-700 leading-tight focus:outline-none focus:bg-white"
                        placeholder="Send a chat"
                        value={newMessageText}
                        onChange={e => setNewMessageText(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="absolute right-0 top-0  flex items-center justify-center h-10 w-10"
                    >
                        <RiArrowRightSFill className="text-[#0fadff]" size={30} />
                    </button>
                    <label
                        className="absolute right-[-3.0rem] top-0 flex items-center justify-center border-2 h-10 w-10 opacity-40 border-gray-300 rounded-full cursor-pointer"
                    >
                        <input type="file" className='hidden' onChange={uploadFile}/>
                        <AiOutlinePicture size={20}/>
                    </label>
                </form>
            </div>
        </div>
        :
        <Camera filteredUsers={filteredUsers} ws={ws} setQuery={setQuery}/>
        }
    </div>
  )
}

export default Chat
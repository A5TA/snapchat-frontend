import React, { useCallback, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import {FaSearch } from 'react-icons/fa'
import {RiArrowRightSFill} from 'react-icons/ri'
import {IoIosArrowBack} from 'react-icons/io'
import {FiDownload} from 'react-icons/fi'
import Contact from './Contact'
import axios from 'axios'


const Camera = ({filteredUsers,setQuery, ws}) => {
    const webcamRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const [capturing, setCapturing] = useState(false)
    const [recordedChunks, setRecordedChunks] = useState([])
    const [videoReadyToSend, setVideoReadyToSend] = useState(false)
    const [showUsers, setShowUsers] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)
  
    const handleStartCaptureClick = useCallback(() => {
      setCapturing(true)
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      })
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      )
      mediaRecorderRef.current.start()
    }, [webcamRef, setCapturing, mediaRecorderRef])
  
    const handleDataAvailable = useCallback(
      ({ data }) => {
        if (data.size > 0) {
          setRecordedChunks((prev) => prev.concat(data))
        }
      },
      [setRecordedChunks]
    )
  
    const handleStopCaptureClick = useCallback(() => {
      mediaRecorderRef.current.stop()
      setCapturing(false)
      setVideoReadyToSend(true)
    }, [mediaRecorderRef, webcamRef, setCapturing])
  
    const handleDownload = useCallback(() => {
      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, {
          type: "video/webm"
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        document.body.appendChild(a)
        a.style = "display: none"
        a.href = url
        a.download = `${Date.now()}.webm`
        a.click()
        window.URL.revokeObjectURL(url)
        setRecordedChunks([])
      }
    }, [recordedChunks])

    const handleSend = () => {
      setShowUsers(true)
    }

    const sendVideo = async () => {
      if (!ws || !selectedUserId) {
        console.log('no selectedUser or websocket connection')
        return
      }

      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, { type: "video/webm" })
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = async () => {
          const base64data = reader.result.split(",")[1]
          try {
            const message = await axios.post('/api/v1/messages', {
                recipient: selectedUserId,
                snap: base64data,
            })
            ws.send(JSON.stringify({
                type: 'newMessage',
                recipient: selectedUserId,
                snap: base64data,
                _id: message.data.message._id,
            }))
            } catch (error) {
                console.log(error)
            }
        }

        setVideoReadyToSend(false)
        setShowUsers(false)
        setSelectedUserId(null)
        setRecordedChunks([])
      }
    }
  
    return (
        <div className="relative h-screen flex justify-center items-center w-4/5 " >
            {!videoReadyToSend ? 
            <>
              <Webcam
              audio={false}
              ref={webcamRef}
              className="top-0 right-0 h-4/5 w-4/5 p-4 rounded-3xl"
              />
              <div className="absolute bottom-[15%]">
              <button
                  onClick={capturing ? handleStopCaptureClick : handleStartCaptureClick}
                  className={`${capturing ? 'bg-[#fffc00] border-gray-300 animate-spin border-none' : 'bg-none border-white '} border-4 text-white rounded-full w-16 h-16 flex justify-center items-center focus:outline-none`}
              >  
              </button>
              </div>
            </>
            : (!showUsers ?
            <>
              <div className="bg-gray-400 h-3/5 w-3/5 relative flex justify-center items-center flex-col">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" className="w-2/5 h-2/5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
                <span className='font-semibold text-white text-opacity-80 text-center text-lg leading-5 max-w-[180px] tracking-tighter'>Snap is ready to send</span>
                <button 
                  onClick={handleDownload}
                  className="absolute left-0 bottom-0 bg-white rounded-full p-2 m-4"
                  title="Download your Snap."
                >
                  <FiDownload />
                </button>
                <button
                    onClick={handleSend}
                    className="absolute bottom-0 right-0 bg-[#0fadff] text-white rounded-full px-4 py-1 focus:outline-none m-4 flex items-center gap-0"
                >
                  <span>Send To</span>
                  <RiArrowRightSFill size={30}/>
                </button>      
              </div>
            </>
            :
            <div className="flex flex-col h-full w-full items-center justify-center">
              <div className="p-4 text-center font-bold text-xl">
                Select User to send Snap
              </div>
              <div className="bg-white border-2 border-gray-300 rounded-lg h-3/5 w-3/5 relative p-[10%] overflow-y-scroll">
                  <div className="px-4 py-2 absolute inset-x-0 top-0">
                      <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <FaSearch className="text-black" size={14}/>
                          </span>
                          <input 
                              type="text" 
                              onChange={(e) => setQuery(e.target.value)} 
                              className="w-full bg-white border-2 border-gray-300 rounded-full py-2 pl-10 pr-4 placeholder-gray-400 text-gray-700 leading-tight focus:outline-none focus:bg-white" 
                              placeholder="Search" 
                          />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                      {filteredUsers.map(user => (
                          <Contact 
                              key={user.id}
                              id={user.id} 
                              username={user.username}
                              name={user.name}
                              onClick={() => {
                                setSelectedUserId(user.id)
                                setQuery('')
                              }}
                              isSelected={user.id === selectedUserId}
                              online={user.online}
                              isSnap={true}
                          />
                      ))}
                  </div>
              </div>
                <div className='flex p-3'>
                    <button
                        type="button"
                        className="rounded-full px-4 py-1 focus:outline-none m-4 flex items-center gap-0 bg-gray-300"
                        onClick={() => setShowUsers(null)}
                    >
                        <IoIosArrowBack className="text-black" size={22} /> <span>Go back</span>
                    </button>
                    <button
                    onClick={sendVideo}
                    className="bg-[#0fadff] text-white rounded-full px-4 py-1 focus:outline-none m-4 flex items-center gap-0"
                    >
                      <span>Send </span>
                      <RiArrowRightSFill size={30}/>
                    </button>
                </div>
                
              </div>
            ) 
          }
      </div>
    )
  }

export default Camera
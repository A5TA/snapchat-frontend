import React from 'react'
import Avatar from './Avatar'

const Contact = ({id, name, username, onClick, isSelected, online, isSnap}) => {
  return (
        <div 
            key={username}
            onClick={() => onClick(id)} 
            className={'flex items-center gap-5 p-3 cursor-pointer ' + (isSelected ? 'bg-gray-300 ': '') + (!isSnap ? 'border-b-2 border-gray-300': 'max-h-14 border-2 border-gray-200 rounded-lg drop-shadow-lg')}>
                <Avatar online={online} name={name} userId={id} small={false}/>
                <div>
                    <div>{username}</div>
                </div>
        </div> 
  )
}

export default Contact
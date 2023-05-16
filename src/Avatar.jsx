import React, { useState, useEffect } from 'react'

const Avatar = ({ name, userId, small, online }) => {
  const [initials, setInitials] = useState('')
  const colors = ['bg-red-200', 'bg-gray-200', 'bg-violet-200', 'bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-indigo-200', 'bg-purple-200', 'bg-pink-200', 'bg-teal-200']
  const colorIndex = parseInt(userId, 16) % colors.length

  useEffect(() => {
    if (name) {
      const nameArr = name.split(' ')
      const initials = nameArr.length > 1 ? nameArr[0][0] + nameArr[1][0] : nameArr[0][0]
      setInitials(initials)
    }
  }, [name]);

  return (
    <div className={`relative rounded-full ${!small && 'w-12 h-12'} ${small && 'p-2 font-semibold w-fill h-10'} flex items-center ${colors[colorIndex]} ${!small && 'aspect-square'}`}>
    <div className='text-center w-full opacity-75 p-3'>
      {initials} {small && <span className='font-bold capitalize'>- {name}</span>}
    </div>
    {online ? (
      <div className='absolute w-3 h-3 bg-green-500 bottom-0 right-0 rounded-full'></div>
    ) : 
      <div className='absolute w-3 h-3 bg-red-500 bottom-0 right-0 rounded-full'></div>
    }

  </div>
  );
};

export default Avatar
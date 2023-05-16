import React, { useContext } from 'react'
import { useState } from 'react'
import ghost from './assets/snapchat-app-icon.svg'
import axios from 'axios'
import { UserContext } from './UserContext'

const RegisterAndLogin = () => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    birthday: {
      month: "January",
      day: 0,
      year: 0,
    }
  })

  const [error, setError] = useState({
    firstName: false,
    lastName: false,
    username: false,
    password: false,
    email: false,
    birthday: {
      month: false,
      day: false,
      year: false,
    },
    auth: false,
  })

  const [isLogin, setIsLogin] = useState(false)

  const {setName, setUsername, setId} = useContext(UserContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const route = isLogin ? 'login' : 'register'
      const res = await axios.post(`/api/v1/auth/${route}`, user)
      setName(res.data.user.name)
      setUsername(user.username)
      setId(res.data.user.id)
      

    } catch (error) {
      //if there is an error we need to showcase them in the input boxes
      console.log({error})
      const newErrors = error?.response?.data?.error
      setError(prevErrors => ({
        ...prevErrors, 
        ...newErrors, 
        birthday: {
          ...prevErrors.birthday,
          month: newErrors['birthday.month'] || false,
          day: newErrors['birthday.day'] || false,
          year: newErrors['birthday.year'] || false
        }
      }))
    }
    
  }

  const handleChange = (e) => {
    // modify birthday state
    if (e.target.name === 'month' || e.target.name === 'day' || e.target.name === 'year') {
      setUser(prevState => ({...prevState, birthday: {
        ...prevState.birthday,
        [e.target.name]: e.target.value
      }}))
    }
    setUser(prevState => ({...prevState, [e.target.name]: e.target.value}))
  }

  return (
    <div className='bg-[#f2f2f2] h-screen'>
    <div className='p-4'>
    {!isLogin ?
    <div className='max-w-lg mx-auto border border-white bg-gray-100  p-5 flex justify-center items-center shadow-gray-300 shadow-sm'>
      <p className='rounded-t-md font-semibold text-center text-sm pr-3'>Already have a Snapchat account?</p>
      <button onClick={() => setIsLogin(true)} 
        className='border text-black block pr-[20px] pl-[20px] pt-[8px] pb-[8px] w-auto leading-4 rounded-3xl font-medium'>
        Log In
      </button>
    </div>
    :
    <div className='max-w-lg mx-auto border border-white bg-gray-100  p-5 flex justify-center items-center shadow-gray-300 shadow-sm'>
      <p className='rounded-t-md font-semibold text-center text-sm pr-3'>Don't have a Snapchat account?</p>
      <button onClick={() => setIsLogin(false)} 
        className='border text-black block pr-[20px] pl-[20px] pt-[8px] pb-[8px] w-auto leading-4 rounded-3xl font-medium'>
        Sign Up
      </button>
    </div>
    }
    <form className='max-w-lg mx-auto border border-white bg-white p-5 shadow-gray-300 shadow-sm' onSubmit={handleSubmit}>
      <img src={ghost} alt="ghost" className='w-[50px] block m-auto' />
      <header className='text-2xl text-center mt-[20px] pb-5 font-bold'>{isLogin ? 'Log in to' : 'Sign Up for'} Snapchat</header>
    {!isLogin && 
      <div className="flex flex-wrap -mx-3 mb-6">
      <div className="w-full md:w-1/2 px-3 mb-3 md:mb-0">
        <label className="block tracking-wide text-[#656b73] text-xs font-semibold h-16px" htmlFor="grid-first-name">
          First Name
        </label>
        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded 
        py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-[#ffd301]" 
        id="grid-first-name" type="text" placeholder="" name='firstName' onChange={handleChange} />
        {error.firstName && (<p className="text-[#e1143d] text-xs font-medium">{error.firstName.message}</p>)} 
      </div>
      <div className="w-full md:w-1/2 px-3 mb-3">
        <label className="block tracking-wide text-[#656b73] text-xs font-semibold h-16px" htmlFor="grid-last-name">
          Last Name
        </label>
        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border
       border-gray-200 rounded py-3 px-4  leading-tight focus:outline-none focus:bg-white
        focus:border-[#ffd301]" id="grid-last-name" type="text" name='lastName' placeholder="" onChange={handleChange}/>
        {error.lastName && (<p className="text-[#e1143d] text-xs font-medium">{error.lastName.message}</p>)} 
      </div>
    </div>
    }
    <div className="flex flex-wrap -mx-3 mb-6">
      <div className="w-full px-3">
        <label className="block tracking-wide text-[#656b73] text-xs font-semibold h-16px" htmlFor="grid-username">
          Username
        </label>
        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border
         border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
          focus:border-[#ffd301]" id="grid-username" type="text" name='username' placeholder="" onChange={handleChange}/>
          {error.username && (<p className="text-[#e1143d] text-xs font-medium">{error.username.message}</p>)} 
      </div>
    </div>
    <div className="flex flex-wrap -mx-3 mb-6">
      <div className="w-full px-3">
        <label className="block tracking-wide text-[#656b73] text-xs font-semibold h-16px" htmlFor="grid-password">
          Password
        </label>
        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border
         border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
          focus:border-[#ffd301]" id="grid-password" type="password" name='password' placeholder="" onChange={handleChange}/>
          {error.password && (<p className="text-[#e1143d] text-xs font-medium">{error.password.message}</p>)} 
      </div>
    </div>
    {!isLogin &&
    <div className="flex flex-wrap -mx-3 mb-6">
      <div className="w-full px-3">
        <label className="block tracking-wide text-[#656b73] text-xs font-semibold h-16px" htmlFor="grid-email">
          Email
        </label>
        <input className="appearance-none block w-full bg-gray-200 text-gray-700 border
         border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white
          focus:border-[#ffd301]" id="grid-email" type="email" placeholder="" name='email' onChange={handleChange}/>
        {error.email && (<p className="text-[#e1143d] text-xs font-medium">{error.email.message}</p>)} 

    </div>
    </div>
    }
    {!isLogin &&
    <div className="flex flex-wrap -mx-3 mb-2">
      <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <label className="block tracking-wide text-[#656b73] text-xs font-semibold h-16px" htmlFor="grid-month">
          Month
        </label>
        <div className="relative">
          <select className="block appearance-none w-full bg-gray-200 border border-gray-200
           text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white
            focus:border-[#ffd301]" id="grid-month" name='month' onChange={handleChange}>
          <option>January</option>
          <option>February</option>
          <option>March</option>
          <option>April</option>
          <option>May</option>
          <option>June</option>
          <option>July</option>
          <option>August</option>
          <option>September</option>
          <option>October</option>
          <option>November</option>
          <option>December</option>
          </select>
          {error.birthday.month && (<p className="text-[#e1143d] text-xs font-medium">{error.birthday.month.message}</p>)} 
        </div>
      </div>
    
      <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <input className="appearance-none block w-full mt-[16px] bg-gray-200 text-gray-700 border
         border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white 
         ffocus:border-[#ffd301]" id="grid-day" type="number" placeholder="Day" name='day' onChange={handleChange}/>
         {error.birthday.day && (<p className="text-[#e1143d] text-xs font-medium">{error.birthday.day.message}</p>)}
      </div>
      <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
        <input className="appearance-none block w-full mt-[16px] bg-gray-200 text-gray-700 border
         border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white
          focus:border-[#ffd301]" id="grid-zip" type="number" placeholder="Year" name='year' onChange={handleChange}/>
          {error.birthday.year && (<p className="text-[#e1143d] text-xs font-medium">{error.birthday.year.message}</p>)}
      </div>
    </div>
    }     
          {!isLogin &&
          <p className='text-[#656b73] text-xs font-normal leading-4 pt-8 pb-3 text-center'>
            By tapping Sign Up & Accept, you acknowledge that you have read the Privacy Policy and agree to the Terms of Service. 
            Snapchatters can always capture or save your messages, such as by taking a screenshot or using a camera. Be mindful of what you Snap!</p>
          }
          {error.auth && (<p className="text-[#e1143d] text-xs font-medium">{error.auth.message}</p>)} 
          <button className='bg-[#fffc00] text-black block pt-2 pb-2 pr-4 pl-4 leading-7 rounded-3xl font-semibold mt-5 m-auto '>{isLogin ? 'Log in' : 'Sign Up & Accept'}</button>
    </form>
    </div>
    </div>
    )       
}

export default RegisterAndLogin
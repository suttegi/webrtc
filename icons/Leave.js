import React from 'react'

const Leave = ({ fill = "white", ...props }) => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 13L14 9L9 5V8H0V10H9V13Z" fill={fill}/>
    <path d="M16 0H7C5.897 0 5 0.897 5 2V6H7V2H16V16H7V12H5V16C5 17.103 5.897 18 7 18H16C17.103 18 18 17.103 18 16V2C18 0.897 17.103 0 16 0Z" fill={fill}/>
    </svg>

  )
}

export default Leave
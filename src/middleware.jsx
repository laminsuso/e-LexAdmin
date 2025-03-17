import React from 'react'
import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

const Middleware=()=>{
    
    return (
    <>
    {localStorage.getItem("token")?<Outlet/>:<Navigate to="/auth/true"/>}
    </>
    )
}

export default Middleware;
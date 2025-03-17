import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from 'axios'
import { BASE_URL } from "./baseUrl";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

function AuthPage() {
    const [email, setEmail] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    let { login } = useParams();
let navigate=useNavigate();
    useEffect(() => {
        setIsLogin(login === "true");
    }, [login]);

    const handleSubmit = async(e) => {
        e.preventDefault();
        if(email.length==0){
            toast.error("Please enter email",{containerId:'authPage'})
            return;
                    }else if(password.length==0){
                        toast.error("Please enter password",{containerId:'authPage'})
                        return;
                    }else if (!isLogin && password !== confirmPassword) {
            toast.error("Passwords do not match!",{containerId:'authPage'});
            return;
         }

        
      
        try{
if(isLogin){
let res=await axios.post(`${BASE_URL}/api/auth/login`,{email,password})

localStorage.setItem('token',res.data.token)
toast.success("Logged in successfully",{containerId:"authPage"})
setPassword("")
setEmail("")
setConfirmPassword("")
setTimeout(()=>{
    navigate('/')
},3000)
}else{
    let res=await axios.post(`${BASE_URL}/api/auth/register`,{email,password})
    toast.success(res.data.message,{containerId:"authPage"})
    setPassword("")
    setEmail("")
    setConfirmPassword("")
}
        }catch(e){
            if(e?.response?.data?.error){
  toast.error(e?.response?.data?.error,{containerId:"authPage"})
            }else{
                toast.error("Something went wrong",{containerId:"authPage"})
            }
           
        }
        // alert(isLogin ? "Logged in successfully!" : "Registered successfully!");
    };

    return (
       <>
       
       <ToastContainer containerId="authPage"/>
       <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 flex justify-center items-center p-8">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 border border-gray-300">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    {isLogin ? "Login" : "Register"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    )}
                    <button type="submit" className="w-full p-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-700">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <Link to={isLogin ? "/auth/false" : "/auth/true"} className="text-blue-600 font-bold hover:underline ml-1">
                        {isLogin ? "Register" : "Login"}
                    </Link>
                </p>
            </div>
        </div>
       </>
    );
}

export default AuthPage;

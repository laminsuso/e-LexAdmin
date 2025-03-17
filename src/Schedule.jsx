import { useState,useEffect} from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { FiTrash2, FiEye } from "react-icons/fi";
import { ToastContainer,toast } from "react-toastify";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "./baseUrl";




function Schedule() {
  let location=useLocation();
  const [schedule,setSchedule]=useState({})
  useEffect(()=>{
fetchSpeicificSchedule();
  },[])
  const fetchSpeicificSchedule=async()=>{
try{
  let token=localStorage.getItem('token')
  let headers={
      headers:{
          authorization:`Bearer ${token}`
      }
  }
  let params=new URLSearchParams(location.search)
  let id=params.get('id')
  
let res=await axios.get(`${BASE_URL}/api/schedules/${id}`,headers)
console.log(res)
setSchedule(res.data.schedule)

}catch(e){
if(e?.response?.data.error){
  toast.error(e?.response?.data?.error,{containerId:"schedule"})
}else{
  toast.error("Something went wrong please try again",{containerId:"schedule"})
}
}
  }
  return (
    <>
    <ToastContainer containerId="schedule"/>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Volunteer Assignments</h1>
                <p className="mt-1 text-gray-600">Manage volunteer schedules and assignments</p>
              </div>
            </div>
          </div>


          <div className="px-8 py-6">
            <div className="grid grid-cols-1 gap-6">
            
               
                  <div key={schedule?._id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                         
                       
                            <div className="mt-4 border-t border-gray-100 pt-4">
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-3">
                                  <span className="w-24 text-gray-500">Assigned to:</span>
                                  <span className="font-medium text-indigo-600">{schedule?.eventName}</span>
                                </div>
                                    <div className="flex items-center gap-3">
                                  <span className="w-24 text-gray-500">Registered By:</span>
                                  <span className="font-medium text-indigo-600">{schedule?.registeredBy?.length}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="w-24 text-gray-500">Schedule date:</span>
                                <span className="font-medium" data-testid="schedule-date">
  {schedule?.date ? new Date(schedule.date).toDateString() : ''}
</span>

                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="w-24 text-gray-500">Status:</span>
                                  <span className="px-2.5 py-0.5 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                                    Confirmed
                                  </span>
                                </div>
                              </div>
                            </div>
                        
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <button className="p-2 text-indigo-600 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors">

                          </button>
                          <button className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">

                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
             
         
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Schedule;

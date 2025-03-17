import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { FiTrash2, FiEye, FiPlus, FiX, FiEdit } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import { BASE_URL } from "./baseUrl";

const users = ["John Doe", "Jane Smith", "Alice Johnson"];
const schedulesPerPage = 2;

function Dashboard() {
    const [initialSchedules,setInitialSchedules]=useState([])
    const [schedules, setSchedules] = useState([]);
    const [services,setServices]=useState([
        "Lawn mowing for elderly citizens and poor",
        "Library assistant",
        "Volunteers in churches",
        "Cleaning public spaces like parks, beaches, tourism spots",
        "Spending time with elderly citizens so that they can avoid loneliness",
        "Awareness programs organizing public speeches given to high school students by successful leaders to create awareness",
        "Disaster & Crisis Relief",
        "Emergency Shelter Assistance",
        "Fundraising for disaster victims",
        "Community Emergency Response Teams",
        "Online Tutoring or mentorship",
        "Tree planting",
        "Blood Donation drives"
      ])
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [location,setLocation]=useState("")
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [newSchedule, setNewSchedule] = useState("Lawn mowing for elderly citizens and poor");
    const [selectedUser, setSelectedUser] = useState("");
    const [totalVolunteers,setTotalVolunteers]=useState(0)
    const [scheduleFixture, setScheduleFixture] = useState("");

    const indexOfLastSchedule = currentPage * schedulesPerPage;
    const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
    const currentSchedules = initialSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
    const totalPages = Math.ceil(initialSchedules.length / schedulesPerPage);

    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    const deleteSchedule =async (id) => {
        try{
            let token=localStorage.getItem('token')
            let headers={
                headers:{
                    authorization:`Bearer ${token}`
                }
            }

let res=await axios.delete(`${BASE_URL}/api/schedules/${id}`,headers)
setInitialSchedules(initialSchedules.filter(schedule => schedule._id !== id));
toast.success("Schedule deleted successfully",{containerId:"dashboard"})
        }catch(e){
            if(e?.response?.data?.error){
                toast.error(e?.response?.data?.error,{containerId:"dashboard"})
            }else{
toast.error("Something went wrong please try again",{containerId:"dashboard"})
            }
        }
       
    };

    const handleEditClick = (schedule) => {
        setEditingSchedule(schedule);
        setNewSchedule(schedule.eventName);
       
        const date = new Date(schedule.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        setScheduleFixture(formattedDate);
        setTotalVolunteers(schedule.maxVolunteers)
        setLocation(schedule.location)
        setIsModalOpen(true);
    };
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
        return now.toISOString().slice(0, 16);
      };

    const handleSubmit = async() => {
     
        const formattedDate = new Date(scheduleFixture).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        if (editingSchedule) {
            let newEntry = {
            
                eventName: newSchedule,
                date: formattedDate,
                location:location,
                maxVolunteers:totalVolunteers.toString()
            };
         try{
            let token=localStorage.getItem('token')
            let headers={
                headers:{
                    authorization:`Bearer ${token}`
                }
            }
            let res=await axios.patch(`${BASE_URL}/api/schedules/${editingSchedule?._id}`,newEntry,headers)
            setInitialSchedules(initialSchedules.map(schedule =>
                schedule._id === editingSchedule._id
                    ? { ...schedule, eventName: newSchedule, location:location,date: formattedDate,maxVolunteers:totalVolunteers }
                    : schedule
            ));
            toast.success(res.data.message,{containerId:"dashboard"})
            resetForm();
         }catch(e){
            console.log(e.message)
if(e?.response?.data?.error){
    toast.error(e?.response?.data?.error,{containerId:'dashboard'})
}else{
    toast.error("Something went wrong please try again",{containerId:"dashboard"})
}
         }
        } else {
         
          if(formattedDate=="Invalid Date"){
toast.error("Please select date and time",{containerId:"dashboard"})
return
          }else if(totalVolunteers.length==0){
        toast.error("Please enter total volunteers",{containerId:"dashboard"})
        return;
          }else if(location.length==0){
toast.error("Please enter location",{containerId:"dashboard"})
return;
          }
            let newEntry = {
            
                eventName: newSchedule,
                date: formattedDate,
                location:location,
                maxVolunteers:totalVolunteers.toString()
            };
            // const newEntry = {
            //     id: String(Date.now()),
            //     name: newSchedule,
            //     createdAt: formattedDate,
            //     user: selectedUser,
            // };
       
           try{
            let token=localStorage.getItem('token')
            let headers={
                headers:{
                    authorization:`Bearer ${token}`
                }
            }
         
            let res=await axios.post(`${BASE_URL}/api/schedules`,newEntry,headers)
            newEntry={
                ...newEntry,
                _id:res.data.scheduleId
            }
           
            setInitialSchedules(prev => {
                const updated = [...prev, newEntry];
                const newTotalPages = Math.ceil(updated.length / schedulesPerPage);
                if (currentPage !== newTotalPages) setCurrentPage(newTotalPages);
                return updated;
            });
     
            toast.success(res.data.message,{containerId:"dashboard"})
            resetForm();
           }catch(e){
            console.log(e)
     if(e?.response?.data?.error){
toast.error(e?.response?.data?.error,{containerId:"dashboard"})
     }else{
toast.error("Something went wrong please try again",{containerId:"dashboard"})
     }
           }
        }

   
    };

    const resetForm = () => {
        setEditingSchedule(null);
        setTotalVolunteers("")
        setLocation("")
        setNewSchedule("Lawn mowing for elderly citizens and poor");
        setSelectedUser("");
        setScheduleFixture("");
        setIsModalOpen(false);
    };
useEffect(()=>{
    fetchSchedules()
},[])


const fetchSchedules = async () => {
    try {
      let token = localStorage.getItem('token');
      let headers = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      let res = await axios.get(`${BASE_URL}/api/schedules`, headers);
      setInitialSchedules(res.data.schedules);
    } catch (e) {
      console.log(e?.message);
     
      if (e?.response?.data?.error) {
        toast.error(e?.response?.data?.error, { containerId: 'dashboard' });
      } else {
        toast.error("Failed to load schedules", { containerId: 'dashboard' });
      }
    }
  };


return (
       <>
       <ToastContainer containerId="dashboard"/>
       <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8 py-6 sm:py-12">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden">


                    <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Volunteer Schedule Manager</h1>
                                <p className="mt-1 text-sm sm:text-base text-gray-600">Organize community volunteer events</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 justify-center text-sm sm:text-base"
                            >
                                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="sm:hidden">New Event</span>
                                <span className="hidden sm:inline">Create New Event</span>
                            </button>
                        </div>
                    </div>


                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {currentSchedules?.map((schedule) => (
                                <div key={schedule?._id} className="group relative bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{schedule?.eventName}</h3>
                                                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-16 sm:w-24 text-gray-500">Location:</span>
                                                        <span className="font-medium text-indigo-600 truncate">{schedule?.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-16 sm:w-24 text-gray-500">Scheduled:</span>
                                                        <span className="font-medium truncate">{schedule?.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 self-end">
                                                <button
                                                    onClick={() => handleEditClick(schedule)}
                                                    className="p-1.5 sm:p-2 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    <FiEdit className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                <Link
                                                    to={`/schedule?id=${schedule._id}`}
                                                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-colors hover:border-indigo-300 text-sm"
                                                >
                                                    <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span>Details</span>
                                                </Link>
                                                <button
  onClick={() => deleteSchedule(schedule._id)}
  className="p-1.5 sm:p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
  aria-label="Delete schedule"
>
  <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4 sm:pt-6">
                        <div 
  className="text-xs sm:text-sm text-gray-600 text-center sm:text-left"
  data-testid="pagination-text"
>
  Showing {indexOfFirstSchedule + 1} to {indexOfLastSchedule} of {initialSchedules.length} events
</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                                        } rounded-lg border border-gray-200`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                                        } rounded-lg border border-gray-200`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-semibold">
                                {editingSchedule ? "Edit Volunteer Event" : "New Volunteer Event"}
                            </h2>
                            <button
  onClick={resetForm}
  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
  aria-label="Close modal"  
>
  <FiX className="w-5 h-5" />
</button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">

                      
<div>
  <label 
    htmlFor="event-name" 
    className="block text-sm font-medium text-gray-700 mb-1.5"
  >
    Event Name
  </label>
  <select
    id="event-name"
    value={newSchedule}
    onChange={(e) => setNewSchedule(e.target.value)}
    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
  >
    {services.map((service, i) => (
      <option key={i} value={service}>
        {service}
      </option>
    ))}
  </select>
</div>


<div>
  <label 
    htmlFor="datetime" 
    className="block text-sm font-medium text-gray-700 mb-1.5"
  >
    Date & Time
  </label>
  <input
    id="datetime"
    type="datetime-local"
    value={scheduleFixture}
    onChange={(e) => setScheduleFixture(e.target.value)}
    min={getMinDateTime()}
    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
  />
</div>


<div>
  <label 
    htmlFor="max-volunteers" 
    className="block text-sm font-medium text-gray-700 mb-1.5"
  >
    Max Volunteers
  </label>
  <input
    id="max-volunteers"
    type="number"
    value={totalVolunteers}
    onChange={(e) => {
      let value = e.target.value;
      if (value === "" || /^[1-9]\d*$/.test(value)) {
        setTotalVolunteers(value);
      }
    }}
    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
  />
</div>


<div>
  <label 
    htmlFor="location" 
    className="block text-sm font-medium text-gray-700 mb-1.5"
  >
    Location
  </label>
  <input
    id="location"
    type="text"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
  />
</div>
                        </div>

                        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm sm:text-base"
                            >
                                {editingSchedule ? "Save Changes" : "Create Event"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
       </>
    );
}

export default Dashboard;
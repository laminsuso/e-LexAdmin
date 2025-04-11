import { useEffect, useState } from "react";
import { FiTrash2, FiPlus, FiX, FiEdit } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import { BASE_URL } from "./baseUrl";

const defaultPlan = {
  name: "",
  price: 0,
  numberOfSigns: 0,
  numberOfEmails: 0,
  billingCycle: "monthly"
};

function PlanDashboard() {
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [yearlyPlans, setYearlyPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(defaultPlan);

  useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/get-plans`, {
        headers: { authorization: `Bearer ${token}` }
      });
      
      const plans = res.data.plans.map(plan => ({
        ...plan,
        price: plan.price?.$numberDecimal ? parseFloat(plan.price.$numberDecimal) : plan.price
      })); 
      
      setMonthlyPlans(plans.filter(p => p.billingCycle === 'monthly'));
      setYearlyPlans(plans.filter(p => p.billingCycle === 'yearly'));
    } catch (error) {
      handleError(error, "Failed to load plans");
    }
  };

  const handleSubmit = async () => {
    try {
      if(formData.name.length==0){
        toast.error("Please enter name",{containerId:"plans"})
        return
      }else if(formData.numberOfSigns==0){
        toast.error("Please enter number of signatures",{containerId:"plans"})
        return
      }else if(formData.numberOfEmails==0){
        toast.error("Please enter number of emails",{containerId:"plans"})
        return;
      }else if(formData.billingCycle.length==0){
        toast.error("Please enter billing cycle",{containerId:"plans"})
        return;
      }
      const token = localStorage.getItem('token');
      const url = editingPlan 
        ? `${BASE_URL}/update-plan/${editingPlan._id}`
        : `${BASE_URL}/create-plan`;

      const method = editingPlan ? 'patch' : 'post';

      const res = await axios[method](url, formData, {
        headers: { authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message, { containerId: "plans" });
      resetForm();
      fetchPlans();
    } catch (error) {
      handleError(error, "Operation failed");
    }
  };

  const deletePlan = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/delete-plan/${id}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success("Plan deleted successfully", { containerId: "plans" });
      fetchPlans();
    } catch (error) {
      handleError(error, "Delete failed");
    }
  };

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      price: plan.price?.$numberDecimal ? parseFloat(plan.price.$numberDecimal) : plan.price
    });
    setIsModalOpen(true);
  };
  
  const resetForm = () => {
    setFormData(defaultPlan);
    setEditingPlan(null);
    setIsModalOpen(false);
  };
  const handleError = (error, defaultMsg) => {
    console.error(error);
    const message = error.response?.data?.error || defaultMsg;
    toast.error(message, { containerId: "plans" });
  };


  const renderPlanCard = (plan) => (
    <div key={plan._id} className="bg-white rounded-lg p-4 shadow-md mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-2xl my-2">
          ${typeof plan.price === 'number' ? plan.price.toFixed(2) : plan.price}</p>
          <div className="text-gray-600">
            <p>{plan.numberOfSigns} signatures</p>
            <p>{plan.numberOfEmails} emails</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(plan)}
            className="text-blue-500 hover:text-blue-700"
          >
            <FiEdit size={20} />
          </button>
          <button
            onClick={() => deletePlan(plan._id)}
            className="text-red-500 hover:text-red-700"
          >
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <ToastContainer containerId="plans" />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPlus /> Add Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Monthly Plans</h2>
            {monthlyPlans.map(renderPlanCard)}
            {monthlyPlans.length < 4 && (
              <div className="text-gray-500 text-center">
                {4 - monthlyPlans.length} monthly slots available
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Yearly Plans</h2>
            {yearlyPlans.map(renderPlanCard)}
            {yearlyPlans.length < 4 && (
              <div className="text-gray-500 text-center">
                {4 - yearlyPlans.length} yearly slots available
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingPlan ? "Edit Plan" : "New Plan"}
                </h2>
                <button onClick={resetForm} className="text-gray-500">
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-2">Number of Signatures</label>
                  <input
                    type="number"
                    value={formData.numberOfSigns}
                    onChange={(e) => setFormData({...formData, numberOfSigns: e.target.value})}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-2">Number of Emails</label>
                  <input
                    type="number"
                    value={formData.numberOfEmails}
                    onChange={(e) => setFormData({...formData, numberOfEmails: e.target.value})}
                    className="w-full p-2 border rounded"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block mb-2">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingPlan ? "Save Changes" : "Create Plan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanDashboard;
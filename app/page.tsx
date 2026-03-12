'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  customerCode: string;
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', customerCode: '' });
  const [githubConfigured, setGithubConfigured] = useState(false);
  const [commitStatus, setCommitStatus] = useState('');

  useEffect(() => {
    fetchCustomers();
    checkGitHubConfig();
  }, []);

  const checkGitHubConfig = async () => {
    try {
      const res = await fetch('/api/github-config');
      const data = await res.json();
      setGithubConfigured(data.configured);
    } catch {
      setGithubConfigured(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        await fetch('/api/customers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingCustomer.id }),
        });
        setCommitStatus('✏️ Updated and committed to GitHub!');
      } else {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setCommitStatus('➕ Added and committed to GitHub!');
      }
      
      await fetchCustomers();
      closeModal();
      setTimeout(() => setCommitStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบลูกค้าคนนี้?')) return;
    
    try {
      await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      setCommitStatus('🗑️ Deleted and committed to GitHub!');
      await fetchCustomers();
      setTimeout(() => setCommitStatus(''), 3000);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', customerCode: '' });
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ 
      firstName: customer.firstName, 
      lastName: customer.lastName || '', 
      customerCode: customer.customerCode 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', customerCode: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👥 จัดการลูกค้า</h1>
            <p className="text-gray-500 mt-1">รวม {customers.length} คน</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {commitStatus && (
              <span className="text-green-600 font-medium animate-pulse">{commitStatus}</span>
            )}
            {!githubConfigured && (
              <span className="text-amber-600 text-sm">⚠️ GitHub ยังไม่ได้ตั้งค่า</span>
            )}
            <button
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>➕</span> เพิ่มลูกค้า
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">#</th>
                  <th className="px-6 py-4 text-left font-semibold">ชื่อ</th>
                  <th className="px-6 py-4 text-left font-semibold">นามสกุล</th>
                  <th className="px-6 py-4 text-left font-semibold">รหัสลูกค้า</th>
                  <th className="px-6 py-4 text-center font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{customer.firstName}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.lastName || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-mono">
                        {customer.customerCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">ยังไม่มีลูกค้า</p>
              <p className="mt-2">กดปุ่ม "เพิ่มลูกค้า" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingCustomer ? '✏️ แก้ไขลูกค้า' : '➕ เพิ่มลูกค้าใหม่'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">ชื่อ *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรอกชื่อ"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">นามสกุล</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="กรอกนามสกุล (ถ้ามี)"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">รหัสลูกค้า *</label>
                <input
                  type="text"
                  value={formData.customerCode}
                  onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="กรอกรหัสลูกค้า"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {editingCustomer ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

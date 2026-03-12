"use client";

import { useState, useEffect } from 'react';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  customerCode: string;
}

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', customerCode: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [githubConfigured, setGithubConfigured] = useState(false);

  useEffect(() => {
    fetchCustomers();
    // Check if GitHub is configured
    fetch('/api/github-status').then(res => res.json()).then(data => {
      setGithubConfigured(data.configured);
    }).catch(() => setGithubConfigured(false));
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Update
      await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingCustomer.id }),
      });
    } else {
      // Create
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }
    
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', customerCode: '' });
    fetchCustomers();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ firstName: customer.firstName, lastName: customer.lastName, customerCode: customer.customerCode });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchCustomers();
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', customerCode: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👥 Customer Manager</h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลลูกค้า 3BB</p>
            {!githubConfigured && (
              <p className="text-orange-500 text-sm mt-1">⚠️ GitHub Auto-commit: ยังไม่ได้ตั้งค่า</p>
            )}
            {githubConfigured && (
              <p className="text-green-500 text-sm mt-1">✅ GitHub Auto-commit: เปิดใช้งาน</p>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>+</span> เพิ่มลูกค้า
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-indigo-600">{customers.length}</div>
            <div className="text-gray-500">ลูกค้าทั้งหมด</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">
              {customers.filter(c => c.lastName).length}
            </div>
            <div className="text-gray-500">มีนามสกุล</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">
              {customers.filter(c => !c.lastName).length}
            </div>
            <div className="text-gray-500">ไม่มีนามสกุล</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
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
                  <tr key={customer.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{customer.firstName}</td>
                    <td className="px-6 py-4 text-gray-600">{customer.lastName || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-mono">
                        {customer.customerCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          แก้ไข
                        </button>
                        {deleteConfirm === customer.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              ยืนยัน
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(customer.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">ไม่มีข้อมูลลูกค้า</p>
              <p className="mt-2">กดปุ่ม "เพิ่มลูกค้า" เพื่อเริ่มต้น</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="กรอกชื่อ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="กรอกนามสกุล (ถ้ามี)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสลูกค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customerCode}
                    onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    placeholder="เช่น 450193618"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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

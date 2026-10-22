'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  updateMedicineStock,
  addMedicineBatch,
  toggleMedicineActive,
  upsertAdminMedicine,
} from '@/actions/medicine-inventory.actions';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit2,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ShieldAlert,
  Power,
} from 'lucide-react';

export function MedicineInventoryClient({ medicines, categories }) {
  const router = useRouter();

  // Modal States
  const [batchModal, setBatchModal] = useState({ open: false, medicine: null });
  const [editModal, setEditModal] = useState({ open: false, medicine: null });
  const [loading, setLoading] = useState(false);

  // Batch Form
  const [batchData, setBatchData] = useState({
    batchNumber: '',
    expiryDate: '',
    quantity: 50,
  });

  // Edit Medicine Form
  const [medForm, setMedForm] = useState({
    name: '',
    genericName: '',
    brand: '',
    category: categories[0]?.name || 'Pain Relief and Analgesics',
    subcategory: '',
    price: 100,
    discountPrice: '',
    stock: 50,
    dosageForm: 'Tablets',
    strength: '500mg',
    packageSize: '',
    prescriptionRequired: false,
    description: '',
    manufacturer: '',
    sku: '',
  });

  const openAddModal = () => {
    setMedForm({
      name: '',
      genericName: '',
      brand: '',
      category: categories[0]?.name || 'Pain Relief and Analgesics',
      subcategory: '',
      price: 100,
      discountPrice: '',
      stock: 50,
      dosageForm: 'Tablets',
      strength: '500mg',
      packageSize: '',
      prescriptionRequired: false,
      description: '',
      manufacturer: '',
      sku: '',
    });
    setEditModal({ open: true, medicine: null });
  };

  const openEditModal = (med) => {
    setMedForm({
      id: med.id,
      name: med.name,
      genericName: med.genericName || '',
      brand: med.brand || '',
      category: med.category,
      subcategory: med.subcategory || '',
      price: med.price,
      discountPrice: med.discountPrice || '',
      stock: med.stock,
      dosageForm: med.dosageForm || 'Tablets',
      strength: med.strength || '',
      packageSize: med.packageSize || '',
      prescriptionRequired: med.prescriptionRequired,
      description: med.description,
      manufacturer: med.manufacturer || '',
      sku: med.sku || '',
    });
    setEditModal({ open: true, medicine: med });
  };

  const handleStockUpdate = async (medId, newStock) => {
    try {
      const res = await updateMedicineStock(medId, newStock);
      if (res.success) {
        toast.success('Stock quantity updated');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update stock');
      }
    } catch {
      toast.error('Stock update failed');
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchData.batchNumber.trim() || !batchData.expiryDate) {
      toast.error('Batch number and expiry date are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await addMedicineBatch({
        medicineId: batchModal.medicine.id,
        batchNumber: batchData.batchNumber,
        expiryDate: batchData.expiryDate,
        quantity: batchData.quantity,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to record batch');
      } else {
        toast.success(`Batch #${batchData.batchNumber} added and inventory updated!`);
        setBatchModal({ open: false, medicine: null });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add batch.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...medForm,
        price: parseFloat(medForm.price),
        discountPrice: medForm.discountPrice ? parseFloat(medForm.discountPrice) : null,
        stock: parseInt(medForm.stock, 10),
      };

      const res = await upsertAdminMedicine(payload);

      if (!res.success) {
        toast.error(res.error || 'Failed to save product');
      } else {
        toast.success(medForm.id ? 'Medicine updated successfully!' : 'New medicine added to catalog!');
        setEditModal({ open: false, medicine: null });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save medicine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 shadow-xs transition"
        >
          <Plus className="h-4 w-4" /> Add New Medicine
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-6">Product & Form</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price (PKR)</th>
              <th className="py-3.5 px-4">Available Stock</th>
              <th className="py-3.5 px-4">Prescription</th>
              <th className="py-3.5 px-4">Batches</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {medicines.map((med) => {
              const isOut = med.stock <= 0;
              const isLow = med.stock > 0 && med.stock <= 15;

              return (
                <tr key={med.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-950 dark:text-white text-sm">{med.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {med.dosageForm} {med.strength ? `· ${med.strength}` : ''}
                      {med.sku ? ` · ${med.sku}` : ''}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:text-teal-300">
                      {med.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(med.price)}
                    {med.discountPrice && (
                      <span className="block text-[10px] text-emerald-600 font-normal">
                        Sale: {formatCurrency(med.discountPrice)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={med.stock}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val !== med.stock) {
                            handleStockUpdate(med.id, val);
                          }
                        }}
                        className={`w-18 rounded-lg border px-2 py-1 text-xs font-bold outline-none ${
                          isOut
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : isLow
                            ? 'border-amber-400 bg-amber-50 text-amber-800'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                        }`}
                      />
                      {isOut && <span className="text-[10px] font-bold text-rose-600">OUT</span>}
                      {isLow && <span className="text-[10px] font-bold text-amber-600">LOW</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {med.prescriptionRequired ? (
                      <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
                        Rx Required
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">OTC</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => setBatchModal({ open: true, medicine: med })}
                      className="text-xs font-semibold text-teal-800 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      {med.batches?.length || 0} batches
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(med)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch Modal */}
      {batchModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Inventory Batch
              </h3>
              <button
                onClick={() => setBatchModal({ open: false, medicine: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              For: <strong>{batchModal.medicine?.name}</strong>
            </p>

            <form onSubmit={handleBatchSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Batch Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GSK-2024-B8"
                  value={batchData.batchNumber}
                  onChange={(e) => setBatchData({ ...batchData, batchNumber: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={batchData.expiryDate}
                  onChange={(e) => setBatchData({ ...batchData, expiryDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Batch Quantity (Units) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={batchData.quantity}
                  onChange={(e) =>
                    setBatchData({ ...batchData, quantity: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setBatchModal({ open: false, medicine: null })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
                >
                  Record Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Medicine Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {medForm.id ? 'Edit Medicine Details' : 'Add New Medicine to Catalog'}
              </h3>
              <button
                onClick={() => setEditModal({ open: false, medicine: null })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMedSubmit} className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Panadol 500mg Tablets"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Generic Formula
                </label>
                <input
                  type="text"
                  value={medForm.genericName}
                  onChange={(e) => setMedForm({ ...medForm, genericName: e.target.value })}
                  placeholder="e.g. Paracetamol"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Brand</label>
                <input
                  type="text"
                  value={medForm.brand}
                  onChange={(e) => setMedForm({ ...medForm, brand: e.target.value })}
                  placeholder="e.g. Panadol"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Therapeutic Category *
                </label>
                <select
                  value={medForm.category}
                  onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Dosage Form
                </label>
                <select
                  value={medForm.dosageForm}
                  onChange={(e) => setMedForm({ ...medForm, dosageForm: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="Tablets">Tablets</option>
                  <option value="Capsules">Capsules</option>
                  <option value="Syrups">Syrups</option>
                  <option value="Suspensions">Suspensions</option>
                  <option value="Creams">Creams</option>
                  <option value="Ointments">Ointments</option>
                  <option value="Drops">Drops</option>
                  <option value="Inhalers">Inhalers</option>
                  <option value="Injections">Injections</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={medForm.price}
                  onChange={(e) => setMedForm({ ...medForm, price: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Discount Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={medForm.discountPrice}
                  onChange={(e) => setMedForm({ ...medForm, discountPrice: e.target.value })}
                  placeholder="Optional discount"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={medForm.stock}
                  onChange={(e) => setMedForm({ ...medForm, stock: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={medForm.manufacturer}
                  onChange={(e) => setMedForm({ ...medForm, manufacturer: e.target.value })}
                  placeholder="e.g. GSK Pakistan"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <input
                  id="prescriptionRequired"
                  type="checkbox"
                  checked={medForm.prescriptionRequired}
                  onChange={(e) =>
                    setMedForm({ ...medForm, prescriptionRequired: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label
                  htmlFor="prescriptionRequired"
                  className="text-xs font-bold text-amber-900 dark:text-amber-300"
                >
                  Prescription Required (Rx) — customer must upload valid doctor prescription
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={medForm.description}
                  onChange={(e) => setMedForm({ ...medForm, description: e.target.value })}
                  placeholder="Clinical indications and dosage instructions..."
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 mt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, medicine: null })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

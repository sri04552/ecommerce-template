import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus,
    FolderTree,
    Edit3,
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Save,
    X,
} from 'lucide-react';

export default function CategoriesIndex({ categories, flatCategories }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form for create / update
    const form = useForm({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        is_active: true,
        sort_order: 0,
    });

    const openCreateModal = (parentId = '') => {
        setEditingCategory(null);
        form.setData({
            name: '',
            slug: '',
            parent_id: parentId ? String(parentId) : '',
            description: '',
            is_active: true,
            sort_order: 0,
        });
        setIsCreating(true);
    };

    const openEditModal = (cat) => {
        setIsCreating(false);
        setEditingCategory(cat);
        form.setData({
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parent_id ? String(cat.parent_id) : '',
            description: cat.description || '',
            is_active: Boolean(cat.is_active),
            sort_order: cat.sort_order || 0,
        });
    };

    const closeModal = () => {
        setIsCreating(false);
        setEditingCategory(null);
        form.reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(`/admin/categories/${editingCategory.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            form.post('/admin/categories', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (category) => {
        if (
            confirm(
                `Are you sure you want to delete category "${category.name}"? This will fail if it contains products or subcategories.`
            )
        ) {
            router.delete(`/admin/categories/${category.id}`);
        }
    };

    // Render tree row recursively
    const renderCategoryRow = (cat, depth = 0) => {
        return (
            <div key={cat.id} className="divide-y divide-slate-100">
                <div
                    className="flex items-center justify-between py-3.5 px-4 hover:bg-slate-50 transition-colors"
                    style={{ paddingLeft: `${depth * 28 + 16}px` }}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        {depth > 0 && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                        <FolderTree
                            className={`w-4 h-4 shrink-0 ${
                                depth === 0 ? 'text-indigo-600' : 'text-slate-400'
                            }`}
                        />
                        <div className="min-w-0">
                            <span className="font-semibold text-slate-900 text-sm">{cat.name}</span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">/{cat.slug}</span>
                            {cat.description && (
                                <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                                    {cat.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-md text-slate-700 font-medium">
                            {cat.products_count || 0} products
                        </span>

                        {cat.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                <XCircle className="w-3 h-3 text-slate-400" />
                                Inactive
                            </span>
                        )}

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => openCreateModal(cat.id)}
                                className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                                title="Add Subcategory"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => openEditModal(cat)}
                                className="p-1 rounded hover:bg-slate-200 text-indigo-600 hover:text-indigo-800"
                                title="Edit Category"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => handleDelete(cat)}
                                className="p-1 rounded hover:bg-slate-200 text-rose-500 hover:text-rose-700"
                                title="Delete Category"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {cat.children && cat.children.length > 0 && (
                    <div className="border-l-2 border-indigo-100 ml-6">
                        {cat.children.map((child) => renderCategoryRow(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout
            title="Categories"
            subtitle="Organize products into hierarchical departments and subcategories."
            actions={
                <button
                    onClick={() => openCreateModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Root Category</span>
                </button>
            }
        >
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Category Hierarchy
                    </h3>
                    <span className="text-xs text-slate-500">
                        {flatCategories?.length || 0} total categories
                    </span>
                </div>

                {categories && categories.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {categories.map((rootCategory) => renderCategoryRow(rootCategory, 0))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-slate-800">No categories created</h4>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            Organize your products by creating categories such as Apparel, Electronics, or Home.
                        </p>
                        <div className="mt-5">
                            <button
                                onClick={() => openCreateModal()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Category</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Create / Edit Category */}
            {(isCreating || editingCategory) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingCategory ? 'Edit Category' : 'Create Category'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Footwear"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-rose-500 mt-1">{form.errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.slug}
                                        onChange={(e) => form.setData('slug', e.target.value)}
                                        placeholder="auto-generated if empty"
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    />
                                    {form.errors.slug && (
                                        <p className="text-xs text-rose-500 mt-1">{form.errors.slug}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Parent Category
                                    </label>
                                    <select
                                        value={form.data.parent_id}
                                        onChange={(e) => form.setData('parent_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
                                    >
                                        <option value="">None (Top Level Root)</option>
                                        {flatCategories
                                            ?.filter((c) => !editingCategory || c.id !== editingCategory.id)
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                    {form.errors.parent_id && (
                                        <p className="text-xs text-rose-500 mt-1">{form.errors.parent_id}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Brief category summary"
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Active</span>
                                </label>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-slate-600">Sort Order:</label>
                                    <input
                                        type="number"
                                        value={form.data.sort_order}
                                        onChange={(e) => form.setData('sort_order', parseInt(e.target.value) || 0)}
                                        className="w-20 px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded-lg text-center"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{form.processing ? 'Saving...' : 'Save Category'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

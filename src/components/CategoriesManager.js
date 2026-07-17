"use client";

import { useEffect, useState } from "react";

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editing, setEditing] = useState(null); // {id,name,description}

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function call(method, body, qs = "") {
    setError("");
    const res = await fetch(`/api/categories${qs}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Request failed.");
      return false;
    }
    return true;
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const ok = await call("POST", { name: newName, description: newDesc });
    if (ok) {
      setNewName("");
      setNewDesc("");
      await load();
    }
  }

  async function saveEdit() {
    if (!editing) return;
    const ok = await call("PUT", {
      id: editing.id,
      name: editing.name,
      description: editing.description,
    });
    if (ok) {
      setEditing(null);
      await load();
    }
  }

  async function remove(id) {
    if (!confirm("Delete this category?")) return;
    const ok = await call("DELETE", null, `?id=${id}`);
    if (ok) await load();
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-on-surface-variant">
        Loading categories…
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
      <h3 className="text-title-md font-title-md mb-stack-md">Job Categories</h3>

      {error && (
        <div className="mb-stack-md px-4 py-2 rounded-lg bg-error-container text-on-error-container text-body-sm">
          {error}
        </div>
      )}

      {/* Add category */}
      <form onSubmit={addCategory} className="flex flex-wrap items-end gap-stack-sm mb-stack-md">
        <div className="space-y-base flex-1 min-w-[180px]">
          <label className="text-label-md font-label-md text-on-surface-variant">CATEGORY NAME</label>
          <input
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
            type="text"
            placeholder="e.g. Engineering"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="space-y-base flex-1 min-w-[180px]">
          <label className="text-label-md font-label-md text-on-surface-variant">DESCRIPTION</label>
          <input
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
            type="text"
            placeholder="Optional"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </button>
      </form>

      {/* List */}
      <div className="border border-outline-variant rounded-xl divide-y divide-outline-variant overflow-hidden">
        {categories.length === 0 && (
          <p className="p-4 text-body-sm text-on-surface-variant">No categories yet.</p>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors">
            {editing?.id === cat.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  className="flex-1 border border-outline-variant rounded-lg font-body-md py-1.5 px-2"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <input
                  className="flex-1 border border-outline-variant rounded-lg font-body-md py-1.5 px-2"
                  placeholder="Description"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
                <button onClick={saveEdit} className="text-secondary p-1 hover:bg-surface-container rounded" title="Save">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </button>
                <button onClick={() => setEditing(null)} className="text-on-surface-variant p-1 hover:bg-surface-container rounded" title="Cancel">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-body-md font-bold">{cat.name}</p>
                  {cat.description && (
                    <p className="font-body-sm text-on-surface-variant">{cat.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditing({ id: cat.id, name: cat.name, description: cat.description })}
                  className="text-on-surface-variant p-1 hover:bg-surface-container rounded"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => remove(cat.id)}
                  className="text-error p-1 hover:bg-error-container rounded"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

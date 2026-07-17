"use client";

import { useEffect, useState } from "react";

export default function RolesManager() {
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState(null); // {id,name,category}

  async function load() {
    setLoading(true);
    try {
      const [rolesRes, catRes] = await Promise.all([
        fetch("/api/roles").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setRoles(rolesRes.roles || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function call(method, body, qs = "") {
    setError("");
    const res = await fetch(`/api/roles${qs}`, {
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

  async function addRole(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    const ok = await call("POST", { name: newName, category: newCategory });
    if (ok) {
      setNewName("");
      setNewCategory("");
      await load();
    }
  }

  async function saveEdit() {
    if (!editing) return;
    const ok = await call("PUT", {
      id: editing.id,
      name: editing.name,
      category: editing.category,
    });
    if (ok) {
      setEditing(null);
      await load();
    }
  }

  async function remove(id) {
    if (!confirm("Delete this role?")) return;
    const ok = await call("DELETE", null, `?id=${id}`);
    if (ok) await load();
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-on-surface-variant">
        Loading roles…
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
      <div className="flex items-center justify-between mb-stack-md">
        <h3 className="text-title-md font-title-md">Job Roles</h3>
        <span className="text-label-md font-label-md text-on-surface-variant">
          {roles.length} total
        </span>
      </div>

      {error && (
        <div className="mb-stack-md px-4 py-2 rounded-lg bg-error-container text-on-error-container text-body-sm">
          {error}
        </div>
      )}

      {/* Add role */}
      <form onSubmit={addRole} className="flex flex-wrap items-end gap-stack-sm mb-stack-md">
        <div className="space-y-base flex-1 min-w-[180px]">
          <label className="text-label-md font-label-md text-on-surface-variant">ROLE NAME</label>
          <input
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
            type="text"
            placeholder="e.g. Software"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="space-y-base flex-1 min-w-[180px]">
          <label className="text-label-md font-label-md text-on-surface-variant">CATEGORY</label>
          <select
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3 bg-white"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Role
        </button>
      </form>

      {/* List */}
      <div className="border border-outline-variant rounded-xl divide-y divide-outline-variant overflow-hidden max-h-[520px] overflow-y-auto">
        {roles.length === 0 && (
          <p className="p-4 text-body-sm text-on-surface-variant">No roles yet.</p>
        )}
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors"
          >
            {editing?.id === role.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  className="flex-1 border border-outline-variant rounded-lg font-body-md py-1.5 px-2"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <select
                  className="border border-outline-variant rounded-lg font-body-md py-1.5 px-2 bg-white"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button onClick={saveEdit} className="text-secondary p-1 hover:bg-surface-container rounded" title="Save">
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </button>
                <button onClick={() => setEditing(null)} className="text-on-surface-variant p-1 hover:bg-surface-container rounded" title="Cancel">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-body-md font-bold">{role.name}</span>
                  {role.category && (
                    <span className="text-label-md font-label-md text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                      {role.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditing({ id: role.id, name: role.name, category: role.category })}
                  className="text-on-surface-variant p-1 hover:bg-surface-container rounded"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => remove(role.id)}
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

"use client";

import { useEffect, useState } from "react";

export default function GenericManager({ title, apiPath, placeholder }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(apiPath);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [apiPath]);

  async function call(method, body, qs = "") {
    setError("");
    const res = await fetch(`${apiPath}${qs}`, {
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

  async function addItem(e) {
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
    const ok = await call("PUT", { id: editing.id, name: editing.name, description: editing.description });
    if (ok) {
      setEditing(null);
      await load();
    }
  }

  async function remove(id) {
    if (!confirm(`Delete this ${title.toLowerCase()}?`)) return;
    const ok = await call("DELETE", null, `?id=${id}`);
    if (ok) await load();
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-on-surface-variant">
        Loading {title.toLowerCase()}…
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
      <h3 className="text-title-md font-title-md mb-stack-md">{title}</h3>

      {error && (
        <div className="mb-stack-md px-4 py-2 rounded-lg bg-error-container text-on-error-container text-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={addItem} className="flex flex-wrap items-end gap-stack-sm mb-stack-md">
        <div className="space-y-base flex-1 min-w-[180px]">
          <label className="text-label-md font-label-md text-on-surface-variant">{title.toUpperCase()}</label>
          <input
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
            type="text"
            placeholder={placeholder}
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
          Add {title.slice(0, -1)}
        </button>
      </form>

      <div className="border border-outline-variant rounded-xl divide-y divide-outline-variant overflow-hidden">
        {items.length === 0 && (
          <p className="p-4 text-body-sm text-on-surface-variant">No {title.toLowerCase()} yet.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors">
            {editing?.id === item.id ? (
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
                  <p className="font-body-md font-bold">{item.name}</p>
                  {item.description && (
                    <p className="font-body-sm text-on-surface-variant">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditing({ id: item.id, name: item.name, description: item.description })}
                  className="text-on-surface-variant p-1 hover:bg-surface-container rounded"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  onClick={() => remove(item.id)}
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

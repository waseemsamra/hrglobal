"use client";

import { useEffect, useState } from "react";

export default function LocationsManager() {
  const [countries, setCountries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // country form
  const [newCountry, setNewCountry] = useState("");
  const [newCode, setNewCode] = useState("");
  const [editingCountry, setEditingCountry] = useState(null); // {id,name,code}

  // city form
  const [newCity, setNewCity] = useState("");
  const [editingCity, setEditingCity] = useState(null); // {id,name}

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      const list = data.countries || [];
      setCountries(list);
      setSelectedId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list[0]?.id || null;
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selected = countries.find((c) => c.id === selectedId) || null;

  async function call(method, body, qs = "") {
    setError("");
    const res = await fetch(`/api/locations${qs}`, {
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

  async function addCountry(e) {
    e.preventDefault();
    if (!newCountry.trim()) return;
    const ok = await call("POST", {
      action: "addCountry",
      name: newCountry,
      code: newCode,
    });
    if (ok) {
      setNewCountry("");
      setNewCode("");
      await load();
    }
  }

  async function saveCountryEdit() {
    if (!editingCountry) return;
    const ok = await call("PUT", {
      action: "updateCountry",
      countryId: editingCountry.id,
      name: editingCountry.name,
      code: editingCountry.code,
    });
    if (ok) {
      setEditingCountry(null);
      await load();
    }
  }

  async function deleteCountry(id) {
    if (!confirm("Delete this country and all its cities?")) return;
    const ok = await call("DELETE", null, `?countryId=${id}`);
    if (ok) await load();
  }

  async function addCity(e) {
    e.preventDefault();
    if (!selected || !newCity.trim()) return;
    const ok = await call("POST", {
      action: "addCity",
      countryId: selected.id,
      city: newCity,
    });
    if (ok) {
      setNewCity("");
      await load();
    }
  }

  async function saveCityEdit() {
    if (!selected || !editingCity) return;
    const ok = await call("PUT", {
      action: "updateCity",
      countryId: selected.id,
      cityId: editingCity.id,
      name: editingCity.name,
    });
    if (ok) {
      setEditingCity(null);
      await load();
    }
  }

  async function deleteCity(cityId) {
    if (!selected) return;
    if (!confirm("Delete this city?")) return;
    const ok = await call("DELETE", null, `?countryId=${selected.id}&cityId=${cityId}`);
    if (ok) await load();
  }

  if (loading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg text-on-surface-variant">
        Loading locations…
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
      <h3 className="text-title-md font-title-md mb-stack-md">Countries &amp; Cities</h3>

      {error && (
        <div className="mb-stack-md px-4 py-2 rounded-lg bg-error-container text-on-error-container text-body-sm">
          {error}
        </div>
      )}

      {/* Add country */}
      <form onSubmit={addCountry} className="flex flex-wrap items-end gap-stack-sm mb-stack-md">
        <div className="space-y-base flex-1 min-w-[180px]">
          <label className="text-label-md font-label-md text-on-surface-variant">COUNTRY NAME</label>
          <input
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
            type="text"
            placeholder="e.g. Germany"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
          />
        </div>
        <div className="space-y-base w-28">
          <label className="text-label-md font-label-md text-on-surface-variant">CODE</label>
          <input
            className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-mono-sm py-2.5 px-3 uppercase"
            type="text"
            placeholder="DE"
            maxLength={3}
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Country
        </button>
      </form>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Country list */}
        <div className="col-span-12 md:col-span-5">
          <div className="border border-outline-variant rounded-xl divide-y divide-outline-variant overflow-hidden">
            {countries.length === 0 && (
              <p className="p-4 text-body-sm text-on-surface-variant">No countries yet.</p>
            )}
            {countries.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 px-4 py-3 transition-colors ${
                  selectedId === c.id ? "bg-surface-container-low" : "hover:bg-surface-container-low"
                }`}
              >
                {editingCountry?.id === c.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      className="flex-1 border border-outline-variant rounded-lg font-body-md py-1.5 px-2"
                      value={editingCountry.name}
                      onChange={(e) =>
                        setEditingCountry({ ...editingCountry, name: e.target.value })
                      }
                    />
                    <input
                      className="w-16 border border-outline-variant rounded-lg font-mono-sm py-1.5 px-2 uppercase"
                      value={editingCountry.code}
                      maxLength={3}
                      onChange={(e) =>
                        setEditingCountry({ ...editingCountry, code: e.target.value })
                      }
                    />
                    <button
                      onClick={saveCountryEdit}
                      className="text-secondary p-1 hover:bg-surface-container rounded"
                      title="Save"
                    >
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button
                      onClick={() => setEditingCountry(null)}
                      className="text-on-surface-variant p-1 hover:bg-surface-container rounded"
                      title="Cancel"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <span className="font-body-md font-bold">{c.name}</span>
                      {c.code && (
                        <span className="text-label-md font-mono-sm text-on-surface-variant px-1.5 py-0.5 bg-surface-container rounded">
                          {c.code}
                        </span>
                      )}
                      <span className="ml-auto text-label-md text-on-surface-variant">
                        {c.cities.length} {c.cities.length === 1 ? "city" : "cities"}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        setEditingCountry({ id: c.id, name: c.name, code: c.code })
                      }
                      className="text-on-surface-variant p-1 hover:bg-surface-container rounded"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button
                      onClick={() => deleteCountry(c.id)}
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

        {/* Cities for selected country */}
        <div className="col-span-12 md:col-span-7">
          {selected ? (
            <div className="border border-outline-variant rounded-xl p-4">
              <div className="flex items-center justify-between mb-stack-sm">
                <h4 className="font-body-md font-bold">
                  Cities in <span className="text-secondary">{selected.name}</span>
                </h4>
              </div>

              <form onSubmit={addCity} className="flex items-end gap-stack-sm mb-stack-md">
                <div className="space-y-base flex-1">
                  <label className="text-label-md font-label-md text-on-surface-variant">CITY NAME</label>
                  <input
                    className="w-full border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary font-body-md py-2.5 px-3"
                    type="text"
                    placeholder="e.g. Berlin"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {selected.cities.length === 0 && (
                  <p className="text-body-sm text-on-surface-variant">No cities yet.</p>
                )}
                {selected.cities.map((city) =>
                  editingCity?.id === city.id ? (
                    <div
                      key={city.id}
                      className="flex items-center gap-1 bg-surface-container rounded-lg px-2 py-1"
                    >
                      <input
                        className="border border-outline-variant rounded font-body-sm py-1 px-2 w-32"
                        value={editingCity.name}
                        onChange={(e) =>
                          setEditingCity({ ...editingCity, name: e.target.value })
                        }
                      />
                      <button
                        onClick={saveCityEdit}
                        className="text-secondary p-0.5"
                        title="Save"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                      <button
                        onClick={() => setEditingCity(null)}
                        className="text-on-surface-variant p-0.5"
                        title="Cancel"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <span
                      key={city.id}
                      className="group inline-flex items-center gap-1 bg-surface-container-low border border-outline-variant rounded-full pl-3 pr-1.5 py-1 text-body-sm"
                    >
                      {city.name}
                      <button
                        onClick={() => setEditingCity({ id: city.id, name: city.name })}
                        className="text-on-surface-variant hover:text-secondary p-0.5"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => deleteCity(city.id)}
                        className="text-on-surface-variant hover:text-error p-0.5"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </span>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-outline-variant rounded-xl p-8 text-center text-on-surface-variant">
              Select or add a country to manage its cities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

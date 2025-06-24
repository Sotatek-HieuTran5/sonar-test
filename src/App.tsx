import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import dayjs from "dayjs";
import type { Procedure, FormState, FormErrors, ModalMode } from "./types";
import ProcedureModal from "./components/ProcedureModal";
import { getProcedures, saveProcedure, deleteProcedures } from "./api";

const defaultForm: FormState = {
  name: "",
  description: "",
  query: "",
  parameters: "",
};

function App() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(
    null
  );
  const [selectedGuids, setSelectedGuids] = useState<string[]>([]);

  const handleSelect = (guid: string) => {
    setSelectedGuids((prev) =>
      prev.includes(guid) ? prev.filter((g) => g !== guid) : [...prev, guid]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedGuids(procedures.map((p) => p.guid));
    } else {
      setSelectedGuids([]);
    }
  };

  const openModal = (mode: ModalMode, proc: Procedure | null = null) => {
    setModalMode(mode);
    if (mode === "delete" && !proc) {
      setSelectedProcedure(null);
    } else if ((mode === "edit" || mode === "delete") && proc) {
      setSelectedProcedure(proc);
      setForm({
        guid: proc.guid,
        name: proc.name,
        description: proc.description || "",
        query: proc.query,
        parameters: JSON.stringify(proc.parameters, null, 2),
      });
    } else {
      setSelectedProcedure(null);
      setForm(defaultForm);
    }
    setError(null);
    setFormErrors({});
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProcedure(null);
    setForm(defaultForm);
    setError(null);
    setFormErrors({});
  };

  const fetchProcedures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProcedures();
      setProcedures(res.data.procedures || []);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response)
        setError(e.response.data?.error_msg || e.message);
      else if (e instanceof Error) setError(e.message);
      else setError("Failed to fetch procedures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (form.name.length < 1) {
      errors.name = "Procedure name cannot be empty.";
    }
    if (form.name.length > 255) {
      errors.name = "Procedure name cannot exceed 255 characters.";
    }
    if (form.description.length > 2000) {
      errors.description =
        "Procedure description cannot exceed 2,000 characters.";
    }
    if (!form.query || form.query.trim().length === 0) {
      errors.query = "Query field cannot be empty.";
    }
    if (form.parameters) {
      try {
        const params = JSON.parse(form.parameters);
        if (!Array.isArray(params)) {
          errors.parameters = "Parameters must be a valid JSON array.";
        } else {
          for (const param of params) {
            if (
              !param.type ||
              !param.key ||
              !param.name ||
              param.description === undefined
            ) {
              errors.parameters =
                "Each parameter object must include type, key, name, and description.";
              break;
            }
          }
        }
      } catch {
        errors.parameters = "Parameters must be a valid JSON string.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      await saveProcedure(form, modalMode);
      closeModal();
      fetchProcedures();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response)
        setError(e.response.data?.error_msg || e.message);
      else if (e instanceof Error) setError(e.message);
      else setError("Failed to save procedure");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const guidsToDelete = selectedProcedure
      ? [selectedProcedure.guid]
      : selectedGuids;
    if (guidsToDelete.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      await deleteProcedures(guidsToDelete);
      closeModal();
      setSelectedGuids([]);
      fetchProcedures();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response)
        setError(e.response.data?.error_msg || e.message);
      else if (e instanceof Error) setError(e.message);
      else setError("Failed to delete procedure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sonar-container">
      <div className="page-header">
        <h1>Procedures</h1>
        {selectedGuids.length > 0 ? (
          <button className="delete-btn" onClick={() => openModal("delete")}>
            Delete Selected ({selectedGuids.length})
          </button>
        ) : (
          <button className="create-btn" onClick={() => openModal("create")}>
            + Add
          </button>
        )}
      </div>

      <div className="sonar-card">
        {loading && procedures.length === 0 ? <p>Loading...</p> : null}
        <table className="sonar-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    procedures.length > 0 &&
                    selectedGuids.length === procedures.length
                  }
                  ref={(input) => {
                    if (input) {
                      input.indeterminate =
                        selectedGuids.length > 0 &&
                        selectedGuids.length < procedures.length;
                    }
                  }}
                />
              </th>
              <th>Name</th>
              <th>Description</th>
              <th>Query</th>
              <th>Parameters</th>
              <th>Owner</th>
              <th>Modified at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {procedures.map((proc) => (
              <tr
                key={proc.guid}
                className={selectedGuids.includes(proc.guid) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedGuids.includes(proc.guid)}
                    onChange={() => handleSelect(proc.guid)}
                  />
                </td>
                <td>{proc.name}</td>
                <td>{proc.description}</td>
                <td>
                  <pre>{proc.query}</pre>
                </td>
                <td>
                  <pre>{JSON.stringify(proc.parameters, null, 2)}</pre>
                </td>
                <td>{proc.owner_name}</td>
                <td>{dayjs(proc.updated).format("YYYY-MM-DD HH:mm")}</td>
                <td>
                  <button onClick={() => openModal("edit", proc)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProcedureModal
        modalMode={modalMode}
        closeModal={closeModal}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        loading={loading}
        error={error}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        selectedProcedure={selectedProcedure}
        selectedGuids={selectedGuids}
      />
    </div>
  );
}

export default App;

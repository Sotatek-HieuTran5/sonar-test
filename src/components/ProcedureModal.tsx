import React from "react";
import type { Procedure, FormState, FormErrors, ModalMode } from "../types";

interface ProcedureModalProps {
  modalMode: ModalMode;
  closeModal: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  loading: boolean;
  error: string | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  formErrors: FormErrors;
  selectedProcedure: Procedure | null;
  selectedGuids: string[];
}

const ProcedureModal: React.FC<ProcedureModalProps> = ({
  modalMode,
  closeModal,
  handleSubmit,
  handleDelete,
  loading,
  error,
  form,
  setForm,
  formErrors,
  selectedProcedure,
  selectedGuids,
}) => {
  if (!modalMode) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {modalMode === "create" && "Create Procedure"}
            {modalMode === "edit" && "Edit Procedure"}
            {modalMode === "delete" && "Confirm Deletion"}
          </h2>
          <button className="close-btn" onClick={closeModal}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {error && <p className="sonar-error">{error}</p>}
          {modalMode === "delete" ? (
            <p>
              Are you sure you want to delete{" "}
              <b>
                {selectedProcedure
                  ? `the procedure "${selectedProcedure.name}"`
                  : `${selectedGuids.length} selected procedures`}
              </b>
              ? This action cannot be undone.
            </p>
          ) : (
            <form
              id="modal-form"
              onSubmit={handleSubmit}
              className="sonar-form"
            >
              <div>
                <input
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                {formErrors.name && (
                  <p className="form-error">{formErrors.name}</p>
                )}
              </div>
              <div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
                {formErrors.description && (
                  <p className="form-error">{formErrors.description}</p>
                )}
              </div>
              <div>
                <textarea
                  name="query"
                  placeholder="Query"
                  value={form.query}
                  onChange={(e) => setForm({ ...form, query: e.target.value })}
                  required
                />
                {formErrors.query && (
                  <p className="form-error">{formErrors.query}</p>
                )}
              </div>
              <div>
                <textarea
                  name="parameters"
                  placeholder="Parameters (JSON array)"
                  value={form.parameters}
                  onChange={(e) =>
                    setForm({ ...form, parameters: e.target.value })
                  }
                />
                {formErrors.parameters && (
                  <p className="form-error">{formErrors.parameters}</p>
                )}
              </div>
            </form>
          )}
        </div>
        <div className="modal-footer">
          {modalMode === "delete" ? (
            <>
              <button
                className="cancel-btn"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : (
            <>
              <button
                className="cancel-btn"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="modal-form"
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : modalMode === "edit"
                  ? "Update Procedure"
                  : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcedureModal;

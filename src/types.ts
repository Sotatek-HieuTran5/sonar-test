export interface ProcedureParam {
  name: string;
  description: string;
  type: string;
  key: string;
}

export interface Procedure {
  guid: string;
  name: string;
  description: string | null;
  parameters: ProcedureParam[];
  query: string;
  owner_name: string;
  created: string;
  updated: string;
}

export type FormState = {
  guid?: string;
  name: string;
  description: string;
  query: string;
  parameters: string;
};

export interface FormErrors {
  name?: string;
  description?: string;
  parameters?: string;
  query?: string;
}

export type ModalMode = "create" | "edit" | "delete" | null;

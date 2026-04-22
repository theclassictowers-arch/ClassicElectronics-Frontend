export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  level?: number;
  order?: number;
  status?: 'active' | 'inactive';
  showInNavbar?: boolean;
};

export type CategoryTreeNode = AdminCategory & { children: CategoryTreeNode[] };

export type CategoryFormData = {
  name: string;
  slug: string;
  parent: string;
  level: number;
  order: number;
  status: 'active' | 'inactive';
  showInNavbar: boolean;
};

export type CategoryFormMode = 'root' | 'child' | 'edit';

export const EMPTY_CATEGORY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  parent: '',
  level: 1,
  order: 0,
  status: 'active',
  showInNavbar: true,
};

"use client";

import { Form } from "antd";
import { useCallback, useMemo, useState } from "react";
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useResetUserPassword,
  useUpdateAdminUser,
  type AdminUserCreateInput,
  type AdminUserUpdateInput,
} from "@/api";
import { useAppMessage } from "@vokcg/ui";
import type { User } from "@/types/auth";

export type UserFormValues = AdminUserCreateInput &
  AdminUserUpdateInput & {
    email?: string;
    username?: string;
    password?: string;
  };

export type UserFilters = {
  query?: string;
  is_active?: boolean;
};

export function useUsersPage() {
  const message = useAppMessage();
  const { data, isLoading, refetch } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const resetPassword = useResetUserPassword();

  const [form] = Form.useForm<UserFormValues>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<User | null>(null);

  const users = useMemo(() => data?.data ?? [], [data?.data]);

  const stats = useMemo(() => {
    const activeCount = users.filter((u) => u.is_active).length;
    const inactiveCount = users.length - activeCount;
    return { total: users.length, activeCount, inactiveCount };
  }, [users]);

  /* ── Modal helpers ─────────────────────────────────────────────── */
  const openCreate = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.setFieldsValue({
        full_name: user.full_name ?? undefined,
        is_active: user.is_active,
      });
      setModalOpen(true);
    },
    [form],
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  /* ── Drawer helpers ────────────────────────────────────────────── */
  const openDetail = useCallback((user: User) => {
    setDetailUser(user);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /* ── Password reset helpers ────────────────────────────────────── */
  const openPasswordReset = useCallback((user: User) => {
    setPwdUser(user);
    setPwdModalOpen(true);
  }, []);

  const closePasswordReset = useCallback(() => {
    setPwdModalOpen(false);
    setPwdUser(null);
  }, []);

  /* ── Mutations ─────────────────────────────────────────────────── */
  const toggleActive = useCallback(
    async (user: User) => {
      try {
        const updated = await updateUser.mutateAsync({
          id: user.id,
          body: { is_active: !user.is_active },
        });
        message.success(user.is_active ? "User deactivated" : "User activated");
        // Sync drawer state when the same user is open
        if (detailUser?.id === user.id && updated.data) {
          setDetailUser(updated.data);
        }
      } catch {
        message.error("Failed to update user status");
      }
    },
    [message, updateUser, detailUser],
  );

  const setUserActive = useCallback(
    async (user: User, active: boolean) => {
      if (user.is_active === active) return;
      try {
        const updated = await updateUser.mutateAsync({
          id: user.id,
          body: { is_active: active },
        });
        if (detailUser?.id === user.id && updated.data) {
          setDetailUser(updated.data);
        }
      } catch {
        // errors surfaced by the caller
      }
    },
    [updateUser, detailUser],
  );

  const handleDelete = useCallback(
    async (user: User) => {
      try {
        await deleteUser.mutateAsync(user.id);
        message.success("User deleted");
        if (detailUser?.id === user.id) setDrawerOpen(false);
      } catch {
        message.error("Failed to delete user");
      }
    },
    [deleteUser, message, detailUser],
  );

  const handlePasswordReset = useCallback(
    async (password: string) => {
      if (!pwdUser) return;
      try {
        await resetPassword.mutateAsync({ id: pwdUser.id, password });
        message.success("Password reset successfully");
        closePasswordReset();
      } catch {
        message.error("Failed to reset password");
      }
    },
    [pwdUser, resetPassword, message, closePasswordReset],
  );

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          body: { full_name: values.full_name, is_active: values.is_active },
        });
        message.success("User updated");
      } else {
        await createUser.mutateAsync({
          email: values.email!,
          username: values.username!,
          password: values.password!,
          full_name: values.full_name,
          is_active: values.is_active ?? true,
        });
        message.success("User created");
      }
      closeModal();
    } catch {
      message.error(editingUser ? "Failed to update user" : "Failed to create user");
    }
  }, [form, editingUser, updateUser, createUser, message, closeModal]);

  return {
    /* data */
    users,
    isLoading,
    stats,
    refetch,
    /* modal */
    form,
    modalOpen,
    editingUser,
    openCreate,
    openEdit,
    closeModal,
    /* detail drawer */
    drawerOpen,
    detailUser,
    openDetail,
    closeDrawer,
    /* password reset modal */
    pwdModalOpen,
    pwdUser,
    openPasswordReset,
    closePasswordReset,
    /* handlers */
    toggleActive,
    setUserActive,
    handleDelete,
    handlePasswordReset,
    handleSubmit,
    /* loading flags */
    isSubmitting: createUser.isPending || updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isResettingPassword: resetPassword.isPending,
    isTogglingActive: updateUser.isPending,
  };
}

'use client';

import { AdminLayoutContainer } from "./admin-layout-container";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <AdminLayoutContainer>
            {children}
        </AdminLayoutContainer>
    );
}

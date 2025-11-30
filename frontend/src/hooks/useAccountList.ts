import { useState, useEffect, useCallback } from 'react';
import { toaster } from '../components/ui/toaster';

export interface AccountDetail {
    name: string;
    account_number: number | null;
    server: string | null;
}

export interface AccountListInfo {
    accounts: AccountDetail[];
    current_account: string;
    connected: boolean;
}

export const useAccountList = () => {
    const [info, setInfo] = useState<AccountListInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [switching, setSwitching] = useState(false);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/accounts');
            if (!res.ok) throw new Error('Failed to fetch accounts');
            const data = await res.json();
            setInfo(data);
        } catch (error) {
            console.error(error);
            toaster.create({
                title: 'Error fetching accounts',
                description: String(error),
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const switchAccount = async (accountName: string) => {
        if (info?.current_account === accountName) return;

        setSwitching(true);
        try {
            const res = await fetch('/api/accounts/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account_name: accountName }),
            });

            if (!res.ok) throw new Error('Failed to switch account');

            toaster.create({
                title: 'Account switched',
                description: `Switched to ${accountName}`,
                type: 'success',
            });

            // Refresh list to update current account status
            await fetchAccounts();
        } catch (error) {
            toaster.create({
                title: 'Switch failed',
                description: String(error),
                type: 'error',
            });
        } finally {
            setSwitching(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    return {
        accounts: info?.accounts || [],
        currentAccount: info?.current_account,
        loading,
        switching,
        switchAccount,
        refreshAccounts: fetchAccounts
    };
};

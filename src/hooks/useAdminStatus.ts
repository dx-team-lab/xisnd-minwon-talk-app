import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export function useAdminStatus() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  
  const adminsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_admin');
  }, [db, user]);

  const managersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'roles_manager');
  }, [db, user]);

  const { data: admins, isLoading: isAdminLoading } = useCollection(adminsQuery);
  const { data: managers, isLoading: isManagerLoading } = useCollection(managersQuery);

  const isRoleLoading = isUserLoading || isAdminLoading || isManagerLoading;
  
  // Also check user profile role as a fallback
  const isAdmin = !!(user && admins && admins.some(a => a.id === user.uid));
  const isManager = !!(user && managers && managers.some(m => m.id === user.uid));

  return { 
    isAdmin, 
    isManager, 
    isRoleLoading,
    user
  };
}

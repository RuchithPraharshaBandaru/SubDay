import { useState, useEffect, useCallback } from 'react';
import { 
  fetchSubscriptions, 
  addSubscription, 
  updateSubscription, 
  deleteSubscription 
} from '../services/firebase';

export const useSubscriptions = (user) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const checkDueSoon = useCallback((subs) => {
    const activeSubs = subs.filter(s => s.status !== 'Canceled');
    const today = new Date().getDate();
    const dueSoon = activeSubs.filter(s => s.day === today || s.day === today + 1);
    
    if (dueSoon.length > 0 && Notification.permission === "granted") {
      new Notification("SubDay Alert", { 
        body: `You have ${dueSoon.length} payments due soon!` 
      });
    }
  }, []);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) return;
      setDataLoading(true);
      try {
        const data = await fetchSubscriptions(user.uid);
        setSubscriptions(data);
        checkDueSoon(data);
      } catch (error) {
        console.error("Error fetching subs:", error);
      } finally {
        setDataLoading(false);
      }
    };

    loadSubscriptions();
  }, [user, checkDueSoon]);

  const handleAdd = async (subData) => {
    try {
      const newSub = await addSubscription(subData);
      setSubscriptions(prev => [...prev, newSub]);
      return newSub;
    } catch (error) {
      console.error("Error adding:", error);
      throw error;
    }
  };

  const handleUpdate = async (id, subData) => {
    try {
      await updateSubscription(id, subData);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, ...subData } : sub)
      );
    } catch (error) {
      console.error("Error updating:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subscription completely?")) return;
    
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    try {
      await deleteSubscription(id);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return {
    subscriptions,
    dataLoading,
    handleAdd,
    handleUpdate,
    handleDelete
  };
};

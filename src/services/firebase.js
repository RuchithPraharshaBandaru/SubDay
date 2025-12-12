import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';

export const fetchSubscriptions = async (userId) => {
  const q = query(collection(db, "subscriptions"), where("uid", "==", userId));
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  data.sort((a, b) => a.day - b.day);
  return data;
};

export const addSubscription = async (subscriptionData) => {
  const docRef = await addDoc(collection(db, "subscriptions"), {
    ...subscriptionData,
    createdAt: new Date()
  });
  return { id: docRef.id, ...subscriptionData };
};

export const updateSubscription = async (id, subscriptionData) => {
  await updateDoc(doc(db, "subscriptions", id), subscriptionData);
  return { id, ...subscriptionData };
};

export const deleteSubscription = async (id) => {
  await deleteDoc(doc(db, "subscriptions", id));
};

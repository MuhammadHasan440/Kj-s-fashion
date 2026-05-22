// js/firebase.js - Updated with Base64 support
/* ============================================
   KJ'S FASHION — FIREBASE CONFIGURATION
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyBMaqLlJcorPkqCePj99ywMvSkMIy8v-A4",
  authDomain: "kj-s-fashion-619e1.firebaseapp.com",
  projectId: "kj-s-fashion-619e1",
  storageBucket: "kj-s-fashion-619e1.firebasestorage.app",
  messagingSenderId: "332164856636",
  appId: "1:332164856636:web:b570441e72725b446f7c39",
  measurementId: "G-NVXEY16L72"
};
let db;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }
    
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
    return true;
}

// Firestore utility functions
const FirebaseDB = {
    products: {
        async getAll() {
            const snapshot = await db.collection('products').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getByCategory(category) {
            const snapshot = await db.collection('products')
                .where('category', '==', category)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async getFeatured() {
            const snapshot = await db.collection('products')
                .where('featured', '==', true)
                .limit(8)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async add(product) {
            product.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            product.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('products').add(product);
            return docRef.id;
        },
        
        async update(id, product) {
            product.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('products').doc(id).update(product);
        },
        
        async delete(id) {
            await db.collection('products').doc(id).delete();
        },
        
        async getById(id) {
            const doc = await db.collection('products').doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        }
    },
    
    orders: {
        async getAll() {
            const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        
        async add(order) {
            order.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('orders').add(order);
            return docRef.id;
        },
        
        async updateStatus(id, status) {
            await db.collection('orders').doc(id).update({ 
                status, 
                updatedAt: firebase.firestore.FieldValue.serverTimestamp() 
            });
        },
        
        async delete(id) {
            await db.collection('orders').doc(id).delete();
        }
    },
    
    stats: {
        async getCounts() {
            const productsSnap = await db.collection('products').get();
            const ordersSnap = await db.collection('orders').get();
            
            let totalRevenue = 0;
            ordersSnap.docs.forEach(doc => {
                const data = doc.data();
                totalRevenue += parseFloat(data.amount) || 0;
            });
            
            const customers = new Set();
            ordersSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.customerPhone) customers.add(data.customerPhone);
            });
            
            return {
                products: productsSnap.size,
                orders: ordersSnap.size,
                revenue: totalRevenue,
                customers: customers.size
            };
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}


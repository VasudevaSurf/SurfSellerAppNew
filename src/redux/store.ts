import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productsReducer from "./slices/productsSlice";
import productDetailsReducer from "./slices/productDetailsSlice";
import ordersReducer from "./slices/ordersSlice";
import orderDetailsReducer from "./slices/orderDetailsSlice";
import profileReducer from "./slices/profileSlice";
import initializerReducer from "./slices/initializerSlice";
import categoriesReducer from "./slices/categoriesSlice"; // Add this import

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    orders: ordersReducer,
    orderDetails: orderDetailsReducer,
    profile: profileReducer,
    initializer: initializerReducer,
    categories: categoriesReducer, // Add this reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

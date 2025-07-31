import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <AuthContext.Provider value={{ data, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

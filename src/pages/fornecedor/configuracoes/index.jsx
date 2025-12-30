import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import HeaderChildren from "../../../components/headerChildrenSupllier";
import { FaUser, FaHome, FaUniversity } from "react-icons/fa";

import axios from "axios";

import FormPersonal from "./forms/formPersonal/formPersonal";
import FormAddress from "./forms/formAddress/formAddress";
import FormBank from "./forms/formBank/formBank";

function Configuracoes() {
  const [activeForm, setActiveForm] = useState("personal");

  const [supplierData, setSupplierData] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await axios.get(`${API_URL}auth/supplier`);

        setSupplierData(response.data);
      } catch (error) {
        console.log("Erro ao buscar supplier:", error);
      }
    };

    fetchSupplier();
  }, [API_URL]);

  const cards = [
    {
      id: "personal",
      title: "Informações Pessoais",
      icon: <FaUser className={styles.icon} />,
      form: <FormPersonal />,
    },
    {
      id: "address",
      title: "Endereço",
      icon: <FaHome className={styles.icon} />,
      form: <FormAddress />,
    },
    {
      id: "bank",
      title: "Conta Bancária",
      icon: <FaUniversity className={styles.icon} />,
      form: <FormBank />,
    },
  ];

  return (
    <div className={styles.container}>
      <HeaderChildren titulo="Configurações" />

      <div className={styles.cardsContainer}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`${styles.card} ${
              activeForm === card.id ? styles.activeCard : ""
            }`}
            onClick={() => setActiveForm(card.id)}
          >
            {card.icon}
            <h4>{card.title}</h4>
          </div>
        ))}
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formContainer}>
          {activeForm === "personal" && (
            <FormPersonal supplierData={supplierData} setSupplierData={setSupplierData} />
          )}

          {activeForm === "address" && (
            <FormAddress supplierData={supplierData} setSupplierData={setSupplierData} />
          )}

          {activeForm === "bank" && <FormBank supplierData={supplierData} setSupplierData={setSupplierData} />}
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;

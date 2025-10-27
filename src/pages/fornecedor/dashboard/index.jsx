import { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiStar,
} from "react-icons/fi";
import { AuthContext } from "../../../context/authContext";

// 🔹 Componente de Card
function Card({ icon: Icon, title, value, colorClass }) {
  return (
    <div className={`${styles.card} ${colorClass}`}>
      <div className={styles.cardContent}>
        <div className={styles.icon}>
          <Icon />
        </div>
        <div>
          <h3>{title}</h3>
          <p className={styles.value}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function FornecedorDashboard() {
  const { user, token } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("Jan");
  const [viewType, setViewType] = useState("anual"); // "anual" ou "mensal"

  const allMonths = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const monthMap = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get(`${API_URL}dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const years = [...new Set(data.monthlySales.map((m) => m.year))].sort();
        setSelectedYear(years[years.length - 1]);

        // Define o mês atual ao carregar
        const currentMonthIndex = new Date().getMonth(); // 0 = Jan, 1 = Fev ...
        setSelectedMonth(allMonths[currentMonthIndex]);

        setMetrics(data);
      } catch (err) {
        console.error("Erro ao buscar dashboard:", err);
        setErrorMsg(
          "Erro ao carregar o dashboard. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboard();
  }, [API_URL, token]);

  if (loading) return <p className={styles.loading}>Carregando dados...</p>;
  if (errorMsg) return <p className={styles.error}>{errorMsg}</p>;
  if (!metrics) return <p className={styles.error}>Nenhum dado disponível.</p>;

  // 🔹 Preparar dados do gráfico
  let chartData = [];

  if (viewType === "anual") {
    chartData = allMonths.map((month, index) => {
      const item = metrics.monthlySales.find(
        (m) =>
          m.year === selectedYear && monthMap[m.month.toLowerCase()] === index
      );
      return {
        month,
        sales: item?.sales || 0,
        revenue: item ? Number(item.revenue.toFixed(2)) : 0,
      };
    });
  } else if (viewType === "mensal") {
    const dailyData =
      metrics.dailySales?.[selectedYear]?.[selectedMonth.toLowerCase()] || [];

    // Descobrir quantos dias tem o mês selecionado
    const monthIndex = allMonths.indexOf(selectedMonth);
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();

    // Normaliza todos os dias
    chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const item = dailyData.find((d) => d.day === day);
      return {
        month: day.toString(),
        sales: item?.sales || 0,
        revenue: item?.revenue || 0,
      };
    });
  }

  const averageTicket =
    metrics.deliveredBudgets > 0
      ? (metrics.totalRevenue / metrics.deliveredBudgets).toFixed(2)
      : "0.00";

  const yearsAvailable = [
    ...new Set(metrics.monthlySales.map((m) => m.year)),
  ].sort();

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Dashboard do Fornecedor</h1>
          <p className={styles.subtitle}>
            Acompanhe suas vendas, faturamento e desempenho geral
          </p>
        </div>
        <div className={styles.profile}>
          <p>{user?.name}</p>
          <p>{user?.email}</p>
        </div>
      </header>

      {/* Cards */}
      <section className={styles.cards}>
        <Card
          icon={FiShoppingBag}
          title="Total de Vendas"
          value={metrics.totalBudgets}
          colorClass={styles.cardBlue}
        />
        <Card
          icon={FiDollarSign}
          title="Faturamento Total"
          value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          colorClass={styles.cardGreen}
        />
        <Card
          icon={FiTrendingUp}
          title="Crescimento Mensal"
          value={`+${metrics.growth}%`}
          colorClass={styles.cardPurple}
        />
        <Card
          icon={FiClock}
          title="Orçamentos Pendentes"
          value={metrics.pendingBudgets}
          colorClass={styles.cardOrange}
        />
        <Card
          icon={FiDollarSign}
          title="Ticket Médio"
          value={`R$ ${averageTicket.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          colorClass={styles.cardYellow}
        />
      </section>

      {/* Filtro de Ano / Mês / Tipo de visualização */}
      <div className={styles.yearFilter}>
        <label>Visualização: </label>
        <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
          <option value="anual">Anual</option>
          <option value="mensal">Mensal</option>
        </select>

        {viewType === "anual" && (
          <>
            <label>Ano: </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearsAvailable.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </>
        )}

        {viewType === "mensal" && (
          <>
            <label>Ano: </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearsAvailable.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <label>Mês: </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {allMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Gráficos */}
      <section className={styles.chartSection}>
        <h2>
          {viewType === "anual"
            ? `Vendas por Mês - ${selectedYear}`
            : `Vendas por Dia - ${selectedMonth} ${selectedYear}`}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="sales"
              name="Vendas"
              fill="#3b82f6"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className={styles.chartSection}>
        <h2>
          {viewType === "anual"
            ? `Comparativo Vendas x Receita - ${selectedYear}`
            : `Comparativo Vendas x Receita Diário - ${selectedMonth} ${selectedYear}`}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              name="Vendas"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              name="Receita (R$)"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* 🔹 Ranking de produtos */}
      <div className={styles.topProducts}>
        <h2>Produtos Mais Vendidos</h2>
        {metrics.topProducts.map((p, i) => (
          <div key={p.id} className={styles.progressItem}>
            <div className={styles.progressHeader}>
              <span>
                {i + 1}. {p.name}
              </span>
              <span>{p.sales} vendas</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(p.sales / metrics.topProducts[0].sales) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Últimas atividades */}
      <div className={styles.recentActivity}>
        <h2>Últimas Atividades</h2>
        <ul>
          {metrics.recentActivity.map((item) => (
            <li key={item.id}>
              <span>{item.action}</span>:{" "}
              {item.description.replace(/\\"/g, '"')}{" "}
              <em>({new Date(item.createdAt).toLocaleString()})</em>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔹 Indicadores de performance */}
      {/* <div className={styles.statsFooter}>
        <p>
          <strong>Taxa de entrega no prazo:</strong>{" "}
          {metrics.performance.onTimeRate}%
        </p>
        <p>
          <strong>Avaliação média:</strong> <FiStar />{" "}
          {metrics.performance.rating}/5
        </p>
        <p>
          <strong>Tempo médio de produção:</strong>{" "}
          {metrics.performance.avgProductionTime} dias
        </p>
      </div> */}
    </div>
  );
}

export default FornecedorDashboard;

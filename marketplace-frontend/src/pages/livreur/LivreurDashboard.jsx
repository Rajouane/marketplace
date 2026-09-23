import React, { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

// ======================================================
// STAT CARD
// ======================================================

function StatCard({ title, value, description, icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// STATUS BAR
// ======================================================

function StatusBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ======================================================
// DONUT CHART
// ======================================================

function DeliveryDonut({
  pending,
  inProgress,
  delivered,
  failed,
}) {
  const total = pending + inProgress + delivered + failed;

  const pendingPercent = total > 0 ? (pending / total) * 100 : 0;
  const inProgressPercent =
    total > 0 ? (inProgress / total) * 100 : 0;
  const deliveredPercent =
    total > 0 ? (delivered / total) * 100 : 0;

  const first = pendingPercent;
  const second = first + inProgressPercent;
  const third = second + deliveredPercent;

  const gradient =
    total === 0
      ? "conic-gradient(#e2e8f0 0% 100%)"
      : `conic-gradient(
          #f59e0b 0% ${first}%,
          #3b82f6 ${first}% ${second}%,
          #10b981 ${second}% ${third}%,
          #ef4444 ${third}% 100%
        )`;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex h-52 w-52 items-center justify-center rounded-full"
        style={{ background: gradient }}
      >
        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-3xl font-bold text-slate-900">
            {total}
          </span>

          <span className="text-xs text-slate-400">
            Livraisons
          </span>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// LEGEND ITEM
// ======================================================

function LegendItem({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${color}`}
        />

        <span className="text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

// ======================================================
// BAR CHART
// ======================================================

function DeliveryBarChart({
  pending,
  inProgress,
  delivered,
  failed,
}) {
  const values = [
    {
      label: "Attente",
      value: pending,
      color: "bg-amber-500",
    },
    {
      label: "En cours",
      value: inProgress,
      color: "bg-blue-500",
    },
    {
      label: "Livrées",
      value: delivered,
      color: "bg-emerald-500",
    },
    {
      label: "Échecs",
      value: failed,
      color: "bg-red-500",
    },
  ];

  const maxValue = Math.max(
    ...values.map((item) => item.value),
    1
  );

  return (
    <div className="flex h-64 items-end justify-between gap-4">
      {values.map((item) => {
        const height =
          item.value > 0
            ? Math.max((item.value / maxValue) * 100, 8)
            : 4;

        return (
          <div
            key={item.label}
            className="flex h-full flex-1 flex-col items-center justify-end"
          >
            <div className="mb-2 text-sm font-semibold text-slate-700">
              {item.value}
            </div>

            <div className="flex h-44 w-full items-end justify-center">
              <div
                className={`w-full max-w-14 rounded-t-xl ${item.color} transition-all duration-500`}
                style={{ height: `${height}%` }}
              />
            </div>

            <p className="mt-3 text-xs font-medium text-slate-500">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ======================================================
// DELIVERY CARD
// ======================================================

function DeliveryCard({ delivery }) {
  const statusConfig = {
    livree: {
      label: "Livrée",
      className: "bg-emerald-100 text-emerald-700",
    },

    en_cours: {
      label: "En cours",
      className: "bg-blue-100 text-blue-700",
    },

    recuperee: {
      label: "Récupérée",
      className: "bg-indigo-100 text-indigo-700",
    },

    echec: {
      label: "Échec",
      className: "bg-red-100 text-red-700",
    },

    en_attente: {
      label: "En attente",
      className: "bg-amber-100 text-amber-700",
    },
  };

  const config = statusConfig[delivery.statut] || {
    label: delivery.statut,
    className: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
          🚚
        </div>

        <div>
          <p className="font-semibold text-slate-900">
            Livraison #{delivery.id}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Commande #{delivery.order_id}
          </p>
        </div>
      </div>

      <span
        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    </div>
  );
}

// ======================================================
// MAIN DASHBOARD
// ======================================================

export default function LivreurDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ====================================================
  // LOAD DELIVERIES
  // ====================================================

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      const response = await api.get("/deliveries");

      setDeliveries(response.data);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des livraisons :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // ====================================================
  // STATISTICS
  // ====================================================

  const total = deliveries.length;

  const pending = deliveries.filter(
    (delivery) => delivery.statut === "en_attente"
  ).length;

  const inProgress = deliveries.filter(
    (delivery) =>
      delivery.statut === "recuperee" ||
      delivery.statut === "en_cours"
  ).length;

  const delivered = deliveries.filter(
    (delivery) => delivery.statut === "livree"
  ).length;

  const failed = deliveries.filter(
    (delivery) => delivery.statut === "echec"
  ).length;

  const recovered = deliveries.filter(
    (delivery) => delivery.statut === "recuperee"
  ).length;

  const successRate =
    total > 0
      ? Math.round((delivered / total) * 100)
      : 0;

  const recentDeliveries = deliveries.slice(0, 5);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 overflow-hidden rounded-2xl bg-[#0b1736] p-7 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-slate-300">
                Espace livreur
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Tableau de bord
              </h1>

              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Suivez vos livraisons, votre activité et votre
                performance en temps réel.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDeliveries}
              disabled={loading}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0b1736] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Actualisation..." : "Actualiser"}
            </button>
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#0b1736]" />

            <p className="mt-4 text-sm text-slate-500">
              Chargement des livraisons...
            </p>
          </div>
        ) : (
          <>
            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total livraisons"
                value={total}
                description="Livraisons affectées"
                icon="🚚"
                accent="bg-slate-100"
              />

              <StatCard
                title="En attente"
                value={pending}
                description="À prendre en charge"
                icon="⏳"
                accent="bg-amber-100"
              />

              <StatCard
                title="En cours"
                value={inProgress}
                description="Livraisons actives"
                icon="📦"
                accent="bg-blue-100"
              />

              <StatCard
                title="Livrées"
                value={delivered}
                description="Livraisons terminées"
                icon="✓"
                accent="bg-emerald-100"
              />

            </div>

            {/* ==================================================
                CHARTS
            ================================================== */}

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

              {/* BAR CHART */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Activité des livraisons
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Répartition de vos livraisons par statut.
                  </p>
                </div>

                <DeliveryBarChart
                  pending={pending}
                  inProgress={inProgress}
                  delivered={delivered}
                  failed={failed}
                />

              </section>

              {/* DONUT CHART */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Répartition
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Vue globale des statuts.
                  </p>
                </div>

                <div className="grid items-center gap-8 md:grid-cols-2">

                  <DeliveryDonut
                    pending={pending}
                    inProgress={inProgress}
                    delivered={delivered}
                    failed={failed}
                  />

                  <div className="space-y-4">

                    <LegendItem
                      label="En attente"
                      value={pending}
                      color="bg-amber-500"
                    />

                    <LegendItem
                      label="En cours"
                      value={inProgress}
                      color="bg-blue-500"
                    />

                    <LegendItem
                      label="Livrées"
                      value={delivered}
                      color="bg-emerald-500"
                    />

                    <LegendItem
                      label="Échecs"
                      value={failed}
                      color="bg-red-500"
                    />

                  </div>

                </div>

              </section>

            </div>

            {/* ==================================================
                STATUS PROGRESS
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Progression des livraisons
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Suivez la répartition de votre activité.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">

                <StatusBar
                  label="En attente"
                  value={pending}
                  total={total}
                  color="bg-amber-500"
                />

                <StatusBar
                  label="En cours"
                  value={inProgress}
                  total={total}
                  color="bg-blue-500"
                />

                <StatusBar
                  label="Livrées"
                  value={delivered}
                  total={total}
                  color="bg-emerald-500"
                />

                <StatusBar
                  label="Échecs"
                  value={failed}
                  total={total}
                  color="bg-red-500"
                />

              </div>

            </section>

            {/* ==================================================
                PERFORMANCE
            ================================================== */}

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Taux de réussite
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {successRate}%
                  </span>

                  <span className="mb-1 text-sm text-slate-400">
                    livrées
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${successRate}%`,
                    }}
                  />
                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Livraisons récupérées
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {recovered}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Commandes récupérées auprès des vendeurs
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <p className="text-sm font-medium text-slate-500">
                  Livraisons échouées
                </p>

                <p className="mt-3 text-3xl font-bold text-red-600">
                  {failed}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Livraisons nécessitant une attention
                </p>

              </div>

            </div>

            {/* ==================================================
                RECENT DELIVERIES
            ================================================== */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Dernières livraisons
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Les cinq dernières livraisons affectées.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {total} livraison{total > 1 ? "s" : ""}
                </span>

              </div>

              {recentDeliveries.length === 0 ? (

                <div className="p-12 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                    🚚
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Aucune livraison
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Aucune livraison ne vous a encore été affectée.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {recentDeliveries.map((delivery) => (
                    <DeliveryCard
                      key={delivery.id}
                      delivery={delivery}
                    />
                  ))}

                </div>

              )}

            </section>

          </>
        )}

      </div>
    </DashboardLayout>
  );
}
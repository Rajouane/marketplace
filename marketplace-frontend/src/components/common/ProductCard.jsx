import { useNavigate } from "react-router-dom";

function ProductCard({
  product,
  showActions = true,
  showAddToCart = false,
  adding = false,
  onAddToCart,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  const price = Number(product?.prix || 0);

  const promotionalPrice =
    product?.prix_promotionnel !== null &&
    product?.prix_promotionnel !== undefined &&
    product?.prix_promotionnel !== ""
      ? Number(product.prix_promotionnel)
      : null;

  const image = product?.images?.[0]?.chemin;

  const getImageUrl = (path) => {
    if (!path) {
      return null;
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `http://127.0.0.1:8000/storage/${path}`;
  };

  const imageUrl = getImageUrl(image);

  const getStatusLabel = (status) => {
    switch (status) {
      case "publie":
        return "Publié";

      case "brouillon":
        return "Brouillon";

      case "en_attente":
        return "En attente";

      case "rejete":
        return "Rejeté";

      default:
        return status || "Inconnu";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "publie":
        return "bg-emerald-50 text-emerald-700";

      case "brouillon":
        return "bg-slate-100 text-slate-600";

      case "en_attente":
        return "bg-amber-50 text-amber-700";

      case "rejete":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const handleView = () => {
    navigate(`/client/products/${product.id}`);
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* IMAGE */}

      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-100">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nom}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              🛍️
            </div>

            <span className="text-xs">
              Aucune image
            </span>
          </div>
        )}

        {promotionalPrice !== null &&
          promotionalPrice < price && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              Promotion
            </span>
          )}

        {product.statut && (
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
              product.statut
            )}`}
          >
            {getStatusLabel(product.statut)}
          </span>
        )}

      </div>

      {/* CONTENT */}

      <div className="p-5">

        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="truncate text-xs font-medium text-slate-400">
            {product.category?.nom || "Sans catégorie"}
          </span>

          {product.marque && (
            <span className="truncate text-xs font-medium text-slate-500">
              {product.marque}
            </span>
          )}
        </div>

        <h3 className="truncate text-lg font-semibold text-slate-900">
          {product.nom}
        </h3>

        {product.shop?.nom && (
          <p className="mt-1 truncate text-xs text-slate-400">
            Boutique : {product.shop.nom}
          </p>
        )}

        {/* PRICE */}

        <div className="mt-4">

          {promotionalPrice !== null &&
          promotionalPrice < price ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">
                {promotionalPrice.toFixed(2)} DH
              </span>

              <span className="text-sm text-slate-400 line-through">
                {price.toFixed(2)} DH
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-slate-900">
              {price.toFixed(2)} DH
            </span>
          )}

        </div>

        {/* STOCK */}

        <div className="mt-3">
          {Number(product.stock) > 0 ? (
            <span className="text-xs font-medium text-emerald-600">
              {product.stock} produit(s) disponible(s)
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">
              Rupture de stock
            </span>
          )}
        </div>

        {/* ACTIONS */}

        {showActions && (
          <div className="mt-5 flex gap-2">

            {showAddToCart && (
              <button
                type="button"
                onClick={() => onAddToCart?.(product)}
                disabled={
                  adding ||
                  Number(product.stock) <= 0
                }
                className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding
                  ? "Ajout..."
                  : Number(product.stock) <= 0
                  ? "Rupture"
                  : "Ajouter"}
              </button>
            )}

            <button
              type="button"
              onClick={handleView}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Modifier
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
              >
                Supprimer
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default ProductCard;
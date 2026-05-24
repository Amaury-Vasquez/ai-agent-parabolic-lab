"use client";
import clsx from "clsx";
import { Check, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DaisyUITheme,
  DEFAULT_THEME,
  isValidTheme,
  THEME_OPTIONS,
} from "@/constants/themes";
import { useUpdateUsuario } from "@/mutations/useUpdateUsuario";
import { useMe } from "@/queries/useMe";

const ThemeSwatch = ({ theme }: { theme: DaisyUITheme }) => (
  <div
    data-theme={theme}
    className="flex items-center gap-1 rounded-md bg-base-100 p-2 shadow-inner"
  >
    <span className="size-2 rounded-full bg-primary" />
    <span className="size-2 rounded-full bg-secondary" />
    <span className="size-2 rounded-full bg-accent" />
    <span className="size-2 rounded-full bg-neutral" />
  </div>
);

const ThemeSwitcher = () => {
  const { data: user } = useMe();
  const updateUsuario = useUpdateUsuario();
  const [pendingTheme, setPendingTheme] = useState<DaisyUITheme | null>(null);

  const savedTheme: DaisyUITheme = isValidTheme(user?.temapreferido)
    ? user.temapreferido
    : DEFAULT_THEME;
  const selectedTheme = pendingTheme ?? savedTheme;
  const isSaving = updateUsuario.isPending;

  // Only release the optimistic selection once the refetched user data
  // confirms the change — avoids a brief flash to the previous theme between
  // mutation success and the useMe refetch completing.
  useEffect(() => {
    if (pendingTheme && savedTheme === pendingTheme) {
      setPendingTheme(null);
    }
  }, [pendingTheme, savedTheme]);

  const handleSelect = (theme: DaisyUITheme) => {
    if (theme === selectedTheme || isSaving) return;
    document.documentElement.dataset.theme = theme;
    setPendingTheme(theme);
    updateUsuario.mutate(
      { temapreferido: theme },
      {
        onError: () => {
          document.documentElement.dataset.theme = savedTheme;
          setPendingTheme(null);
        },
      },
    );
  };

  return (
    <div className="bg-base-200 rounded-lg p-6">
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Palette size={24} />
          Tema de la aplicación
        </h2>
        <div aria-live="polite" className="flex items-center gap-2 text-sm h-6">
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              <span className="opacity-70">Guardando tema…</span>
            </>
          ) : updateUsuario.isSuccess ? (
            <>
              <Check size={16} className="text-success" />
              <span className="opacity-70">Tema guardado</span>
            </>
          ) : null}
        </div>
      </div>
      <p className="mb-4 opacity-70">
        Elige un tema para personalizar tu experiencia. Se aplica al instante y
        se guarda en tu perfil.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {THEME_OPTIONS.map(({ id, label }) => {
          const isSelected = id === selectedTheme;
          const isInactive = isSaving && !isSelected;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelect(id)}
              aria-disabled={isSaving}
              aria-pressed={isSelected}
              className={clsx(
                "flex items-center gap-3 rounded-lg border p-3 transition-all text-left",
                isSelected
                  ? "border-primary ring-2 ring-primary/40 bg-base-100"
                  : "border-base-300 bg-base-100",
                !isSaving &&
                  !isSelected &&
                  "cursor-pointer hover:border-primary/50",
                isInactive &&
                  "cursor-not-allowed opacity-40 grayscale bg-base-300",
                isSaving && isSelected && "cursor-progress animate-pulse",
              )}
            >
              <ThemeSwatch theme={id} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm capitalize truncate">
                  {label}
                </p>
                <p className="text-xs opacity-50 truncate">{id}</p>
              </div>
            </button>
          );
        })}
      </div>

      {updateUsuario.isError ? (
        <p className="text-error text-sm mt-4">
          No se pudo guardar el tema. Intenta de nuevo.
        </p>
      ) : null}
    </div>
  );
};

export default ThemeSwitcher;

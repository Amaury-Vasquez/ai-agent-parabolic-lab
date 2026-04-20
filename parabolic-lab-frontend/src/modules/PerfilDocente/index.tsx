"use client";
import { Button, Input } from "amvasdev-ui";
import { Edit2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchUpdateUsuario,
  fetchUpdateDocente,
  fetchInstitucion,
  fetchUpdateInstitucion,
  ME_QUERY_KEY,
  DOCENTE_QUERY_KEY,
  Institucion,
} from "@/fetchers/auth";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { useMe } from "@/queries/useMe";
import { useDocente } from "@/queries/useDocente";

const PerfilDocente = () => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: docente, isLoading: isLoadingDocente } = useDocente();
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state for profile
  const [formData, setFormData] = useState({
    nombre: "",
    apellidopaterno: "",
    apellidomaterno: "",
    gradoacademico: "",
  });

  // Form state for institution
  const [institutionForm, setInstitutionForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
  });

  // Initialize form data when user/docente data loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nombre: user.nombre || "",
        apellidopaterno: user.apellidopaterno || "",
        apellidomaterno: user.apellidomaterno || "",
      }));

      // Fetch institution data
      if (token) {
        fetchInstitucion(token, user.idinstitucion)
          .then((inst) => {
            setInstitucion(inst);
            setInstitutionForm({
              nombre: inst.nombre || "",
              direccion: inst.direccion || "",
              telefono: inst.telefono || "",
            });
          })
          .catch((err) => {
            console.error("Error fetching institution:", err);
          });
      }
    }
  }, [user, token]);

  // Update gradoacademico when docente data loads
  useEffect(() => {
    if (docente) {
      setFormData((prev) => ({
        ...prev,
        gradoacademico: docente.gradoacademico || "",
      }));
    }
  }, [docente]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstitutionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInstitutionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = useCallback(async () => {
    if (!token || !user) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const profilePromises: Promise<unknown>[] = [];

      // Update usuario
      profilePromises.push(
        fetchUpdateUsuario(token, {
          nombre: formData.nombre,
          apellidopaterno: formData.apellidopaterno,
          apellidomaterno: formData.apellidomaterno,
        }),
      );

      // Update docente if user is docente
      if (user.tipousuario === "docente") {
        profilePromises.push(
          fetchUpdateDocente(token, {
            gradoacademico: formData.gradoacademico,
          }),
        );
      }

      await Promise.all(profilePromises);

      // Invalidate and refetch user data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: DOCENTE_QUERY_KEY }),
      ]);

      setSaveMessage({
        type: "success",
        text: "Perfil actualizado correctamente",
      });
      setIsEditingProfile(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al guardar cambios";
      setSaveMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  }, [token, user, formData, queryClient]);

  const handleSaveInstitution = useCallback(async () => {
    if (!token || !user) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await fetchUpdateInstitucion(token, user.idinstitucion, {
        nombre: institutionForm.nombre,
        direccion: institutionForm.direccion,
        telefono: institutionForm.telefono,
      });

      // Refetch institution data
      const updatedInst = await fetchInstitucion(token, user.idinstitucion);
      setInstitucion(updatedInst);

      setSaveMessage({
        type: "success",
        text: "Institución actualizada correctamente",
      });
      setIsEditingInstitution(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al guardar cambios";
      setSaveMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  }, [token, user, institutionForm]);

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    if (user && docente) {
      setFormData({
        nombre: user.nombre || "",
        apellidopaterno: user.apellidopaterno || "",
        apellidomaterno: user.apellidomaterno || "",
        gradoacademico: docente.gradoacademico || "",
      });
    }
  };

  const handleCancelInstitution = () => {
    setIsEditingInstitution(false);
    if (institucion) {
      setInstitutionForm({
        nombre: institucion.nombre || "",
        direccion: institucion.direccion || "",
        telefono: institucion.telefono || "",
      });
    }
  };

  const isLoading = isLoadingUser || (user?.tipousuario === "docente" && isLoadingDocente);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-center text-error">No se pudo cargar la información del usuario</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      {/* Success/Error Message */}
      {saveMessage && (
        <div className={`alert mb-6 ${saveMessage.type === "success" ? "alert-success" : "alert-error"}`}>
          <p>{saveMessage.text}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-base-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Información Personal</h2>
          {!isEditingProfile && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
              <Edit2 size="16" />
              Editar
            </Button>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Nombre</span>
              </label>
              <p className="text-base">{user.nombre}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Apellido Paterno</span>
              </label>
              <p className="text-base">{user.apellidopaterno}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Apellido Materno</span>
              </label>
              <p className="text-base">{user.apellidomaterno || "-"}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Correo Electrónico</span>
              </label>
              <p className="text-base">{user.email}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Tipo de Usuario</span>
              </label>
              <p className="text-base capitalize">{user.tipousuario}</p>
            </div>

            {user.tipousuario === "docente" && (
              <div>
                <label className="label">
                  <span className="label-text font-medium">Grado Académico</span>
                </label>
                <p className="text-base">{docente?.gradoacademico || "-"}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Nombre</span>
              </label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Juan"
                value={formData.nombre}
                onChange={handleProfileInputChange}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Apellido Paterno</span>
              </label>
              <Input
                id="apellidopaterno"
                name="apellidopaterno"
                placeholder="García"
                value={formData.apellidopaterno}
                onChange={handleProfileInputChange}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Apellido Materno</span>
              </label>
              <Input
                id="apellidomaterno"
                name="apellidomaterno"
                placeholder="Martínez"
                value={formData.apellidomaterno}
                onChange={handleProfileInputChange}
              />
            </div>

            {user.tipousuario === "docente" && (
              <div>
                <label className="label">
                  <span className="label-text">Grado Académico</span>
                </label>
                <Input
                  id="gradoacademico"
                  name="gradoacademico"
                  placeholder="Maestría en Física"
                  value={formData.gradoacademico}
                  onChange={handleProfileInputChange}
                />
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button variant="ghost" onClick={handleCancelProfile} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Institution Section - Only for docente/admin */}
      {(user.tipousuario === "docente" || user.tipousuario === "admin") && institucion && (
        <div className="bg-base-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Información de la Institución</h2>
            {!isEditingInstitution && user.tipousuario === "admin" && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingInstitution(true)}>
                <Edit2 size="16" />
                Editar
              </Button>
            )}
          </div>

          {!isEditingInstitution ? (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Nombre de Institución</span>
                </label>
                <p className="text-base">{institucion.nombre}</p>
              </div>

              {user.tipousuario === "admin" && (
                <>
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Dirección</span>
                    </label>
                    <p className="text-base">{institucion.direccion || "-"}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Teléfono</span>
                    </label>
                    <p className="text-base">{institucion.telefono || "-"}</p>
                  </div>
                </>
              )}
            </div>
          ) : user.tipousuario === "admin" ? (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Nombre de Institución</span>
                </label>
                <Input
                  id="inst-nombre"
                  name="nombre"
                  placeholder="Colegio Nacional"
                  value={institutionForm.nombre}
                  onChange={handleInstitutionInputChange}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Dirección</span>
                </label>
                <Input
                  id="inst-direccion"
                  name="direccion"
                  placeholder="Calle Principal 123"
                  value={institutionForm.direccion}
                  onChange={handleInstitutionInputChange}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Teléfono</span>
                </label>
                <Input
                  id="inst-telefono"
                  name="telefono"
                  placeholder="(555) 123-4567"
                  value={institutionForm.telefono}
                  onChange={handleInstitutionInputChange}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="primary"
                  onClick={handleSaveInstitution}
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelInstitution}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PerfilDocente;
